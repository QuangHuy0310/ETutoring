"use client";

import { useState } from "react";
import ChatboxForm from "@/app/chatbox/chatboxform";
import { ChatMessage } from "@/app/chatbox/chatmessage"; 
import { FaPhone, FaVideo, FaCog } from "react-icons/fa";
import Layout from "@/app/componets/layout";

export default function ChatboxPage() {
  const [messages, setMessages] = useState<{ text: string; sender: "me" | "other" }[]>([]);

  const handleSend = (message: string) => {
    setMessages([...messages, { text: message, sender: "me" }]);
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen bg-black text-white"> {/* Nền đen, chữ trắng */}
        {/* Nội dung chính */}
        <div className="flex flex-1 overflow-hidden h-full">
          {/* Sidebar bên trái */}
          <div className="w-[300px] bg-black border-r border-gray-700 p-4"> {/* Đổi nền đen */}
            <h2 className="text-xl font-semibold">Chats</h2>
            <ul className="mt-4">
              <li className="p-2 hover:bg-gray-700 rounded cursor-pointer">Group Chat</li>
              <li className="p-2 hover:bg-gray-700 rounded cursor-pointer">User 1</li>
              <li className="p-2 hover:bg-gray-700 rounded cursor-pointer">User 2</li>
            </ul>
          </div>
  
          {/* Khu vực chat */}
          <div className="flex flex-col flex-1 h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black border-b border-gray-700"> {/* Đổi nền đen */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-600 rounded-full"></div> {/* Đổi màu avatar */}
                <span className="text-lg font-semibold">Username</span>
              </div>
              <div className="flex space-x-4">
                <button className="p-2 bg-gray-700 text-white rounded"><FaPhone /></button>
                <button className="p-2 bg-gray-700 text-white rounded"><FaVideo /></button>
                <button className="p-2 bg-gray-700 text-white rounded"><FaCog /></button>
              </div>
            </div>
  
            {/* Phần tin nhắn */}
            <div className="flex-1 overflow-auto p-4 bg-black flex flex-col h-full"> {/* Đổi nền đen */}
              <div className="flex flex-col flex-1 justify-end">
                {messages.map((msg, index) => (
                  <ChatMessage key={index} text={msg.text} sender={msg.sender} />
                ))}
              </div>
            </div>
  
            {/* Form nhập tin nhắn */}
            <div className="p-4 bg-black border-t border-gray-700"> {/* Đổi nền đen */}
              <ChatboxForm onSend={handleSend} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
