"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { getCookie } from "cookies-next";

interface ChatMessageProps {
  text: string;
  sender: "me" | "other";
  senderId: string;
  createdAt?: string;
}

export function ChatMessage({ text, sender, senderId, createdAt }: ChatMessageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const isImage = text.startsWith("blob:") || text.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }

  const handleUpdateStatus = async (status: "accepted" | "rejected", parsed: any) => {
    const token = getCookie("accessToken");
    if (!token) {
      alert("❌ Thiếu token");
      return;
    }

    try {
      const updateUrl = new URL("http://localhost:3002/update-schedule-request");
      updateUrl.searchParams.set("id", parsed.id || parsed._id); // cần BE đảm bảo có id trong message
      updateUrl.searchParams.set("status", status);

      console.log("🛰️ PUT update-schedule-request:", updateUrl.toString());

      const res = await fetch(updateUrl.toString(), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("❌ Không cập nhật được trạng thái:", result);
        alert("❌ Lỗi duyệt lịch");
      } else {
        console.log("✅ Trạng thái đã cập nhật:", result);
        alert("✅ Đã cập nhật trạng thái yêu cầu lịch");

        // Reload lại trang để lấy message mới
        window.location.reload();
      }
    } catch (err) {
      console.error("❌ Error PUT status:", err);
    }
  };

  const messageAlign = sender === "me" ? "justify-end" : "justify-start";
  const bubbleStyle =
    sender === "me" ? "bg-blue-600 text-white" : "bg-gray-700 text-white";

  return (
    <>
      <div className={`flex ${messageAlign} w-full mb-2`}>
        <div className={`p-3 rounded-lg ${bubbleStyle} max-w-[80%]`}>
          {/* 📦 Schedule Request Message */}
          {parsed?.type === "schedule-request" ? (
            <div>
              <p className="text-white font-semibold">📅 Yêu cầu đặt lịch</p>
              <p className="text-white">Ngày: <span className="font-medium">{parsed.date}</span></p>
              <p className="text-white">Slot: <span className="font-medium">{parsed.slotId}</span></p>
              <p className="text-white">Trạng thái:
                <span className={`ml-1 font-semibold ${
                  parsed.status === "pending"
                    ? "text-yellow-400"
                    : parsed.status === "accepted"
                    ? "text-green-400"
                    : "text-red-400"
                }`}>
                  {parsed.status}
                </span>
              </p>

              {/* 👉 Nếu là người nhận và còn pending => hiện nút xử lý */}
              {sender === "other" && parsed.status === "pending" && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleUpdateStatus("accepted", parsed)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ✅ Chấp nhận
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("rejected", parsed)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    ❌ Từ chối
                  </button>
                </div>
              )}
            </div>
          ) : parsed?.type === "image-gallery" && Array.isArray(parsed.images) ? (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {parsed.images.map((url: string, i: number) => (
                <img
                  key={i}
                  src={url}
                  alt={`Image ${i}`}
                  className="w-32 h-32 object-cover rounded cursor-pointer shadow"
                  onClick={() => {
                    setSelectedImage(url);
                    setIsOpen(true);
                  }}
                />
              ))}
            </div>
          ) : parsed?.type === "doc-attachment" && parsed.fileUrl ? (
            <a
              href={parsed.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-300 hover:text-blue-200 underline break-all"
            >
              📎 {parsed.filename}
            </a>
          ) : isImage ? (
            <img
              src={text}
              alt="Sent image"
              className="max-w-[300px] rounded-lg cursor-pointer hover:opacity-75 transition"
              onClick={() => {
                setSelectedImage(text);
                setIsOpen(true);
              }}
            />
          ) : (
            <span>{text}</span>
          )}

          {/* 🕓 Timestamp */}
          {createdAt && (
            <div className="text-xs text-gray-300 mt-1 text-right">
              {new Date(createdAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      </div>

      {/* === Fullscreen Modal === */}
      {selectedImage && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => {
            setIsOpen(false);
            setSelectedImage(null);
          }}
        >
          <div className="relative">
            <img
              src={selectedImage}
              alt="Fullsize Image"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg object-contain"
            />
            <button
              className="absolute top-3 right-3 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setSelectedImage(null);
              }}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
