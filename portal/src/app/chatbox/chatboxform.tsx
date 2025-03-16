"use client";

import { useState } from "react";
import { FaPaperPlane, FaSmile, FaPlus } from "react-icons/fa";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

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

  const addEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSend(`📎 ${file.name}`);
    }
  };

  return (
    <div className="flex items-center p-4 border-t border-gray-700 bg-gray-800">
      {/* Menu chọn file */}
      <Menu as="div" className="relative">
        <Menu.Button className="mx-2 p-2 hover:bg-gray-700 rounded transition">
          <FaPlus className="text-white" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 bottom-12 w-40 bg-gray-800 shadow-lg border border-gray-700 rounded-md">
            <label className="block p-2 cursor-pointer hover:bg-gray-700">
              📷 Gửi ảnh
              <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
            </label>
            <label className="block p-2 cursor-pointer hover:bg-gray-700">
              📄 Gửi tài liệu
              <input type="file" accept=".pdf,.doc,.docx,.txt" hidden onChange={handleFileUpload} />
            </label>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Input chat */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Emoji Picker */}
      <Menu as="div" className="relative">
        <Menu.Button className="mx-2 p-2 hover:bg-gray-700 rounded transition">
          <FaSmile className="text-white" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 bottom-12 w-40 bg-gray-800 shadow-lg border border-gray-700 rounded-md p-2 grid grid-cols-5 gap-2 text-lg">
            {["😀", "😂", "😍", "😎", "😭", "👍", "👏", "🔥", "💯", "🎉"].map((emoji) => (
              <button key={emoji} onClick={() => addEmoji(emoji)}>
                {emoji}
              </button>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Gửi tin nhắn */}
      <button
        onClick={handleSend}
        className="ml-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200"
      >
        <FaPaperPlane />
      </button>
    </div>
  );
}
