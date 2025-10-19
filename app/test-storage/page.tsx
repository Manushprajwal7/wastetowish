"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-context";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TestStoragePage() {
  const { user, firebaseUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    url?: string;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const testUpload = async () => {
    if (!file || !firebaseUser) {
      setUploadResult({
        success: false,
        error: "No file selected or user not authenticated",
      });
      return;
    }

    setLoading(true);
    setUploadResult(null);

    try {
      console.log("Testing direct Supabase storage upload...");

      // Get Supabase client safely
      let supabase;
      try {
        supabase = getSupabaseClient();
      } catch (error) {
        console.error("Supabase not initialized:", error);
        setUploadResult({
          success: false,
          error: "Supabase is not configured. Storage test unavailable.",
        });
        return;
      }

      // Test listing buckets
      console.log("Listing buckets...");
      const { data: buckets, error: bucketsError } =
        await supabase.storage.listBuckets();
      console.log("Buckets:", buckets, "Error:", bucketsError);

      // Test if bucket exists
      const bucketExists = buckets?.find((b) => b.name === "item-images");
      console.log("item-images bucket exists:", bucketExists);

      // Generate file name
      const fileName = `${firebaseUser.uid}/test-${Date.now()}.jpg`;
      console.log("Uploading to:", fileName);

      // Upload file
      const { data, error } = await supabase.storage
        .from("item-images")
        .upload(fileName, file);

      console.log("Upload result:", data, "Error:", error);

      if (error) {
        setUploadResult({ success: false, error: error.message });
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("item-images").getPublicUrl(fileName);

      console.log("Public URL:", publicUrl);
      setUploadResult({ success: true, url: publicUrl });
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase Storage Test</h1>

        {!user || !firebaseUser ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive">Please sign in to test storage</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Image
              </label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <Button
              onClick={testUpload}
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? "Uploading..." : "Test Upload"}
            </Button>

            {uploadResult && (
              <div
                className={`p-4 rounded-lg ${
                  uploadResult.success
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-destructive/10 border border-destructive/20"
                }`}
              >
                <h3 className="font-semibold mb-2">
                  {uploadResult.success ? "Success" : "Error"}
                </h3>
                {uploadResult.success ? (
                  <div>
                    <p className="mb-2">File uploaded successfully!</p>
                    {uploadResult.url && (
                      <div>
                        <p className="text-sm mb-2">Public URL:</p>
                        <a
                          href={uploadResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-all"
                        >
                          {uploadResult.url}
                        </a>
                        <div className="mt-4">
                          <img
                            src={uploadResult.url}
                            alt="Uploaded test"
                            className="max-w-full h-auto rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-destructive">{uploadResult.error}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
