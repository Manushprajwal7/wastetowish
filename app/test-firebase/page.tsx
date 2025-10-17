"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";

export default function TestFirebasePage() {
  const { user, firebaseUser } = useAuth();
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<any[]>([]);

  const testWrite = async () => {
    if (!user || !firebaseUser) {
      setStatus("User not authenticated");
      return;
    }

    try {
      setStatus("Writing test item...");
      const docRef = await addDoc(collection(db, "items"), {
        title: "Test Item",
        description: "This is a test item",
        category: "Other",
        condition: "Good",
        ownerId: firebaseUser.uid,
        ownerName: user.name,
        status: "available",
        createdAt: Date.now(),
      });
      setStatus(`Successfully wrote item with ID: ${docRef.id}`);

      // Read items back
      await testRead();
    } catch (error: any) {
      console.error("Error writing document:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const testStorage = async () => {
    if (!user || !firebaseUser) {
      setStatus("User not authenticated");
      return;
    }

    try {
      setStatus("Testing storage...");
      // Create a simple test file
      const testBlob = new Blob(["Test content"], { type: "text/plain" });
      const storageRef = ref(storage, `test/${firebaseUser.uid}/test-file.txt`);
      await uploadBytes(storageRef, testBlob);
      const url = await getDownloadURL(storageRef);
      setStatus(`Storage test successful. URL: ${url}`);
    } catch (error: any) {
      console.error("Storage test error:", error);
      setStatus(`Storage Error: ${error.message}`);
    }
  };

  const testRead = async () => {
    try {
      setStatus("Reading items...");
      const querySnapshot = await getDocs(collection(db, "items"));
      const itemsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsData);
      setStatus(`Successfully read ${itemsData.length} items`);
    } catch (error: any) {
      console.error("Error reading documents:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (user) {
      testRead();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Firebase Test</h1>

        {!user ? (
          <p>Please sign in to test Firebase functionality</p>
        ) : (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
              <div className="flex gap-4 flex-wrap">
                <Button onClick={testWrite}>Write Test Item</Button>
                <Button onClick={testRead} variant="outline">
                  Read Items
                </Button>
                <Button onClick={testStorage} variant="outline">
                  Test Storage
                </Button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Status</h2>
              <p className="p-4 bg-muted rounded">{status || "Ready"}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Items ({items.length})
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-border rounded"
                  >
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="text-xs mt-2">ID: {item.id}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
