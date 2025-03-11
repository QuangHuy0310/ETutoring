"use client";

import React, { useState } from "react";
import Layout from "@/app/componets/layout";
import PostForm from "@/app/Blog/form";

interface BlogPost {
  id: number;
  author: string;
  title: string;
  content: string;
  file?: File | null;
  createdAt: number;
}

const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const HomePage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addPost = (post: { author: string; title: string; content: string; file?: File | null }) => {
    setPosts([{ id: Date.now(), createdAt: Date.now(), ...post }, ...posts]);
    setIsModalOpen(false);
  };

  return (
    <Layout> {/* Đảm bảo Layout chiếm full height */}
      <div className="flex flex-col min-h-[calc(100vh-6.9rem)] bg-[#0B0F19] text-white w-full">
        
        {/* Modal PostForm */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#1E2432] p-6 rounded-lg shadow-lg">
              <PostForm onPost={addPost} onClose={() => setIsModalOpen(false)} />
            </div>
          </div>
        )}

        {/* Nội dung Blog */}
        <div className="flex-1 flex flex-col w-full bg-[#1E2432] border border-[#2A4E89] rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">All Blogs</h2>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg">
              Create Blog
            </button>
          </div>

          {/* Danh sách bài viết */}
          <div className="flex-1 overflow-y-auto">
            {posts.length === 0 ? (
              <div className="w-full flex items-center justify-center text-gray-400 rounded-lg">
                No posts yet
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="p-4 border border-[#2A4E89] rounded-lg">
                    {/* Avatar + Tên + Thời Gian */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-500 rounded-full"></div>
                      <div>
                        <p className="text-white font-bold">{post.author}</p>
                        <p className="text-gray-400 text-sm">{formatTime(post.createdAt)}</p>
                      </div>
                    </div>

                    {/* Tiêu đề */}
                    <h3 className="text-lg font-bold mt-2">{post.title}</h3>

                    {/* Nội dung */}
                    <p className="text-gray-300">{post.content}</p>

                    {/* File đính kèm */}
                    {post.file && <p className="text-sm text-gray-400">📎 Attached File: {post.file.name}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
