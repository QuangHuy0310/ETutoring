"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter để chuyển trang
import StaffLayout from "@/app/staff/StaffLayout";

interface Blog {
  id: number;
  actor: string;
  time: string;
  content: string;
  status: "pending" | "approved" | "rejected";
}

const ManagerBlogPage: React.FC = () => {
  const router = useRouter(); // Khởi tạo router để điều hướng
  const [blogs, setBlogs] = useState<Blog[]>([
    {
      id: 1,
      actor: "Student A",
      time: "2025-03-11 10:00 AM",
      content: "This is a sample blog post.",
      status: "pending",
    },
    {
      id: 2,
      actor: "Tutor B",
      time: "2025-03-11 11:30 AM",
      content: "Another blog post example.",
      status: "approved",
    },
  ]);

  // Chấp nhận bài viết
  const approveBlog = (id: number) => {
    setBlogs(blogs.map((blog) => (blog.id === id ? { ...blog, status: "approved" } : blog)));
  };

  // Từ chối bài viết
  const rejectBlog = (id: number) => {
    setBlogs(blogs.map((blog) => (blog.id === id ? { ...blog, status: "rejected" } : blog)));
  };

  // Xóa bài viết
  const removeBlog = (id: number) => {
    setBlogs(blogs.filter((blog) => blog.id !== id));
  };

  // Chuyển đến trang chi tiết
  const viewDetail = (id: number) => {
    router.push(`/staff/managerblog/${id}`); // Chuyển hướng đến trang detail
  };

  return (
    <StaffLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Blog Manager</h1>

        <div className="border rounded-lg p-4 bg-white text-black">
          <h2 className="text-xl font-semibold mb-3">Pending & Approved Blogs</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Actor</th>
                <th className="border p-2">Time</th>
                <th className="border p-2">Content</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.length > 0 ? (
                blogs.map((blog) => (
                  <tr key={blog.id} className="text-center">
                    <td className="border p-2">{blog.actor}</td>
                    <td className="border p-2">{blog.time}</td>
                    <td className="border p-2">{blog.content}</td>
                    <td className="border p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-white ${
                          blog.status === "approved"
                            ? "bg-green-500"
                            : blog.status === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      >
                        {blog.status}
                      </span>
                    </td>
                    <td className="border p-2">
                      {blog.status === "pending" ? (
                        <>
                          <button
                            onClick={() => approveBlog(blog.id)}
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectBlog(blog.id)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => viewDetail(blog.id)} // Chuyển đến trang chi tiết
                            className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                          >
                            Detail
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => removeBlog(blog.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 mr-2"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => viewDetail(blog.id)} // Chuyển đến trang chi tiết
                            className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                          >
                            Detail
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No blogs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </StaffLayout>
  );
};

export default ManagerBlogPage;
