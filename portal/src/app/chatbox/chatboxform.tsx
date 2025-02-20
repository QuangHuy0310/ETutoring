"use client";

import { useState } from "react";
import { FaPaperPlane, FaSmile, FaMicrophone, FaVideo, FaFile, FaImage } from "react-icons/fa";

interface ChatboxFormProps {
  onSend: (message: string) => void;
}

export default function ChatboxForm({ onSend }: ChatboxFormProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input); 
      setInput(""); 
    }
  };

  return (
    <div className="flex items-center p-4 border-t border-gray-700 bg-gray-800">
      <FaImage className="cursor-pointer mx-2 hover:text-yellow-400 transition duration-200" />
      <FaVideo className="cursor-pointer mx-2 hover:text-red-400 transition duration-200" />
      <FaMicrophone className="cursor-pointer mx-2 hover:text-green-400 transition duration-200" />
      <FaFile className="cursor-pointer mx-2 hover:text-gray-400 transition duration-200" />
      
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)} 
        placeholder="Type a message..."
        className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <FaSmile className="cursor-pointer mx-2 hover:text-yellow-400 transition duration-200" />
      
      <button
        onClick={handleSend}
        className="ml-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200"
      >
        <FaPaperPlane />
      </button>
    </div>
  );
}
