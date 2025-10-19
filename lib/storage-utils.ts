import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface StorageError {
  code: string;
  message: string;
}

/**
 * Upload an image file to Firebase Storage with comprehensive error handling
 * @param file - The file to upload
 * @param userId - The user ID for organizing files
 * @param folder - Optional folder name (default: 'items')
 * @returns Promise with upload result
 */
export async function uploadImage(
  file: File,
  userId: string,
  folder: string = "items"
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File is too large. Please choose a file smaller than 10MB.",
      };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "Please select a valid image file.",
      };
    }

    // Create storage reference
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${userId}/${fileName}`);

    console.log("Uploading file to:", storageRef.fullPath);
    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Try to upload the file
    try {
      const uploadResult = await uploadBytes(storageRef, file);
      console.log("Upload completed:", uploadResult);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL:", downloadURL);

      return { success: true, url: downloadURL };
    } catch (uploadError: any) {
      console.error("Upload failed:", uploadError);

      // Check if it's a CORS error
      if (isCorsError(uploadError)) {
        console.warn("CORS error detected, providing fallback...");
        return {
          success: false,
          error:
            "Unable to upload image due to CORS restrictions. The item will be added without an image.",
        };
      }

      // Handle other upload errors
      throw uploadError;
    }
  } catch (error: any) {
    console.error("Storage upload error:", error);

    // Handle specific Firebase Storage errors
    const errorCode = error.code || "unknown";
    const errorMessage = error.message || "Upload failed";

    let userMessage = "Upload failed. Please try again.";

    switch (errorCode) {
      case "storage/unauthorized":
        userMessage =
          "You don't have permission to upload files. Please check your authentication.";
        break;
      case "storage/canceled":
        userMessage = "Upload was canceled.";
        break;
      case "storage/unknown":
        userMessage = "An unknown error occurred during upload.";
        break;
      case "storage/invalid-format":
        userMessage = "Invalid file format. Please choose a valid image file.";
        break;
      case "storage/invalid-checksum":
        userMessage = "File corruption detected. Please try uploading again.";
        break;
      case "storage/invalid-event-name":
        userMessage = "Invalid upload event. Please try again.";
        break;
      case "storage/invalid-url":
        userMessage = "Invalid storage URL. Please contact support.";
        break;
      case "storage/invalid-argument":
        userMessage =
          "Invalid file or parameters. Please check your file and try again.";
        break;
      case "storage/no-default-bucket":
        userMessage = "Storage bucket not configured. Please contact support.";
        break;
      case "storage/cannot-slice-blob":
        userMessage = "File cannot be processed. Please try a different file.";
        break;
      case "storage/server-file-wrong-size":
        userMessage = "File size mismatch. Please try uploading again.";
        break;
      case "storage/network-request-failed":
        userMessage =
          "Network error. Please check your connection and try again.";
        break;
      case "storage/retry-limit-exceeded":
        userMessage =
          "Upload timed out. Please check your connection and try again.";
        break;
      default:
        userMessage = `Upload failed: ${errorMessage}`;
    }

    return { success: false, error: userMessage };
  }
}

/**
 * Check if an error is related to CORS
 * @param error - The error to check
 * @returns boolean indicating if it's a CORS error
 */
function isCorsError(error: any): boolean {
  if (!error || !error.message) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("cors") ||
    message.includes("preflight") ||
    message.includes("blocked by cors policy") ||
    message.includes("access control") ||
    (error.code === "storage/network-request-failed" &&
      message.includes("fetch"))
  );
}

/**
 * Delete an image from Firebase Storage
 * @param imageUrl - The URL of the image to delete
 * @returns Promise with deletion result
 */
export async function deleteImage(imageUrl: string): Promise<UploadResult> {
  try {
    if (!imageUrl) {
      return { success: false, error: "No image URL provided" };
    }

    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);

    if (!pathMatch) {
      return { success: false, error: "Invalid image URL format" };
    }

    const filePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, filePath);

    await deleteObject(storageRef);
    console.log("Image deleted successfully:", filePath);

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting image:", error);
    return {
      success: false,
      error: `Failed to delete image: ${error.message || "Unknown error"}`,
    };
  }
}

/**
 * Validate file before upload
 * @param file - The file to validate
 * @returns Validation result
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File is too large. Please choose a file smaller than 10MB.",
    };
  }

  // Check file type
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "Please select a valid image file (PNG, JPG, GIF, etc.).",
    };
  }

  // Check file name
  if (!file.name || file.name.trim() === "") {
    return {
      valid: false,
      error: "File must have a valid name.",
    };
  }

  return { valid: true };
}
