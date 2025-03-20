import React, { useState } from "react";

interface PostFormProps {
  onPost: (post: { author: string; title: string; content: string; file?: File | null }) => void;
  onClose: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ onPost, onClose }) => {
  const [author, setAuthor] = useState("John Doe");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Kiểm tra xem có phải ảnh không
      if (selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile)); // Tạo URL xem trước
      } else {
        alert("Please select an image file!");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onPost({ author, title, content, file });

    // Reset state
    setTitle("");
    setContent("");
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1E2432] p-6 rounded-lg w-[500px] flex flex-col space-y-4">
      {/* Avatar + Tên + Thời Gian */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-500 rounded-full"></div>
        <div>
          <p className="text-white font-bold">{author}</p>
          <p className="text-gray-400 text-sm">Just now</p>
        </div>
      </div>

      {/* Tiêu đề */}
      <input
        type="text"
        placeholder="Title"
        className="p-2 bg-[#2A4E89] text-white rounded-md"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Nội dung */}
      <textarea
        placeholder="Write your blog here..."
        className="p-2 bg-[#2A4E89] text-white rounded-md h-40"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* Chọn file */}
      <input type="file" accept="image/*" className="text-white" onChange={handleFileChange} />

      {/* Hiển thị ảnh xem trước */}
      {previewUrl && (
        <div className="mt-2">
          <p className="text-gray-400 text-sm">Image Preview:</p>
          <img src={previewUrl} alt="Preview" className="mt-2 max-w-full h-auto rounded-lg shadow-lg" />
        </div>
      )}

      {/* Button Post và Close */}
      <div className="flex justify-between">
        <button type="button" className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg" onClick={onClose}>
          Close
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
          Post
        </button>
      </div>
    </form>
  );
};

export default PostForm;
