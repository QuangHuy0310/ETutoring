"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import ChatboxForm from "@/app/chatbox/chatboxform";
import { ChatMessage } from "@/app/chatbox/chatmessage";
import { FaPhone, FaVideo, FaCog } from "react-icons/fa";
import Layout from "@/app/componets/layout";
import ChatSidebar from "@/app/chatbox/chatsidebar";
import { getCookie } from "cookies-next";

let socket: Socket;

interface ChatMessageItem {
  text: string;
  sender: "me" | "other";
  senderId: string;
  createdAt?: string;
}

export default function ChatboxPage() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const userIdRef = useRef<string | null>(null);
  const currentRoomRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null); // 👈 Scroll ref

  const fetchMessages = async (roomId: string) => {
    const token = getCookie("accessToken");
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

      const history: ChatMessageItem[] = data.map((msg: any) => ({
        text: String(msg.message),
        sender: msg.senderId === userIdRef.current ? "me" : "other",
        senderId: msg.senderId,
        createdAt: msg.createdAt,
      }));

      setMessages(history.reverse());
    } catch (err) {
      console.error("❌ Lỗi khi fetch messages:", err);
    }
  };

  useEffect(() => {
    const token = getCookie("accessToken");

    if (!token) return;

    try {
      // Parse userId from token
      const tokenParts = token.toString().split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const uid = payload.userId || payload.id || payload.sub;
        setUserId(uid);
        userIdRef.current = uid;
      }
    } catch (error) {
      console.error("❌ Lỗi khi parse token:", error);
    }

    socket = io("http://localhost:3008", {
      transports: ["websocket"],
      query: { token },
    });

    socket.on("connect", () => console.log("✅ Socket connected"));
    socket.on("disconnect", (reason) =>
      console.warn("❌ Socket disconnected:", reason)
    );

    socket.on("newMessage", (msg: any) => {
      if (msg.roomId === currentRoomRef.current) {
        const senderType = msg.senderId === userIdRef.current ? "me" : "other";
        setMessages((prev) => [
          ...prev,
          {
            text: msg.message,
            sender: senderType,
            senderId: msg.senderId,
            createdAt: msg.createdAt,
          },
        ]);
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

  // 👇 Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (message: string) => {
    if (!currentRoom) return alert("Bạn chưa chọn phòng");
    const token = getCookie("accessToken");
    if (!token) return alert("Token không tồn tại");

    const url = new URL("http://localhost:3002/api/v1/chat/chat/newMessage");
    url.searchParams.append("roomId", currentRoom);
    url.searchParams.append("message", message);

    try {
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      <div className="flex flex-row flex-1 h-full bg-black border border-gray-700 rounded-lg shadow-xl">
        {/* Sidebar trái: danh sách phòng */}
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

        {/* Nội dung chat */}
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
              <button className="p-2 bg-gray-700 text-white rounded">
                <FaPhone />
              </button>
              <button className="p-2 bg-gray-700 text-white rounded">
                <FaVideo />
              </button>
              <button
                className="p-2 bg-gray-700 text-white rounded"
                onClick={() => setShowSidebar(true)}
              >
                <FaCog />
              </button>
            </div>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-auto p-4 bg-black flex flex-col">
            <div className="flex flex-col flex-1 justify-end">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  text={msg.text}
                  sender={msg.sender}
                  senderId={msg.senderId}
                  createdAt={msg.createdAt}
                />
              ))}
              <div ref={bottomRef} /> {/* 👈 Element để cuộn tới */}
            </div>
          </div>

          {/* Form nhập */}
          <div className="p-4 bg-black border-t border-gray-700 relative">
            <ChatboxForm onSend={handleSend} />
          </div>
        </div>

        {/* Sidebar phải: ChatSidebar */}
        {showSidebar && (
          <div className="w-[350px] h-full max-h-full overflow-y-auto border-l border-gray-700">
            <ChatSidebar
              onClose={() => setShowSidebar(false)}
              messages={messages}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
