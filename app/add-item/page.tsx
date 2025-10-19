"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StorageTest } from "@/components/storage-test";

// Only import Supabase functions conditionally to avoid build errors
let uploadImageToSupabase: Function | null = null;
let createItem: Function | null = null;
let SupabaseItem: any = null;

try {
  // Dynamically import Supabase utilities only on client side
  const supabaseUtils = require("@/lib/supabase-utils");
  const supabaseTypes = require("@/lib/supabase");
  uploadImageToSupabase = supabaseUtils.uploadImageToSupabase;
  createItem = supabaseUtils.createItem;
  SupabaseItem = supabaseTypes.SupabaseItem;
} catch (error) {
  console.warn("Supabase utilities not available during build time");
}

export default function AddItemPage() {
  const { user, firebaseUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    condition: "Good",
    location: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const categories = [
    "Books",
    "Electronics",
    "Furniture",
    "Clothing",
    "Kitchen",
    "Sports",
    "Other",
  ];
  const conditions = ["Like New", "Good", "Fair", "Poor"];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file before setting it
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError("File is too large. Please choose a file smaller than 10MB.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const testAddDoc = async () => {
    if (!user || !firebaseUser) {
      console.log("User not authenticated");
      setError("You must be logged in to add an item");
      return;
    }

    // Check if Supabase is available
    if (!createItem) {
      setError("Supabase is not configured. Item creation is disabled.");
      return;
    }

    console.log("Testing Supabase item creation...");
    try {
      const testItem: any = {
        title: "Test Item",
        description: "This is a test item",
        category: "Other",
        condition: "Good",
        location: "",
        owner_id: firebaseUser.uid,
        owner_name: user.name || firebaseUser.displayName || "Unknown User",
        status: "available",
      };

      console.log("Test item data:", testItem);
      const result = await createItem(testItem);

      if (result.success) {
        console.log("Test item added with ID:", result.data.id);
        setSuccess("Test item added successfully!");
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error("Error in test item creation:", err);
      setError(`Test failed: ${err.message || "Please try again."}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");

    if (!user || !firebaseUser) {
      console.log("User not authenticated");
      setError("You must be logged in to add an item");
      return;
    }

    // Check if Supabase is available
    if (!createItem) {
      setError("Supabase is not configured. Item creation is disabled.");
      return;
    }

    // Validate form data
    if (!formData.title.trim()) {
      setError("Please enter an item title");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a description");
      return;
    }

    if (!formData.category) {
      setError("Please select a category");
      return;
    }

    if (!formData.condition) {
      setError("Please select a condition");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);
    console.log("Form data:", formData);
    console.log("User:", user);
    console.log("Firebase User:", firebaseUser);

    try {
      let imageURL = "";

      if (imageFile && uploadImageToSupabase) {
        try {
          console.log("Uploading image to Supabase...");
          const uploadResult = await uploadImageToSupabase(
            imageFile,
            firebaseUser.uid
          );

          console.log("Image upload result:", uploadResult);

          if (uploadResult.success && uploadResult.url) {
            imageURL = uploadResult.url;
            console.log("Image uploaded successfully, URL:", imageURL);
            setSuccess("Image uploaded successfully!");
          } else if (uploadResult.error) {
            console.warn("Image upload failed:", uploadResult.error);
            // Don't stop the submission, just continue without the image
            setError(`Note: ${uploadResult.error}`);
            console.log("Continuing without image due to upload error");
          }
        } catch (storageError: any) {
          console.error("Error uploading image:", storageError);
          // Don't stop the submission, just continue without the image
          setError(
            `Note: Image upload failed - ${
              storageError.message || "continuing without image"
            }`
          );
          console.log("Continuing without image due to upload error");
        }
      }

      console.log("Adding item to Supabase...");
      const itemData: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        location: formData.location,
        image_url: imageURL || undefined,
        owner_id: firebaseUser.uid,
        owner_name: user.name || firebaseUser.displayName || "Unknown User",
        status: "available",
      };

      console.log("Item data to be saved:", itemData);
      const result = await createItem(itemData);

      if (result.success) {
        console.log("Item added with ID:", result.data.id);

        // Show success message before redirecting
        setSuccess("Item added successfully!");

        // Redirect to dashboard after a short delay to show success message
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error("Error adding item:", err);
      console.error("Error details:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
      });
      setError(`Failed to add item: ${err.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      {!user ? (
        <div className="flex items-center justify-center min-h-screen">
          <p>Please sign in to add items</p>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8">Donate an Item</h1>

            {error && !error.includes("Note:") && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-destructive">
                {error}
              </div>
            )}

            {error && error.includes("Note:") && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 text-yellow-500">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 text-green-500">
                {success}
              </div>
            )}

            <form
              onSubmit={(e) => {
                console.log("Form onSubmit triggered");
                handleSubmit(e);
              }}
              className="space-y-6"
              onKeyPress={(e) => {
                if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                  e.preventDefault();
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Item Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Vintage Bookshelf"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the item, its condition, and why you're giving it away..."
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Condition *
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {conditions.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Downtown, City Center"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Item Photo
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-input"
                  />
                  <label htmlFor="image-input" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-32 h-32 object-cover mx-auto rounded"
                        />
                        <p className="text-sm text-muted-foreground">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                {imageFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {imageFile.name} (
                    {(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                  onClick={() => console.log("Publish button clicked")}
                >
                  {loading ? "Publishing..." : "Publish Item"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log("Cancel button clicked");
                    router.back();
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
