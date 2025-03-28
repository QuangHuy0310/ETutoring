"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StaffLayout from "@/app/staff/StaffLayout";

interface Blog {
  id: string;
  actor: string;
  time: string;
  content: string;
  status: string;
}

const ManagerBlogPage: React.FC = () => {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);

  // Fetch API GET /blogs với tham số status để lấy cả approved và pending
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;
  
        // Thêm query parameter ?status=approved&status=pending để lấy cả 2 trạng thái
        const response = await fetch("http://localhost:3002/api/v1/blog/blogs?status=pending", {
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
  
        // Mapping các trường: userInfo.name => actor, createdAt => time, caption => content, status => status
        const mappedBlogs: Blog[] = data.data.item.map((blog: any) => {
          return {
            id: blog._id,
            actor: blog.userInfo?.name || "Anonymous",
            time: new Date(blog.createdAt).toLocaleString(),
            content: blog.caption || "",
            status: blog.status,
          };
        });
  
        setBlogs(mappedBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  // Các hàm xử lý cục bộ
  const approveBlog = (id: string) => {
    setBlogs(blogs.map((blog) => (blog.id === id ? { ...blog, status: "approved" } : blog)));
  };

  const rejectBlog = (id: string) => {
    setBlogs(blogs.map((blog) => (blog.id === id ? { ...blog, status: "rejected" } : blog)));
  };

  const removeBlog = (id: string) => {
    setBlogs(blogs.filter((blog) => blog.id !== id));
  };

  const viewDetail = (id: string) => {
    router.push(`/staff/managerblog/${id}`);
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
                            onClick={() => viewDetail(blog.id)}
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
                            onClick={() => viewDetail(blog.id)}
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
