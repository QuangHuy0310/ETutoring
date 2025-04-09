"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface ChatMessageProps {
  text: string;
  sender: "me" | "other";
  senderId: string;
  createdAt?: string;
}

export function ChatMessage({ text, sender, senderId, createdAt }: ChatMessageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isImage = text.startsWith("blob:") || text.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  // Optional parse for JSON type messages (gallery, doc, etc.)
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }

  const messageAlign = sender === "me" ? "justify-end" : "justify-start";
  const bubbleStyle =
    sender === "me" ? "bg-blue-600 text-white" : "bg-gray-700 text-white";

  return (
    <>
      <div className={`flex ${messageAlign} w-full mb-2`}>
        <div className={`p-3 rounded-lg ${bubbleStyle} max-w-[80%]`}>
          {/* 📦 Image Gallery Message */}
          {parsed?.type === "image-gallery" && Array.isArray(parsed.images) ? (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {parsed.images.map((url: string, i: number) => (
                <img
                  key={i}
                  src={url}
                  alt={`Image ${i}`}
                  className="w-32 h-32 object-cover rounded cursor-pointer shadow"
                  onClick={() => setIsOpen(true)}
                />
              ))}
            </div>
          ) : parsed?.type === "doc-attachment" && parsed.fileUrl ? (
            // 📎 Doc Attachment Message
            <a
              href={parsed.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-300 hover:text-blue-200 underline break-all"
            >
              📎 {parsed.filename}
            </a>
          ) : isImage ? (
            // 🖼️ Raw image
            <img
              src={text}
              alt="Sent image"
              className="max-w-[300px] rounded-lg cursor-pointer hover:opacity-75 transition"
              onClick={() => setIsOpen(true)}
            />
          ) : (
            // 💬 Plain Text
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

      {/* 🖼️ Fullscreen image preview (modal) */}
      {isImage && isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative">
            <img src={text} alt="Fullsize Image" className="max-w-[90vw] max-h-[90vh] rounded-lg" />
            <button
              className="absolute top-3 right-3 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              onClick={() => setIsOpen(false)}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
