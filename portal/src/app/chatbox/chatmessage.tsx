import { useState } from "react";
import { FaTimes } from "react-icons/fa";

export function ChatMessage({ text, sender }: { text: string; sender: "me" | "other" }) {
  const [isOpen, setIsOpen] = useState(false);
  const isImage = text.startsWith("blob:") || text.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  return (
    <>
      <div className={`flex ${sender === "me" ? "justify-end" : "justify-start"} w-full`}>
        <div className={`p-3 rounded-lg ${sender === "me" ? "bg-blue-600 text-white" : "bg-gray-700 text-white"} w-fit max-w-[80%]`}>
          {isImage ? (
            <img
              src={text}
              alt="Sent image"
              className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-75 transition"
              onClick={() => setIsOpen(true)}
            />
          ) : (
            text
          )}
        </div>
      </div>

      {/* Modal hiển thị ảnh fullsize */}
      {isOpen && (
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
