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
  comments: { author: string; content: string }[];
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
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  
  // Giả sử user đang đăng nhập (có thể lấy từ Auth API)
  const [currentUser] = useState({ name: "Nguyễn Văn A" });

  const addPost = (post: { author: string; title: string; content: string; file?: File | null }) => {
    setPosts([{ id: Date.now(), createdAt: Date.now(), comments: [], ...post }, ...posts]);
    setIsModalOpen(false);
  };

  const addComment = (postId: number) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, { author: currentUser.name, content: comment }] }
          : post
      )
    );

    setCommentInputs({ ...commentInputs, [postId]: "" }); // Reset input sau khi comment
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-[calc(100vh-6.9rem)] bg-[#0B0F19] text-white w-full">
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#1E2432] p-6 rounded-lg shadow-lg">
              <PostForm onPost={addPost} onClose={() => setIsModalOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col w-full bg-[#1E2432] border border-[#2A4E89] rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">All Blogs</h2>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg">
              Create Blog
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {posts.length === 0 ? (
              <div className="w-full flex items-center justify-center text-gray-400 rounded-lg">No posts yet</div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="p-4 border border-[#2A4E89] rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-500 rounded-full"></div>
                      <div>
                        <p className="text-white font-bold">{post.author}</p>
                        <p className="text-gray-400 text-sm">{formatTime(post.createdAt)}</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold mt-2">{post.title}</h3>
                    <p className="text-gray-300">{post.content}</p>
                    {post.file && <p className="text-sm text-gray-400">📎 Attached File: {post.file.name}</p>}

                    {/* Khu vực comment */}
                    <div className="mt-4 border-t border-gray-600 pt-2">
                      <h4 className="text-sm text-gray-400">Comments:</h4>
                      <div className="space-y-2">
                        {post.comments.length === 0 ? (
                          <p className="text-gray-500 text-sm">No comments yet</p>
                        ) : (
                          post.comments.map((comment, index) => (
                            <p key={index} className="text-gray-300 text-sm bg-[#2A4E89] p-2 rounded-md">
                              <span className="font-bold text-white">{comment.author}:</span> {comment.content}
                            </p>
                          ))
                        )}
                      </div>

                      {/* Input comment */}
                      <div className="flex mt-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          className="flex-1 p-2 bg-[#2A4E89] text-white rounded-l-md"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                          }
                        />
                        <button
                          onClick={() => addComment(post.id)}
                          className="px-4 bg-blue-600 hover:bg-blue-700 rounded-r-md"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                    {/* End khu vực comment */}
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
