"use client";

import type React from "react";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StorageTest } from "@/components/storage-test";

export default function AddItemPage() {
  const { user, firebaseUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

    console.log("Testing direct addDoc call...");
    try {
      const testItem = {
        title: "Test Item",
        description: "This is a test item",
        category: "Other",
        condition: "Good",
        ownerId: firebaseUser.uid,
        ownerName: user.name || firebaseUser.displayName || "Unknown User",
        status: "available",
        createdAt: Date.now(),
      };

      console.log("Test item data:", testItem);
      const docRef = await addDoc(collection(db, "items"), testItem);
      console.log("Test document added with ID:", docRef.id);
      alert("Test item added successfully!");
    } catch (err: any) {
      console.error("Error in test addDoc:", err);
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
    setLoading(true);
    console.log("Form data:", formData);
    console.log("User:", user);
    console.log("Firebase User:", firebaseUser);

    try {
      let imageURL = "";

      if (imageFile) {
        try {
          console.log("Uploading image...");
          const storageRef = ref(
            storage,
            `items/${firebaseUser.uid}/${Date.now()}_${imageFile.name}`
          );
          await uploadBytes(storageRef, imageFile);
          imageURL = await getDownloadURL(storageRef);
          console.log("Image uploaded, URL:", imageURL);
        } catch (storageError: any) {
          console.error("Error uploading image:", storageError);
          // Don't stop the submission, just continue without the image
          console.log("Continuing without image due to upload error");
        }
      }

      console.log("Adding document to Firestore...");
      const itemData = {
        ...formData,
        ownerId: firebaseUser.uid,
        ownerName: user.name || firebaseUser.displayName || "Unknown User",
        imageURL,
        status: "available",
        createdAt: Date.now(),
      };

      console.log("Item data to be saved:", itemData);
      const docRef = await addDoc(collection(db, "items"), itemData);

      console.log("Document added with ID:", docRef.id);

      // Show success message before redirecting
      alert("Item added successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error adding item:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
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

            <div className="mb-4">
              <Link
                href="/test-firebase"
                className="text-sm text-primary hover:underline"
              >
                Firebase Test Page
              </Link>
            </div>

            <StorageTest />

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-destructive">
                {error}
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
                    console.log("Testing direct addDoc call");
                    testAddDoc();
                  }}
                >
                  Test
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
