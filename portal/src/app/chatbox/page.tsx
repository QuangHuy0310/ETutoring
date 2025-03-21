"use client";

import { useState } from "react";
import ChatboxForm from "@/app/chatbox/chatboxform";
import { ChatMessage } from "@/app/chatbox/chatmessage";
import { FaPhone, FaVideo, FaCog } from "react-icons/fa";
import Layout from "@/app/componets/layout";

export default function ChatboxPage() {
  const [messages, setMessages] = useState<{ text: string; sender: "me" | "other" }[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [slot, setSlot] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSend = (message: string) => {
    setMessages([...messages, { text: message, sender: "me" }]);
  };

  const toggleBookingForm = () => {
    setShowBookingForm(!showBookingForm);
  };

  const handleBookRequest = () => {
    if (day && month && year && slot && title && content) {
      const bookingMessage = `📅 Booking Request: ${title} - ${day}/${month}/${year} (Slot ${slot})`;
      setMessages([...messages, { text: bookingMessage, sender: "me" }]);
      setShowBookingForm(false);
      setDay("");
      setMonth("");
      setYear("");
      setSlot("");
      setTitle("");
      setContent("");
    } else {
      alert("Vui lòng điền đầy đủ thông tin!");
    }
  };

  return (
    <Layout>
      <div className="flex flex-1 h-full bg-black border border-gray-700 rounded-lg shadow-xl">
        {/* Sidebar bên trái */}
        <div className="w-[300px] bg-black border-r border-gray-700 p-4">
          <h2 className="text-xl font-semibold">Chats</h2>
          <ul className="mt-4">
            <li className="p-2 hover:bg-gray-700 rounded cursor-pointer">Group Chat</li>
            <li className="p-2 hover:bg-gray-700 rounded cursor-pointer">User 1</li>
            <li className="p-2 hover:bg-gray-700 rounded cursor-pointer">User 2</li>
          </ul>
        </div>

        {/* Khu vực chat */}
        <div className="flex flex-col flex-1 h-full">
          {/* Header chat */}
          <div className="flex items-center justify-between p-4 bg-black border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
              <span className="text-lg font-semibold">Username</span>
            </div>
            <div className="flex space-x-4">
              <button className="p-2 bg-gray-700 text-white rounded"><FaPhone /></button>
              <button className="p-2 bg-gray-700 text-white rounded"><FaVideo /></button>
              <button className="p-2 bg-gray-700 text-white rounded"><FaCog /></button>
            </div>
          </div>

          {/* Phần tin nhắn */}
          <div className="flex-1 overflow-auto p-4 bg-black flex flex-col">
            <div className="flex flex-col flex-1 justify-end">
              {messages.map((msg, index) => (
                <ChatMessage key={index} text={msg.text} sender={msg.sender} />
              ))}
            </div>
          </div>

          {/* Mini Form Booking */}
          {showBookingForm && (
            <div className="absolute bottom-16 left-4 w-96 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-white text-center">Book a Session</h3>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input type="number" placeholder="Day" value={day} onChange={(e) => setDay(e.target.value)} className="p-2 bg-gray-700 text-white rounded" />
                <input type="number" placeholder="Month" value={month} onChange={(e) => setMonth(e.target.value)} className="p-2 bg-gray-700 text-white rounded" />
                <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} className="p-2 bg-gray-700 text-white rounded col-span-2" />
                <input type="number" placeholder="Slot (1-5)" value={slot} onChange={(e) => setSlot(e.target.value)} className="p-2 bg-gray-700 text-white rounded col-span-2" />
              </div>

              <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 mt-2 bg-gray-700 text-white rounded" />
              <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-2 mt-2 bg-gray-700 text-white rounded h-20"></textarea>

              <div className="flex justify-between mt-3">
                <button onClick={handleBookRequest} className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 text-white">Send Request</button>
                <button onClick={toggleBookingForm} className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 text-white">Cancel</button>
              </div>
            </div>
          )}

          {/* Form nhập tin nhắn */}
          <div className="p-4 bg-black border-t border-gray-700 relative">
            <ChatboxForm onSend={handleSend} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
