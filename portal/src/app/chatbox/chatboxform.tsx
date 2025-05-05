"use client";

import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaSmile, FaPlus, FaCalendarAlt, FaTimes } from "react-icons/fa";
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

  // 📦 Booking States:
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [bookingDate, setBookingDate] = useState("");
  const [partnerUserId, setPartnerUserId] = useState<string | null>(null);
  const [isFetchingBookingData, setIsFetchingBookingData] = useState(false);

  const currentRoom = typeof window !== "undefined" ? localStorage.getItem("currentRoom") || null : null;

  const addEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  const handleSendText = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  const toggleBookingForm = async () => {
    if (!showBookingForm) {
      await fetchBookingData();
    }
    setShowBookingForm((prev) => !prev);
  };

  const fetchBookingData = async () => {
    const token = getCookie("accessToken");
    if (!token || !currentRoom) {
      console.warn("⚠️ No token or currentRoom found to fetch booking data.");
      return;
    }

    try {
      setIsFetchingBookingData(true);

      // Fetch partner userId
      const userRes = await fetch(`http://localhost:3002/get-user-by-roomId?roomId=${currentRoom}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await userRes.json();
      const users = usersData?.data || [];

      if (!Array.isArray(users)) {
        console.error("❌ Incorrect user data in room:", usersData);
        return;
      }

      const tokenParts = token.toString().split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const myUserId = payload.userId || payload.id || payload.sub;

      const otherUser = users.find((u: any) => u.userId !== myUserId);
      if (!otherUser) {
        console.error("❌ Partner user not found.");
        return;
      }
      const otherUserId = otherUser.userId;
      setPartnerUserId(otherUserId);
      console.log("👤 Partner userId:", otherUserId);

      // Fetch slot đã bận
      const busyRes = await fetch(`http://localhost:3002/api/v1/slots/get-slot-by-id?id=${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const busyData = await busyRes.json();
      console.log("📚 Slot bận của partner:", busyData);

      // Fetch schedule
      const scheduleRes = await fetch(`http://localhost:3002/get-schedule?userId=${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const scheduleData = await scheduleRes.json();
      console.log("📅 Các schedule đã book của partner:", scheduleData);

      // Fetch tất cả slots
      const slotRes = await fetch(`http://localhost:3002/api/v1/slots/get-slot`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const slotData = await slotRes.json();
      console.log("🕗 List all slots:", slotData);

      if (Array.isArray(slotData?.data)) {
        setAvailableSlots(slotData.data);
      } else {
        console.error("❌ Slot data is not an array:", slotData);
      }
    } catch (err) {
      console.error("❌ Error fetching booking data:", err);
    } finally {
      setIsFetchingBookingData(false);
    }
  };
  const handleBookRequest = async () => {
    const token = getCookie("accessToken");
    if (!token || !partnerUserId) {
      alert("⚠️ Thiếu thông tin để gửi yêu cầu đặt lịch.");
      return;
    }
  
    if (!bookingDate || selectedSlotIds.length === 0) {
      alert("⚠️ Hãy chọn ngày và ít nhất một slot.");
      return;
    }
  
    try {
      const tokenParts = token.toString().split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const senderId = payload.userId || payload.id || payload.sub;
  
      const [year, month, day] = bookingDate.split("-");
      const formattedDay = `${day}/${month}/${year}`;
  
      for (const slotId of selectedSlotIds) {
        const api = new URL("http://localhost:3002/schedule-request");
        api.searchParams.set("reciverId", partnerUserId);
        api.searchParams.set("days", formattedDay);
        api.searchParams.set("slotId", slotId);
  
        const res = await fetch(api.toString(), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const result = await res.json();
  
        if (!res.ok) {
          console.error("❌ Lỗi khi gửi yêu cầu lịch:", result);
          alert("❌ Gửi yêu cầu thất bại");
          continue;
        }
  
        console.log("✅ Gửi thành công:", result);
  
        // 👇 Send schedule-request message format
        const msgPayload = {
          type: "schedule-request",
          id: result?.data?._id || "", // cần đảm bảo BE trả về ID
          date: formattedDay,
          slotId,
          status: "pending",
        };
  
        onSend(JSON.stringify(msgPayload));
      }
  
      setShowBookingForm(false);
      setBookingDate("");
      setSelectedSlotIds([]);
    } catch (error) {
      console.error("❌ Lỗi gửi yêu cầu lịch:", error);
      alert("❌ Đã xảy ra lỗi khi gửi yêu cầu");
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
      console.error("❌ Failed to upload image:", error);
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
      alert("⚠️ You are not logged in or token has expired.");
      return;
    }

    if (!room) {
      alert("⚠️ No current room selected.");
      return;
    }

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
      
      {/* 📦 Nút Upload ảnh/file */}
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

      {/* 📦 Nếu có file thì render preview */}
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

      {/* 📅 Nút mở Booking Form */}
      <button
        onClick={toggleBookingForm}
        className="mx-2 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        <FaCalendarAlt />
      </button>

{/* 📅 Popup Booking */}
{showBookingForm && (
  <div className="absolute bottom-16 left-4 w-96 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
    <h3 className="text-lg font-semibold text-white text-center">Book a Session</h3>

    {/* 📅 Ngày đặt */}
    <input
      type="date"
      value={bookingDate}
      onChange={(e) => setBookingDate(e.target.value)}
      min={new Date().toISOString().split("T")[0]}
      className="w-full p-2 bg-gray-700 text-white rounded mt-2"
    />

    {/* 🕗 Chọn Slot */}
    <div className="space-y-2 mt-4 max-h-[150px] overflow-y-auto">
      {availableSlots.length === 0 ? (
        <p className="text-white text-center">No slots available.</p>
      ) : (
        availableSlots.map((slot) => (
          <label key={slot._id} className="flex items-center space-x-2 text-white">
            <input
              type="checkbox"
              value={slot._id}
              checked={selectedSlotIds.includes(slot._id)}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedSlotIds((prev) =>
                  prev.includes(value) ? prev.filter((id) => id !== value) : [...prev, value]
                );
              }}
            />
            <span>{`${slot.name} (${slot.timeStart} - ${slot.timeEnd})`}</span>
          </label>
        ))
      )}
    </div>

    {/* 🔥 Buttons */}
    <div className="flex justify-between mt-4">
      <button
        onClick={handleBookRequest}
        disabled={isFetchingBookingData}
        className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 text-white"
      >
        Send Request
      </button>
      <button
        onClick={() => setShowBookingForm(false)}
        className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 text-white"
      >
        Cancel
      </button>
    </div>
  </div>
)}


      {/* 😎 Nút Emoji */}
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

      {/* 📝 Input Message */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-2"
      />

      {/* 📨 Nút Gửi */}
      <button
        onClick={handleSendText}
        className="ml-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200"
      >
        <FaPaperPlane />
      </button>
    </div>
  );
}
