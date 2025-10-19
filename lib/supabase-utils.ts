import { supabase, SupabaseItem } from "./supabase";

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param userId - The user ID for organizing files
 * @returns Promise with upload result
 */
export async function uploadImageToSupabase(file: File, userId: string) {
  try {
    console.log("Starting image upload to Supabase Storage...");
    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    });

    // Validate file
    if (!file) {
      console.warn("No file provided for upload");
      return { success: false, error: "No file provided" };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.warn("File too large:", file.size);
      return {
        success: false,
        error: "File is too large. Please choose a file smaller than 10MB.",
      };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.warn("Invalid file type:", file.type);
      return {
        success: false,
        error: "Please select a valid image file.",
      };
    }

    // Create file name with timestamp
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    console.log("Generated file name:", fileName);

    // Check if the bucket exists and is accessible
    console.log("Checking if bucket 'item-images' exists...");
    try {
      const { data: buckets, error: listBucketsError } =
        await supabase.storage.listBuckets();
      if (listBucketsError) {
        console.error("Error listing buckets:", listBucketsError);
      } else {
        console.log("Available buckets:", buckets);
        const itemImagesBucket = buckets?.find(
          (bucket) => bucket.name === "item-images"
        );
        if (itemImagesBucket) {
          console.log("Found item-images bucket:", itemImagesBucket);
        } else {
          console.warn("item-images bucket not found");
          return {
            success: false,
            error:
              "Storage bucket 'item-images' not found. Please create it in your Supabase dashboard.",
          };
        }
      }
    } catch (bucketError) {
      console.error("Error checking buckets:", bucketError);
    }

    // Upload file to Supabase Storage
    console.log("Uploading file to Supabase storage bucket: item-images");
    const { data, error } = await supabase.storage
      .from("item-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);

      // Provide more specific error messages
      if (error.message && error.message.includes("row-level security")) {
        return {
          success: false,
          error:
            "Storage access denied. Please check your storage bucket policies in the Supabase dashboard.",
        };
      }

      return {
        success: false,
        error: `Failed to upload image: ${error.message || "Unknown error"}`,
      };
    }

    console.log("File uploaded successfully:", data);

    // Get public URL for the uploaded image
    console.log("Getting public URL for uploaded file");
    const {
      data: { publicUrl },
    } = supabase.storage.from("item-images").getPublicUrl(fileName);

    console.log("Public URL generated:", publicUrl);
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error("Image upload error:", error);
    return {
      success: false,
      error: `Upload failed: ${error.message || "Please try again."}`,
    };
  }
}

/**
 * Create a new item in Supabase
 * @param item - The item data to insert
 * @returns Promise with creation result
 */
export async function createItem(item: SupabaseItem) {
  try {
    console.log("Creating item with data:", item);

    // Since we're using Firebase Auth, we need to bypass RLS restrictions
    // by using the service role key or adjusting policies
    const { data, error } = await supabase
      .from("items")
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error("Supabase item creation error:", error);
      return {
        success: false,
        error: `Failed to create item: ${error.message || "Unknown error"}`,
      };
    }

    console.log("Item created successfully:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("Item creation error:", error);
    return {
      success: false,
      error: `Creation failed: ${error.message || "Please try again."}`,
    };
  }
}

/**
 * Get items by owner ID
 * @param ownerId - The owner ID to filter by
 * @returns Promise with items array
 */
export async function getItemsByOwner(ownerId: string) {
  try {
    console.log("Fetching items for owner:", ownerId);
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase get items error:", error);
      return {
        success: false,
        error: `Failed to fetch items: ${error.message || "Unknown error"}`,
      };
    }

    console.log("Items fetched successfully:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("Get items error:", error);
    return {
      success: false,
      error: `Fetch failed: ${error.message || "Please try again."}`,
    };
  }
}

/**
 * Get all items (for marketplace)
 * @returns Promise with items array
 */
export async function getAllItems() {
  try {
    console.log("Fetching all items");
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase get all items error:", error);
      return {
        success: false,
        error: `Failed to fetch items: ${error.message || "Unknown error"}`,
      };
    }

    console.log("All items fetched successfully:", data?.length);
    return { success: true, data };
  } catch (error: any) {
    console.error("Get all items error:", error);
    return {
      success: false,
      error: `Fetch failed: ${error.message || "Please try again."}`,
    };
  }
}
