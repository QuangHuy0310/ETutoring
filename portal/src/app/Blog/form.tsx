"use client";

import React, { useState } from "react";
import Image from "next/image"; // Import Next.js Image

interface User {
  id: number;
  name: string;
}

interface PostFormProps {
  user: User;
  onPost: (post: { title: string; content: string; imageUrl?: string }) => void;
  onClose: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ user, onPost, onClose }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const accessToken = localStorage.getItem("accessToken");
  
    if (!accessToken) {
      setError("You must be logged in to upload images.");
      return;
    }
  
    setIsUploading(true);
    setError("");
  
    try {
      const response = await fetch("http://localhost:3002/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
  
      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
  
      const result = await response.json(); // ✅ Parse JSON đúng cách
      if (result.data && result.data.fileUrl) {
        setImageUrl(result.data.fileUrl); // ✅ Lưu đúng URL ảnh
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      setError("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file!");
      return;
    }

    handleUpload(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }

    onPost({ title, content, imageUrl: imageUrl || undefined });

    // Reset state
    setTitle("");
    setContent("");
    setImageUrl(null);
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1E2432] p-6 rounded-lg w-[500px] flex flex-col space-y-4">
      {/* User Info */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-500 rounded-full"></div>
        <div>
          <p className="text-white font-bold">{user.name}</p>
          <p className="text-gray-400 text-sm">Just now</p>
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Title Input */}
      <input
        type="text"
        placeholder="Title"
        className="p-2 bg-[#2A4E89] text-white rounded-md"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Content Input */}
      <textarea
        placeholder="Write your blog here..."
        className="p-2 bg-[#2A4E89] text-white rounded-md h-40"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* File Upload */}
      <input type="file" accept="image/*" className="text-white" onChange={handleFileChange} disabled={isUploading} />

      {isUploading && <p className="text-gray-400">Uploading image...</p>}

      {/* Image Preview */}
      {imageUrl && (
        <div className="mt-2">
          <p className="text-gray-400 text-sm">Image Preview:</p>
          <Image
            src={imageUrl}
            alt="Preview"
            width={500}
            height={300}
            className="mt-2 max-w-full h-auto rounded-lg shadow-lg"
            unoptimized
          />
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between">
        <button type="button" className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg" onClick={onClose}>
          Close
        </button>
        <button 
          type="submit" 
          className={`px-4 py-2 rounded-lg ${isUploading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Post"}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
