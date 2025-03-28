"use client";

import React, { useState } from "react";
import Image from "next/image"; 

interface User {
  id: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      const result = await response.json();
      if (result.data && result.data.fileUrl) {
        setImageUrl(result.data.fileUrl);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("You must be logged in to create a blog.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const postData = {
      tags: [title], // 🟢 Map title → tags
      caption: content, // 🟢 Map content → caption
      path: imageUrl ? [imageUrl] : [], // 🟢 Map imageUrl → path
    };

    try {
      const response = await fetch("http://localhost:3002/api/v1/blog/new-blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error(`Failed to create blog: ${response.statusText}`);

      const newPost = await response.json();
      onPost({ title, content, imageUrl: imageUrl || undefined });


      setTitle("");
      setContent("");
      setImageUrl(null);
      setError("");
      onClose();
    } catch (error) {
      setError("Failed to create blog.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1E2432] p-6 rounded-lg w-[500px] flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-500 rounded-full"></div>
        <div>
          <p className="text-white font-bold">{user.name}</p>
          <p className="text-gray-400 text-sm">Just now</p>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Title"
        className="p-2 bg-[#2A4E89] text-white rounded-md"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Write your blog here..."
        className="p-2 bg-[#2A4E89] text-white rounded-md h-40"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <input type="file" accept="image/*" className="text-white" onChange={handleFileChange} disabled={isUploading} />

      {isUploading && <p className="text-gray-400">Uploading image...</p>}

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

      <div className="flex justify-between">
        <button type="button" className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg" onClick={onClose}>
          Close
        </button>
        <button 
          type="submit" 
          className={`px-4 py-2 rounded-lg ${
            isUploading || isSubmitting ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={isUploading || isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
