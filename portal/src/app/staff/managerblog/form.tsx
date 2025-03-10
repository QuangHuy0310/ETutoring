"use client";

import React, { useState } from "react";

interface BlogFormProps {
  onSubmit: (blog: { actor: string; content: string }) => void;
}

const ManagerBlogForm: React.FC<BlogFormProps> = ({ onSubmit }) => {
  const [actor, setActor] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actor && content) {
      onSubmit({ actor, content });
      setActor("");
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md text-black">
      <h2 className="text-lg font-semibold mb-2">Create New Blog</h2>
      <input
        type="text"
        className="border p-2 w-full mb-2"
        placeholder="Actor"
        value={actor}
        onChange={(e) => setActor(e.target.value)}
      />
      <textarea
        className="border p-2 w-full mb-2"
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Post Blog
      </button>
    </form>
  );
};

export default ManagerBlogForm;
