"use client";

import React, { useState } from "react";
import StaffLayout from "@/app/staff/StaffLayout";

interface Blog {
  id: number;
  actor: string;
  time: string;
  content: string;
  status: "pending" | "approved"; // Trạng thái của blog
}

const ManagerBlogPage: React.FC = () => {
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

  // Duyệt blog (chuyển từ pending -> approved)
  const approveBlog = (id: number) => {
    setBlogs(
      blogs.map((blog) =>
        blog.id === id ? { ...blog, status: "approved" } : blog
      )
    );
  };

  // Xóa blog
  const removeBlog = (id: number) => {
    setBlogs(blogs.filter((blog) => blog.id !== id));
  };

  return (
    <StaffLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Blog Manager</h1>

        {/* Danh sách blog */}
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
                          blog.status === "approved" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      >
                        {blog.status}
                      </span>
                    </td>
                    <td className="border p-2">
                      {blog.status === "pending" && (
                        <button
                          onClick={() => approveBlog(blog.id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                        >
                          Post
                        </button>
                      )}
                      <button
                        onClick={() => removeBlog(blog.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
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
