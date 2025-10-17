"use client";

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";

export function StorageTest() {
  const { user, firebaseUser } = useAuth();
  const [status, setStatus] = useState("");
  const [downloadURL, setDownloadURL] = useState("");

  const testStorage = async () => {
    if (!user || !firebaseUser) {
      setStatus("User not authenticated");
      return;
    }

    try {
      setStatus("Testing storage...");

      // Log storage configuration
      console.log("Storage instance:", storage);
      console.log("Storage bucket:", storage.app.options.storageBucket);

      // Create a simple test file
      const testBlob = new Blob(["Test content for storage verification"], {
        type: "text/plain",
      });
      const fileName = `test/${firebaseUser.uid}/test-file-${Date.now()}.txt`;
      const storageRef = ref(storage, fileName);

      console.log("Uploading to:", fileName);
      await uploadBytes(storageRef, testBlob);

      const url = await getDownloadURL(storageRef);
      setDownloadURL(url);
      setStatus(`Storage test successful!`);

      console.log("Download URL:", url);
    } catch (error: any) {
      console.error("Storage test error:", error);
      setStatus(`Storage Error: ${error.message}`);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4">
      <h3 className="font-semibold mb-2">Storage Test</h3>
      <Button onClick={testStorage} variant="outline" size="sm">
        Test Storage
      </Button>
      <div className="mt-2 text-sm">
        <p>Status: {status}</p>
        {downloadURL && (
          <p className="text-primary">
            URL:{" "}
            <a href={downloadURL} target="_blank" rel="noopener noreferrer">
              {downloadURL}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
