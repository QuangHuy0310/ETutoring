"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StaffLayout from "@/app/staff/StaffLayout";

interface Blog {
  id: number;
  author: string;
  title: string;
  content: string;
  file?: string; // Ảnh đại diện cho blog
  createdAt: number;
  comments: { author: string; content: string }[];
}

// Dữ liệu giả lập
const dummyBlogs: Blog[] = [
  {
    id: 1,
    author: "Student A",
    title: "Understanding React Hooks",
    content: "This post explains how React Hooks work and how to use them in functional components...",
    file: "/example-image.jpg", // Giả sử có ảnh
    createdAt: Date.now() - 3600 * 1000, // 1 giờ trước
    comments: [
      { author: "Tutor B", content: "Great explanation!" },
      { author: "Admin", content: "Please add more examples." },
    ],
  },
  {
    id: 2,
    author: "Tutor B",
    title: "Next.js API Routes",
    content: "In this blog, we will discuss how to create API routes in Next.js...",
    createdAt: Date.now() - 86400 * 1000, // 1 ngày trước
    comments: [],
  },
];

const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const BlogDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);

  useEffect(() => {
    if (!params.id || isNaN(Number(params.id))) {
      router.push("/staff/managerblog"); // Nếu id không hợp lệ, điều hướng về trang staff
      return;
    }

    const blogId = Number(params.id);
    const foundBlog = dummyBlogs.find((b) => b.id === blogId);
    setBlog(foundBlog || null);
  }, [params.id, router]);

  if (!blog) {
    return (
      <StaffLayout>
        <div className="p-6 text-center text-red-500">
          <h2 className="text-2xl font-bold">Blog Not Found</h2>
          <button
            onClick={() => router.push("/staff")}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Blog List
          </button>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="p-6 max-w-3xl mx-auto bg-[#1E2432] text-white rounded-lg shadow-lg">
        <button
          onClick={() => router.back()}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ← Back
        </button>

        <div className="p-4 border border-[#2A4E89] rounded-lg bg-[#161b25]">
          <div className="flex items-center mb-2">
            <span className="font-bold text-white">{blog.author}</span>
            <span className="text-gray-400 text-sm ml-2">{formatTime(blog.createdAt)}</span>
          </div>
          <h3 className="text-xl font-bold">{blog.title}</h3>
          <p className="text-gray-300">{blog.content}</p>

          {blog.file && (
            <img
              src={blog.file}
              alt="Blog Image"
              className="mt-2 w-full h-auto object-cover rounded-lg shadow-lg"
            />
          )}

          <div className="mt-4 border-t border-gray-600 pt-2">
            <h4 className="text-sm text-gray-400">Comments:</h4>
            {blog.comments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet</p>
            ) : (
              blog.comments.map((comment, index) => (
                <p key={index} className="text-gray-300 text-sm bg-[#2A4E89] p-2 rounded-md mt-1">
                  <span className="font-bold text-white">{comment.author}:</span> {comment.content}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default BlogDetailPage;
