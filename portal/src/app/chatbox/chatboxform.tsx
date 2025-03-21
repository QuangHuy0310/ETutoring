"use client";

import { useState } from "react";
import { FaPaperPlane, FaSmile, FaPlus, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface ChatboxFormProps {
  onSend: (message: string) => void;
}

export default function ChatboxForm({ onSend }: ChatboxFormProps) {
  const [input, setInput] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [slot, setSlot] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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
      if (file.type.startsWith("image/")) {
        const imageUrl = URL.createObjectURL(file); // Tạo URL tạm thời cho ảnh
        onSend(imageUrl); // Gửi URL lên chat ngay lập tức
      } else {
        setSelectedFiles((prevFiles) => [...prevFiles, file]); // Thêm vào danh sách chờ gửi
      }
    }
  };
  

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const sendFiles = () => {
    selectedFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        onSend(`📎 ${file.name} (${file.type || "Unknown"})`);
      }
    });
    setSelectedFiles([]);
  };

  const toggleBookingForm = () => {
    setShowBookingForm(!showBookingForm);
  };

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

  return (
    <div className="flex items-center p-4 border-t border-gray-700 bg-gray-800 relative">
      {/* Nút "+" */}
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
              📷 Photo
              <input type="file" accept="image/*" multiple hidden onChange={handleFileUpload} />
            </label>
            <label className="block p-2 cursor-pointer hover:bg-gray-700">
              📄 Document
              <input type="file" accept=".pdf,.doc,.docx,.txt" multiple hidden onChange={handleFileUpload} />
            </label>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Hiển thị file đã chọn */}
      {selectedFiles.length > 0 && (
        <div className="absolute bottom-16 left-4 w-96 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          <h3 className="text-white text-lg font-semibold">Files to Send:</h3>
          <ul className="max-h-40 overflow-auto">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex justify-between items-center text-white p-2 bg-gray-700 rounded my-1">
                <span className="truncate max-w-[80%]">{file.name}</span>
                <button onClick={() => removeFile(index)} className="text-red-400 hover:text-red-600">
                  <FaTimes />
                </button>
              </li>
            ))}
          </ul>
          <button onClick={sendFiles} className="w-full mt-2 p-2 bg-blue-500 rounded hover:bg-blue-600 text-white">
            Send Files
          </button>
        </div>
      )}

      {/* Nút "Book" */}
      <button onClick={toggleBookingForm} className="mx-2 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
        <FaCalendarAlt />
      </button>

      {/* Mini Form Booking */}
{showBookingForm && (
  <div className="absolute bottom-16 left-4 w-96 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
    <h3 className="text-lg font-semibold text-white text-center">Book a Session</h3>

    <input 
  type="date" 
  value={day} 
  onChange={(e) => setDay(e.target.value)} 
  min={new Date().toISOString().split("T")[0]} // Chặn ngày trong quá khứ
  className="w-full p-2 bg-gray-700 text-white rounded mt-2"
/>


    {/* Chọn Slot theo thời gian */}
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
      className="w-full p-2 mt-2 bg-gray-700 text-white rounded h-20">
    </textarea>

    <div className="flex justify-between mt-3">
      <button onClick={handleBookRequest} className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 text-white">
        Send Request
      </button>
      <button onClick={toggleBookingForm} className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 text-white">
        Cancel
      </button>
    </div>
  </div>
)}
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


      {/* Input chat */}
      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />

      {/* Gửi tin nhắn */}
      <button onClick={handleSend} className="ml-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200">
        <FaPaperPlane />
      </button>
    </div>
  );
}
