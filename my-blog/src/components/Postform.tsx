'use client'
import { useState } from "react";

export default function PostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const [video, setVideo] = useState<File | null>(null);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
          Avatar
        </div>
        <input
          type="text"
          placeholder="Tiêu đề bài viết..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      
      <textarea
        placeholder="Nội dung bài viết..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-40 mt-4 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      ></textarea>

      
      <div className="flex gap-4 mt-4">
        <label className="w-32 h-12 bg-gray-200 flex items-center justify-center rounded-md cursor-pointer">
          File
          <input
            type="file"
            className="hidden"
            // onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
        <label className="w-32 h-12 bg-gray-200 flex items-center justify-center rounded-md cursor-pointer">
          Video
          <input
            type="file"
            accept="video/*"
            className="hidden"
            // onChange={(e) => setVideo(e.target.files?.[0] || null)}
          />
        </label>
      </div>

     
      <button className="mt-6 w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        POST
      </button>
    </div>
  );
}
