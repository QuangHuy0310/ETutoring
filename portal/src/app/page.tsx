"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/app/componets/layout";
import PostForm from "@/app/Blog/form";

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  userId: string;
  blogId: string;
  comment: string;
  createdAt: string;
  path?: string[];
  user?: { name: string; path?: string }[];
}

interface BlogPost {
  id: string;
  user: User;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: number;
  comments: Comment[];
  userRole?: string;
}

const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [commentImageInputs, setCommentImageInputs] = useState<{ [key: string]: string }>({});

  const fetchUserInfo = async (userId: string) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return { name: "Anonymous", avatar: undefined };

    try {
      const res = await fetch(`http://localhost:3002/get-infors?idUser=${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();
      const user = data.data?.[0];
      return {
        name: user?.name || "Anonymous",
        avatar: user?.path || undefined,
      };
    } catch {
      return { name: "Anonymous", avatar: undefined };
    }
  };

  const fetchUserRole = async (userId: string) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return "user";

    try {
      const res = await fetch(`http://localhost:3002/api/v1/users/get-role-byId?id=${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();
      return (data.data.role || "user").toLowerCase(); // ép luôn lowercase từ lúc fetch
    } catch {
      return "user";
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      setUser({ id: payload.id, name: payload.name });
    } catch {
      router.push("/login");
    }
  }, [router]);

  const fetchComments = async (blogId: string) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return [];

    try {
      const res = await fetch(`http://localhost:3002/api/v1/comments/get-comment?blogId=${blogId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const res = await fetch("http://localhost:3002/api/v1/blog/blogs", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await res.json();
        const blogs = data.data?.item || [];

        const posts = await Promise.all(
          blogs.map(async (post: any) => {
            const userInfo = await fetchUserInfo(post.userId);
            const userRole = await fetchUserRole(post.userId);
            const comments = await fetchComments(post._id);

            return {
              id: post._id,
              user: { id: post.userId, name: userInfo.name, avatar: userInfo.avatar },
              title: Array.isArray(post.tags) ? post.tags.join(", ") : "No Title",
              content: post.caption || "No Content",
              imageUrl: post.path?.[0] || undefined,
              createdAt: new Date(post.createdAt).getTime(),
              comments,
              userRole,
            };
          })
        );

        setPosts(posts);
      } catch (error) {
        console.error("🛑 Error fetching blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  const addPost = (post: { title: string; content: string; imageUrl?: string }) => {
    if (!user) return;
    const newPost: BlogPost = {
      id: Date.now().toString(),
      user,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: Date.now(),
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    setIsModalOpen(false);
  };

  const handleCommentChange = (e: ChangeEvent<HTMLInputElement>, postId: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: e.target.value }));
  };

  const handleCommentFileChange = async (e: ChangeEvent<HTMLInputElement>, postId: string) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:3002/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await res.json();
      if (data.data?.fileUrl) {
        setCommentImageInputs((prev) => ({ ...prev, [postId]: data.data.fileUrl }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addComment = async (postId: string) => {
    const commentText = commentInputs[postId]?.trim();
    const imageUrl = commentImageInputs[postId];
    if (!commentText && !imageUrl) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const res = await fetch(`http://localhost:3002/api/v1/comments/new-comment?id=${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ comment: commentText, path: imageUrl ? [imageUrl] : [] }),
      });
      const newComment = await res.json();
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
        )
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      setCommentImageInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">All Blogs</h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
            Create Blog
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-[#1E2432] p-6 rounded-lg">
              <PostForm onPost={addPost} onClose={() => setIsModalOpen(false)} />
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-gray-400">No posts yet</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-4 bg-[#161b25] border border-[#2A4E89] rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Link href={post.userRole === "tutor" ? `/tutor/view?idUser=${post.user.id}` : `/information/view?idUser=${post.user.id}`}>
                  <img
                    src={post.user.avatar || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                  />
                </Link>
                <Link href={post.userRole === "tutor" ? `/tutor/view?idUser=${post.user.id}` : `/information/view?idUser=${post.user.id}`}>
                  <span className="font-bold hover:underline">{post.user.name}</span>
                </Link>
              </div>

              <h3 className="text-lg font-bold">{post.title}</h3>
              <p className="text-gray-400">{post.content}</p>

              {post.imageUrl && (
                <Image
                  src={post.imageUrl}
                  alt="Post Image"
                  width={500}
                  height={300}
                  className="rounded-lg mt-4"
                  unoptimized
                />
              )}

              {/* Comments */}
              <div className="mt-4">
                <h4 className="text-sm text-gray-400 mb-2">Comments</h4>
                {post.comments.map((c, idx) => (
                  <div key={idx} className="text-sm text-gray-300 bg-[#2A4E89] p-2 rounded mb-2">
                    <strong>{c.user?.[0]?.name || "Anonymous"}:</strong> {c.comment}
                  </div>
                ))}

                <div className="flex flex-col space-y-2 mt-2">
                  <input
                    value={commentInputs[post.id] || ""}
                    onChange={(e) => handleCommentChange(e, post.id)}
                    placeholder="Write a comment..."
                    className="bg-[#2A4E89] rounded p-2"
                  />
                  <input
                    type="file"
                    onChange={(e) => handleCommentFileChange(e, post.id)}
                    className="text-white"
                  />
                  <button onClick={() => addComment(post.id)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">
                    Send
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
