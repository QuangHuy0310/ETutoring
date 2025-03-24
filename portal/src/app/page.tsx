"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import Image của Next.js
import Layout from "@/app/componets/layout";
import PostForm from "@/app/Blog/form";

interface User {
  id: string;
  name: string;
}

interface BlogPost {
  id: number;
  user: User; 
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: number;
  comments: { user: User; content: string }[]; 
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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
      } else {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        setUser({ id: payload.id, name: payload.name });
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 1000); // Kiểm tra mỗi giây

    return () => clearInterval(interval);
  }, [router]);

  if (!user) {
    return null; 
  }

  const addPost = (post: { title: string; content: string; imageUrl?: string }) => {
    setPosts((prevPosts) => [
      { id: Date.now(), createdAt: Date.now(), comments: [], user, ...post }, // ✅ 
      ...prevPosts,
    ]);
    setIsModalOpen(false);
  };

  const addComment = (postId: number) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, { user, content: comment }] } 
          : post
      )
    );
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-screen bg-[#0B0F19] text-white w-full">
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#1E2432] p-6 rounded-lg shadow-lg">
              <PostForm user={user} onPost={addPost} onClose={() => setIsModalOpen(false)} />
            </div>
          </div>
        )}

        <div className="p-6 bg-[#1E2432] border border-[#2A4E89] rounded-lg shadow-md">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">All Blogs</h2>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg">
              Create Blog
            </button>
          </div>

          {posts.length === 0 ? (
            <p className="text-gray-400">No posts yet</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-4 border border-[#2A4E89] rounded-lg bg-[#161b25] mb-4">
                <div className="flex items-center mb-2">
                  <span className="font-bold text-white">{post.user.name}</span>
                  <span className="text-gray-400 text-sm ml-2">{formatTime(post.createdAt)}</span>
                </div>
                <h3 className="text-lg font-bold">{post.title}</h3>
                <p className="text-gray-300">{post.content}</p>

                {post.imageUrl && (
  <Image
    src={post.imageUrl}
    alt="Uploaded"
    width={400}
    height={250}
    className="mt-2 w-[400px] h-[250px] object-cover rounded-lg shadow-lg"
    onClick={() => post.imageUrl && setSelectedImage(post.imageUrl)}
    unoptimized 
  />
)}


                <div className="mt-4 border-t border-gray-600 pt-2">
                  <h4 className="text-sm text-gray-400">Comments:</h4>
                  {post.comments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No comments yet</p>
                  ) : (
                    post.comments.map((comment, index) => (
                      <p key={index} className="text-gray-300 text-sm bg-[#2A4E89] p-2 rounded-md mt-1">
                        <span className="font-bold text-white">{comment.user.name}:</span>
                        {comment.content}
                      </p>
                    ))
                  )}

                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Write a comment..."
                      className="flex-1 p-2 bg-[#2A4E89] rounded-lg text-white"
                    />
                    <button
                      onClick={() => addComment(post.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
