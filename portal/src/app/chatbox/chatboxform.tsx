"use client";

import { useState } from "react";
import {
  FaPaperPlane,
  FaSmile,
  FaPlus,
  FaCalendarAlt,
  FaTimes,
} from "react-icons/fa";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { getCookie } from "cookies-next";

interface ChatboxFormProps {
  onSend: (message: string) => void;
}

export default function ChatboxForm({ onSend }: ChatboxFormProps) {
  const [input, setInput] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);

  const [day, setDay] = useState("");
  const [slot, setSlot] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const currentRoom =
    typeof window !== "undefined"
      ? localStorage.getItem("currentRoom") || null
      : null;

  const addEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  const handleSendText = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  const toggleBookingForm = () => setShowBookingForm((prev) => !prev);

  const handleBookRequest = () => {
    if (day && slot && title && content) {
      onSend(`📅 Booking Request: ${title} - ${day} (Slot ${slot})`);
      setShowBookingForm(false);
      setDay("");
      setSlot("");
      setTitle("");
      setContent("");
    } else {
      alert("Please fill full information!");
    }
  };

  const uploadImageToServer = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("image", file);
    const token = getCookie("accessToken");
    if (!token) return null;

    try {
      const res = await fetch("http://localhost:3002/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      return result.data?.fileUrl || null;
    } catch (error) {
      console.error("❌ Upload ảnh thất bại:", error);
      return null;
    }
  };

  const handleMultiFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageList = files.filter((file) => file.type.startsWith("image/"));
    const docList = files.filter((file) => !file.type.startsWith("image/"));

    setImageFiles((prev) => [...prev, ...imageList]);
    setDocFiles((prev) => [...prev, ...docList]);
  };

  const removeImageFile = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const removeDocFile = (index: number) => {
    setDocFiles(docFiles.filter((_, i) => i !== index));
  };

  const sendAllFiles = async () => {
    const token = getCookie("accessToken");
    const room = currentRoom;

    if (!token) {
      alert("⚠️ Bạn chưa đăng nhập hoặc token hết hạn.");
      return;
    }

    if (!room) {
      alert("⚠️ Không có phòng hiện tại được chọn.");
      return;
    }

    // Upload ảnh
    if (imageFiles.length > 0) {
      const uploaded: string[] = [];

      for (const file of imageFiles) {
        const url = await uploadImageToServer(file);
        if (url) uploaded.push(url);
      }

      if (uploaded.length > 0) {
        const galleryMessage = {
          type: "image-gallery",
          images: uploaded,
        };
        onSend(JSON.stringify(galleryMessage));
      }

      setImageFiles([]);
    }

    // Upload document và tạo document
    for (const file of docFiles) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const uploadRes = await fetch("http://localhost:3002/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const result = await uploadRes.json();
        const fileUrl = result.data?.fileUrl;

        if (!fileUrl) continue;

        const createDocUrl = new URL("http://localhost:3002/new-document");
        createDocUrl.searchParams.set("roomId", room);
        createDocUrl.searchParams.set("name", file.name);
        createDocUrl.searchParams.set("title", file.name);
        createDocUrl.searchParams.set("path", fileUrl);

        const docRes = await fetch(createDocUrl.toString(), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!docRes.ok) {
          console.error("❌ Lỗi tạo document:", await docRes.text());
          alert("❌ Không thể tạo tài liệu: " + file.name);
          continue;
        }

        const docMessage = {
          type: "doc-attachment",
          filename: file.name,
          fileUrl,
          mime: file.type || "application/octet-stream",
        };
        onSend(JSON.stringify(docMessage));
      } catch (err) {
        console.error("❌ Upload + tạo document lỗi:", err);
        alert("❌ Có lỗi xảy ra khi gửi file: " + file.name);
      }
    }

    setDocFiles([]);
  };

  return (
    <div className="flex items-center p-4 border-t border-gray-700 bg-gray-800 relative">
      <Menu as="div" className="relative">
        <Menu.Button className="mx-2 p-2 hover:bg-gray-700 rounded transition">
          <FaPlus className="text-white" />
        </Menu.Button>
        <Transition as={Fragment}>
          <Menu.Items className="absolute left-0 bottom-12 w-40 bg-gray-800 shadow-lg border border-gray-700 rounded-md">
            <label className="block p-2 cursor-pointer hover:bg-gray-700">
              📷 Photo
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleMultiFileUpload}
              />
            </label>
            <label className="block p-2 cursor-pointer hover:bg-gray-700">
              📄 Document
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                multiple
                hidden
                onChange={handleMultiFileUpload}
              />
            </label>
          </Menu.Items>
        </Transition>
      </Menu>

      {(imageFiles.length > 0 || docFiles.length > 0) && (
        <div className="absolute bottom-16 left-4 w-96 bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg z-50">
          {imageFiles.length > 0 && (
            <>
              <h3 className="text-white font-semibold mb-2">🖼️ Images:</h3>
              <div className="flex gap-2 overflow-x-auto mb-3">
                {imageFiles.map((file, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-20 h-20 object-cover rounded border border-gray-600"
                      alt={`Preview ${i}`}
                    />
                    <button
                      onClick={() => removeImageFile(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {docFiles.length > 0 && (
            <>
              <h3 className="text-white font-semibold mb-2">📄 Documents:</h3>
              <ul className="max-h-24 overflow-auto">
                {docFiles.map((file, index) => (
                  <li
                    key={index}
                    className="text-white text-sm flex justify-between items-center mb-1"
                  >
                    <span className="truncate max-w-[80%]">{file.name}</span>
                    <button
                      onClick={() => removeDocFile(index)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      <FaTimes />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <button
            onClick={sendAllFiles}
            className="w-full mt-3 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Send Files
          </button>
        </div>
      )}

      <button
        onClick={toggleBookingForm}
        className="mx-2 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        <FaCalendarAlt />
      </button>

      {showBookingForm && (
        <div className="absolute bottom-16 left-4 w-96 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <h3 className="text-lg font-semibold text-white text-center">
            Book a Session
          </h3>
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full p-2 bg-gray-700 text-white rounded mt-2"
          />
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded mt-2"
          >
            <option value="">Choose Slot 1-5</option>
            <option value="1">8:00 - 10:00</option>
            <option value="2">10:00 - 12:00</option>
            <option value="3">13:00 - 15:00</option>
            <option value="4">15:00 - 17:00</option>
            <option value="5">17:00 - 19:00</option>
          </select>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mt-2 bg-gray-700 text-white rounded"
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 mt-2 bg-gray-700 text-white rounded h-20"
          />
          <div className="flex justify-between mt-3">
            <button
              onClick={handleBookRequest}
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 text-white"
            >
              Send Request
            </button>
            <button
              onClick={toggleBookingForm}
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Menu as="div" className="relative">
        <Menu.Button className="mx-2 p-2 hover:bg-gray-700 rounded transition">
          <FaSmile className="text-white" />
        </Menu.Button>
        <Transition as={Fragment}>
          <Menu.Items className="absolute right-0 bottom-12 w-40 bg-gray-800 shadow-lg border border-gray-700 rounded-md p-2 grid grid-cols-5 gap-2 text-lg">
            {["😀", "😂", "😍", "😎", "😭", "👍", "👏", "🔥", "💯", "🎉"].map((emoji) => (
              <button key={emoji} onClick={() => addEmoji(emoji)}>
                {emoji}
              </button>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSendText}
        className="ml-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200"
      >
        <FaPaperPlane />
      </button>
    </div>
  );
}
