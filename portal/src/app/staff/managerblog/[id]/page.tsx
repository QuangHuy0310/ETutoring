"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Comment {
  _id: string;
  userId: string;
  comment: string;
  createdAt: string;
  path?: string[];
  user?: { name: string; path?: string };
}

interface BlogDetail {
  _id: string;
  caption: string;
  tags: string[];
  path: string[];
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  userInfo?: {
    name: string;
    path?: string;
  };
}

const BlogDetailPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  // Lấy access token
  const getAccessToken = () => localStorage.getItem("accessToken");

  // Fetch chi tiết blog
  useEffect(() => {
    const fetchBlogDetail = async () => {
      const accessToken = getAccessToken();
      if (!accessToken || !id) return;

      try {
        const res = await fetch(`http://localhost:3002/api/v1/blog/blog-by-id?id=${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();
        setBlog(data.data);
      } catch (err) {
        console.error("Error fetching blog detail", err);
      }
    };

    fetchBlogDetail();
  }, [id]);

  // Fetch comment
  useEffect(() => {
    const fetchComments = async () => {
      const accessToken = getAccessToken();
      if (!accessToken || !id) return;

      try {
        const res = await fetch(`http://localhost:3002/api/v1/comments/get-comment?blogId=${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();
        setComments(data.data || []);
      } catch (err) {
        console.error("Error fetching comments", err);
      }
    };

    fetchComments();
  }, [id]);

  if (!blog) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6">
      <div className="max-w-3xl mx-auto border border-[#2A4E89] p-6 rounded-lg bg-[#161b25] shadow-md">
        <div className="flex items-center mb-4">
          {blog.userInfo?.path && (
            <img
              src={blog.userInfo.path}
              alt="Avatar"
              className="w-10 h-10 rounded-full mr-3"
            />
          )}
          <div>
            <p className="font-semibold">{blog.userInfo?.name || "Anonymous"}</p>
            <p className="text-sm text-gray-400">
              {new Date(blog.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">
          {blog.tags?.length > 0 ? blog.tags.join(", ") : "No Title"}
        </h2>

        <p className="text-gray-300 mb-4">{blog.caption}</p>

        {blog.path && blog.path.length > 0 && (
          <Image
            src={blog.path[0]}
            alt="Blog image"
            width={600}
            height={300}
            className="rounded-lg shadow-lg mb-4 object-cover w-full"
            unoptimized
          />
        )}

        <div className="border-t border-gray-600 pt-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Comments:</h3>

          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="mb-3">
                <p className="bg-[#2A4E89] p-2 rounded-md text-sm text-white">
                  <span className="font-bold">
                    {comment.user?.name || "Anonymous"}:
                  </span>{" "}
                  {comment.comment}
                </p>
                {comment.path && comment.path.length > 0 && (
                  <Image
                    src={comment.path[0]}
                    alt="Comment image"
                    width={250}
                    height={150}
                    className="mt-1 rounded-md object-cover"
                    unoptimized
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
