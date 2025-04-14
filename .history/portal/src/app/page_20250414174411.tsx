"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import Image của Next.js
import Layout from "@/app/componets/layout";
import PostForm from "@/app/Blog/form";

interface User {
  id: string;
  name: string;
}

interface Comment {
  _id: string;
  userId: string;
  blogId: string;
  comment: string;
  createdAt: string;
  path?: string[]; // Mảng chứa URL ảnh nếu có
  user?: { name: string; path?: string };
}

interface BlogPost {
  id: string; // map từ _id của API (string)
  user: {
    id: string; // từ userId của API
    name: string; // từ userInfo.name
    avatar?: string; // từ userInfo.path
  };
  title: string; // mapping từ tags (danh sách tag, join thành chuỗi)
  content: string; // mapping từ caption
  imageUrl?: string; // mapping từ path (lấy phần tử đầu tiên nếu có)
  createdAt: number; // GET từ API
  comments: Comment[]; // Lấy từ API, không dùng cục bộ
}

const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  // State lưu URL ảnh cho comment, tương tự như blog
  const [commentImageInputs, setCommentImageInputs] = useState<{ [key: string]: string }>({});
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

  // Hàm fetch comment cho mỗi blog
  const fetchCommentsForPost = async (blogId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return [];

      const res = await fetch(
        `http://localhost:3002/api/v1/comments/get-comment?blogId=${blogId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch comments for blog:", blogId);
        return [];
      }
      const data = await res.json();
      // Giả sử backend trả về mảng comment trong data.data
      return data.data || [];
    } catch (error) {
      console.error("Error fetching comments for blog:", blogId, error);
      return [];
    }
  };

  // Fetch blogs và sau đó fetch comments cho từng blog
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        const response = await fetch("http://localhost:3002/api/v1/blog/blogs", {
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

        // Map dữ liệu blog và gọi API get comment cho từng blog
        const mappedPosts: BlogPost[] = await Promise.all(
          data.data.item.map(async (post: any) => {
            const comments = await fetchCommentsForPost(post._id);
            return {
              id: post._id,
              user: {
                id: post.userId || "unknown",
                name: post.userInfo?.name || "Anonymous",
                avatar: post.userInfo?.path || "",
              },
              title:
                post.tags && Array.isArray(post.tags)
                  ? post.tags.join(", ")
                  : "No Title",
              content: post.caption || "No Content",
              imageUrl:
                post.path && Array.isArray(post.path) && post.path.length > 0
                  ? post.path[0]
                  : "",
              createdAt: new Date(post.createdAt).getTime(),
              comments: comments,
            };
          })
        );

        setPosts(mappedPosts);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  // Hàm thêm blog mới sau khi POST thành công (dùng cho PostForm)
  const addPost = (post: { title: string; content: string; imageUrl?: string }) => {
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

  // Hàm upload file ảnh cho comment, dùng API "/upload" (giả sử trả về fileUrl)
  const handleCommentFileUpload = async (file: File, postId: string) => {
    const formData = new FormData();
    formData.append("image", file);
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const response = await fetch("http://localhost:3002/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!response.ok) {
        console.error("Comment image upload failed:", response.statusText);
        return;
      }

      const result = await response.json();
      if (result.data && result.data.fileUrl) {
        setCommentImageInputs((prev) => ({ ...prev, [postId]: result.data.fileUrl }));
      }
    } catch (error) {
      console.error("Error uploading comment image:", error);
    }
  };

  // Hàm xử lý khi file được chọn cho comment
  const handleCommentFileChange = (e: ChangeEvent<HTMLInputElement>, postId: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      console.error("Please select an image file!");
      return;
    }
    handleCommentFileUpload(file, postId);
  };

  // Hàm POST comment (có hỗ trợ gửi ảnh) lên backend
  const addComment = async (postId: string) => {
    const commentText = commentInputs[postId]?.trim();
    // Lấy URL ảnh cho comment từ state commentImageInputs
    const imageUrl = commentImageInputs[postId];

    // Yêu cầu phải có nội dung hoặc ảnh
    if (!commentText && !imageUrl) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      const res = await fetch(
        `http://localhost:3002/api/v1/comments/new-comment?id=${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            comment: commentText,
            // Nếu có URL ảnh thì gửi vào mảng, nếu không thì mảng rỗng
            path: imageUrl ? [imageUrl] : []
          }),
        }
      );

      if (!res.ok) {
        console.error("Error posting comment");
        return;
      }

      const newComment = await res.json();
      // Giả sử newComment trả về đối tượng comment mới được tạo
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        )
      );
      // Reset input và ảnh của comment
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      setCommentImageInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error posting comment:", error);
    }
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
                  <span className="text-gray-400 text-sm ml-2">
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
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
                      <div key={index} className="mt-1">
                        <p className="text-gray-300 text-sm bg-[#2A4E89] p-2 rounded-md">
                          <span className="font-bold text-white">
                            {comment.user?.name || "Anonymous"}:
                          </span>{" "}
                          {comment.comment}
                        </p>
                        {comment.path && comment.path.length > 0 && (
                          <div className="mt-1">
                            <Image
                              src={comment.path[0]}
                              alt="Comment attachment"
                              width={200}
                              height={150}
                              className="object-cover rounded-md"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  <div className="mt-2 flex flex-col gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      placeholder="Write a comment..."
                      className="flex-1 p-2 bg-[#2A4E89] rounded-lg text-white"
                    />
                    {/* File input cho ảnh của comment */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCommentFileChange(e, post.id)}
                      className="text-white"
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
