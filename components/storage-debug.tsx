"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadImage, validateFile } from "@/lib/storage-utils";
import { useAuth } from "@/components/auth-context";

export function StorageDebug() {
  const { firebaseUser } = useAuth();
  const [testFile, setTestFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTestFile(file);
      setUploadResult("");
    }
  };

  const testUpload = async () => {
    if (!testFile || !firebaseUser) {
      setUploadResult("No file selected or user not authenticated");
      return;
    }

    setLoading(true);
    setUploadResult("Testing upload...");

    try {
      // Validate file first
      const validation = validateFile(testFile);
      if (!validation.valid) {
        setUploadResult(`Validation failed: ${validation.error}`);
        setLoading(false);
        return;
      }

      // Test upload
      const result = await uploadImage(testFile, firebaseUser.uid, "test");

      if (result.success) {
        setUploadResult(`✅ Upload successful! URL: ${result.url}`);
      } else {
        setUploadResult(`❌ Upload failed: ${result.error}`);
      }
    } catch (error: any) {
      setUploadResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <h3 className="font-semibold">Firebase Storage Debug</h3>

      <div>
        <label className="block text-sm font-medium mb-2">
          Test File Upload
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
        />
      </div>

      {testFile && (
        <div className="text-sm text-muted-foreground">
          <p>File: {testFile.name}</p>
          <p>Size: {(testFile.size / 1024).toFixed(2)} KB</p>
          <p>Type: {testFile.type}</p>
        </div>
      )}

      <Button
        onClick={testUpload}
        disabled={!testFile || !firebaseUser || loading}
        className="w-full"
      >
        {loading ? "Testing..." : "Test Upload"}
      </Button>

      {uploadResult && (
        <div
          className={`p-3 rounded text-sm ${
            uploadResult.includes("✅")
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <pre className="whitespace-pre-wrap">{uploadResult}</pre>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p>User ID: {firebaseUser?.uid || "Not authenticated"}</p>
        <p>Storage Path: test/{firebaseUser?.uid}/</p>
      </div>
    </div>
  );
}
