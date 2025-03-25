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
  id: string; // map từ _id của API (string)
  user: {
    id: string;      // từ userId của API
    name: string;    // từ userInfo.name
    avatar?: string; // từ userInfo.path
  };
  title: string;       // mapping từ tags (danh sách tag, join thành chuỗi)
  content: string;     // mapping từ caption
  imageUrl?: string;   // mapping từ path (lấy phần tử đầu tiên nếu có)
  createdAt: number;   // nếu API trả về createdAt, nếu không lấy Date.now()
  comments: { user: User; content: string }[]; // mặc định []
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
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Check authentication
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

  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;
  
        const response = await fetch("http://localhost:3002/api/v1/blog/blogs?page=1&limit=10", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        if (!response.ok) {
          console.error("Failed to fetch blogs");
          return;
        }
  
        const data = await response.json();
        if (!data.data || !data.data.item || !Array.isArray(data.data.item)) {
          console.error("Invalid API response format", data);
          return;
        }
  
        const mappedPosts: BlogPost[] = data.data.item.map((post: any) => ({
          id: post._id,
          user: {
            id: post.userId || "unknown",
            name: post.userInfo?.name || "Anonymous",
            avatar: post.userInfo?.path || "",
          },
          title: post.tags && Array.isArray(post.tags) ? post.tags.join(", ") : "No Title",
          content: post.caption || "No Content",
          imageUrl:
            post.path && Array.isArray(post.path) && post.path.length > 0
              ? post.path[0]
              : "",
          createdAt: post.createdAt ? new Date(post.createdAt).getTime() : Date.now(),
          comments: [],
        }));
  
        setPosts(mappedPosts);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
  
    fetchBlogs();
  }, []);
  
  

  // Hàm thêm blog mới sau khi POST thành công (có thể dùng cho PostForm)
  const addPost = (post: { title: string; content: string; imageUrl?: string }) => {
    // Mapping lại blog vừa tạo thành BlogPost để hiển thị (với createdAt và comments mặc định)
    const newBlog: BlogPost = {
      id: Date.now().toString(),
      user: user!,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: Date.now(),
      comments: [],
    };
    setPosts((prevPosts) => [newBlog, ...prevPosts]);
    setIsModalOpen(false);
  };

  const addComment = (postId: string) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, { user: user!, content: comment }] }
          : post
      )
    );
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  if (!user) {
    return null;
  }

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
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
            >
              Create Blog
            </button>
          </div>

          {posts.length === 0 ? (
            <p className="text-gray-400">No posts yet</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-4 border border-[#2A4E89] rounded-lg bg-[#161b25] mb-4">
                <div className="flex items-center mb-2">
                  {post.user.avatar && (
                    <img
                      src={post.user.avatar}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full mr-2"
                    />
                  )}
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
                        <span className="font-bold text-white">{comment.user.name}:</span> {comment.content}
                      </p>
                    ))
                  )}

                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
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
