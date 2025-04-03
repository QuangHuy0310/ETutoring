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
  createdAt: number;
}

const ManagerBlogPage: React.FC = () => {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filterStatus, setFilterStatus] = useState<"pending" | "approve">("pending");

  // ✅ Hàm gọi API cập nhật status blog
  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      const res = await fetch(
        `http://localhost:3002/api/v1/blog/update-status?id=${id}&status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        console.error("Failed to update blog status");
        return;
      }

      // ✅ Refresh lại danh sách blogs sau khi cập nhật
      fetchBlogs();
    } catch (err) {
      console.error("Error updating blog status:", err);
    }
  };

  // ✅ Tách hàm fetchBlog ra ngoài để tái sử dụng sau khi update
  const fetchBlogs = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      const response = await fetch(
        `http://localhost:3002/api/v1/blog/blogs?status=${filterStatus}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch blogs");
        return;
      }

      const data = await response.json();
      if (!data.data || !data.data.item || !Array.isArray(data.data.item)) {
        console.error("Invalid API response format", data);
        return;
      }

      const mappedBlogs: Blog[] = data.data.item.map((blog: any) => ({
        id: blog._id,
        actor: blog.userInfo?.name || "Anonymous",
        time: new Date(blog.createdAt).toLocaleString(),
        content: blog.caption || "",
        status: blog.status,
        createdAt: new Date(blog.createdAt).getTime(),
      }));

      setBlogs(mappedBlogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [filterStatus]);

  const viewDetail = (id: string) => {
    router.push(`/staff/managerblog/${id}`);
  };

  return (
    <StaffLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Blog Manager</h1>

        <div className="mb-4">
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded mr-2 ${
              filterStatus === "pending" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            Pending Blogs
          </button>
          <button
            onClick={() => setFilterStatus("approve")}
            className={`px-4 py-2 rounded ${
              filterStatus === "approve" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            Approved Blogs
          </button>
        </div>

        <div className="border rounded-lg p-4 bg-white text-black">
          <h2 className="text-xl font-semibold mb-3">
            {filterStatus === "pending" ? "Pending Blogs" : "Approved Blogs"}
          </h2>

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
                          blog.status === "approve" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      >
                        {blog.status}
                      </span>
                    </td>
                    <td className="border p-2">
                      {filterStatus === "pending" ? (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(blog.id, "approve")}
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(blog.id, "reject")}
                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStatusUpdate(blog.id, "removed")}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 mr-2"
                        >
                          Remove
                        </button>
                      )}
                      <button
                        onClick={() => viewDetail(blog.id)}
                        className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                      >
                        Detail
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
