"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import ChatboxForm from "@/app/chatbox/chatboxform";
import { ChatMessage } from "@/app/chatbox/chatmessage";
import { FaPhone, FaVideo, FaCog } from "react-icons/fa";
import Layout from "@/app/componets/layout";
import ChatSidebar from "@/app/chatbox/chatsidebar"; // ✅ Import mới

let socket: Socket;

export default function ChatboxPage() {
  const [messages, setMessages] = useState<{ text: string; sender: "me" | "other" }[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false); // ✅ State mở sidebar

  const userIdRef = useRef<string | null>(null);
  const currentRoomRef = useRef<string | null>(null);

  const fetchMessages = async (roomId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch(
        `http://localhost:3002/api/v1/chat/chat/messages?roomId=${roomId}&limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const response = await res.json();
      const data = response?.data;

      if (!Array.isArray(data)) {
        console.error("❌ Message history không phải mảng:", data);
        return;
      }

      const history = data.map((msg: any): { text: string; sender: "me" | "other" } => ({
        text: String(msg.message),
        sender: msg.senderId === userIdRef.current ? "me" : "other",
      }));

      setMessages(history.reverse());
    } catch (err) {
      console.error("❌ Lỗi khi fetch messages:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const uid = localStorage.getItem("userId");

    if (!token || !uid) return;

    setUserId(uid);
    userIdRef.current = uid;

    socket = io("http://localhost:3008", {
      transports: ["websocket"],
      query: { token },
    });

    socket.on("connect", () => console.log("✅ Socket connected"));
    socket.on("disconnect", (reason) => console.warn("❌ Socket disconnected:", reason));

    socket.on("newMessage", (msg: any) => {
      if (msg.roomId === currentRoomRef.current) {
        const senderType = msg.senderId === userIdRef.current ? "me" : "other";
        setMessages((prev) => [...prev, { text: msg.message, sender: senderType }]);
      }
    });

    fetch("http://localhost:3002/get-room", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((response) => {
        const roomList = response?.data;
        if (!Array.isArray(roomList)) {
          console.error("❌ API /get-room không trả mảng:", roomList);
          setRooms([]);
          return;
        }

        setRooms(roomList);

        if (roomList.length > 0) {
          const firstRoom = roomList[0];
          setCurrentRoom(firstRoom);
          roomList.forEach((roomId) => {
            socket.emit("joinRoom", roomId);
          });
        }
      })
      .catch((err) => console.error("❌ Lỗi khi fetch get-room:", err));

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!currentRoom || !userId) return;
    currentRoomRef.current = currentRoom;
    fetchMessages(currentRoom);
  }, [currentRoom, userId]);

  const handleSend = async (message: string) => {
    if (!currentRoom) return alert("Bạn chưa chọn phòng");
    const token = localStorage.getItem("accessToken");
    if (!token) return alert("Token không tồn tại");

    const url = new URL("http://localhost:3002/api/v1/chat/chat/newMessage");
    url.searchParams.append("roomId", currentRoom);
    url.searchParams.append("message", message);

    try {
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("❌ REST API lỗi:", res.status);
        return;
      }

      console.log("✅ Tin nhắn đã gửi, chờ socket update UI...");
    } catch (err) {
      console.error("❌ Lỗi khi gửi tin nhắn:", err);
    }
  };

  return (
    <Layout>
      <div className="flex flex-1 h-full bg-black border border-gray-700 rounded-lg shadow-xl relative">
        {/* Sidebar Toggle */}
        {showSidebar && <ChatSidebar onClose={() => setShowSidebar(false)} />} {/* ✅ Thêm UI sidebar */}

        <div className="w-[300px] bg-black border-r border-gray-700 p-4">
          <h2 className="text-xl font-semibold text-white mb-4">Chat Rooms</h2>
          <ul>
            {rooms.map((room) => (
              <li
                key={room}
                className={`p-2 rounded cursor-pointer hover:bg-gray-700 ${
                  room === currentRoom ? "bg-gray-700" : ""
                }`}
                onClick={() => setCurrentRoom(room)}
              >
                🏠 Room: {room.slice(0, 8)}...
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col flex-1 h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full" />
              <span className="text-lg font-semibold text-white">
                Room: {currentRoom ?? "None"}
              </span>
            </div>
            <div className="flex space-x-4">
              <button className="p-2 bg-gray-700 text-white rounded"><FaPhone /></button>
              <button className="p-2 bg-gray-700 text-white rounded"><FaVideo /></button>
              <button className="p-2 bg-gray-700 text-white rounded" onClick={() => setShowSidebar(true)}>
                <FaCog />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-auto p-4 bg-black flex flex-col">
            <div className="flex flex-col flex-1 justify-end">
              {messages.map((msg, index) => {
                let parsed;
                try {
                  parsed = JSON.parse(msg.text);
                } catch {
                  parsed = null;
                }

                if (parsed?.type === "image-gallery" && Array.isArray(parsed.images)) {
                  return (
                    <div key={index} className={`mb-4 ${msg.sender === "me" ? "text-right" : "text-left"}`}>
                      <div className="flex gap-2 overflow-x-auto max-w-full scrollbar-hide">
                        {parsed.images.map((url: string, i: number) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Gallery ${i}`}
                            className="w-32 h-32 object-cover rounded shadow"
                          />
                        ))}
                      </div>
                    </div>
                  );
                }

                if (parsed?.type === "doc-attachment" && parsed.fileUrl && parsed.filename) {
                  return (
                    <div key={index} className={`mb-3 ${msg.sender === "me" ? "text-right" : "text-left"}`}>
                      <a
                        href={parsed.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-blue-400 hover:text-blue-300 underline"
                      >
                        📎 {parsed.filename}
                      </a>
                    </div>
                  );
                }

                if (msg.text.startsWith("http") && msg.text.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
                  return (
                    <div key={index} className={`mb-2 ${msg.sender === "me" ? "text-right" : "text-left"}`}>
                      <img
                        src={msg.text}
                        alt="Image"
                        className="inline-block max-w-[300px] rounded-lg shadow-lg"
                      />
                    </div>
                  );
                }

                return <ChatMessage key={index} text={msg.text} sender={msg.sender} />;
              })}
            </div>
          </div>

          {/* Form Input */}
          <div className="p-4 bg-black border-t border-gray-700 relative">
            <ChatboxForm onSend={handleSend} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
