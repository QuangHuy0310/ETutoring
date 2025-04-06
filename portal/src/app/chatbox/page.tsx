"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import ChatboxForm from "@/app/chatbox/chatboxform";
import { ChatMessage } from "@/app/chatbox/chatmessage";
import { FaPhone, FaVideo, FaCog } from "react-icons/fa";
import Layout from "@/app/componets/layout";

let socket: Socket;

export default function ChatboxPage() {
  const [messages, setMessages] = useState<{ text: string; sender: "me" | "other" }[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      const uid = localStorage.getItem("userId");

      if (!token || !uid) {
        console.warn("⛔ Token hoặc userId thiếu — ngừng kết nối WebSocket");
        return;
      }

      setUserId(uid);

      socket = io("http://localhost:3008", {
        transports: ["websocket"],
        query: { token },
      });

      socket.on("connect", () => {
        console.log("✅ Socket connected");
      });

      socket.on("disconnect", (reason) => {
        console.warn("❌ Socket disconnected:", reason);
      });

      socket.on("newMessage", (msg) => {
        console.log("📩 Tin nhắn đến:", msg);
        if (msg.roomId === currentRoom) {
          setMessages((prev) => [
            ...prev,
            {
              text: String(msg.message),
              sender: msg.senderId === uid ? "me" : "other",
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
            setCurrentRoom(roomList[0]);
            roomList.forEach((roomId) => {
              socket.emit("joinRoom", { roomId });
              console.log(`📶 Joined room: ${roomId}`);
            });
          }
        })
        .catch((err) => {
          console.error("❌ Lỗi khi fetch get-room:", err);
        });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    if (!currentRoom || !userId) return;

    const token = localStorage.getItem("accessToken");
    const url = `http://localhost:3002/api/v1/chat/chat/messages?roomId=${currentRoom}&limit=50`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((response) => {
        const data = response?.data;

        if (!Array.isArray(data)) {
          console.error("❌ Message history không phải mảng:", data);
          return;
        }

        const history = data.map(
          (msg: any): { text: string; sender: "me" | "other" } => ({
            text: String(msg.message),
            sender: msg.senderId === userId ? "me" : "other",
          })
        );

        setMessages(history.reverse());
        console.log(`✅ ${history.length} messages loaded`);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi fetch messages:", err);
      });
  }, [currentRoom, userId]);

  const handleSend = async (message: string) => {
    if (!currentRoom) return alert("Bạn chưa chọn phòng");
    const token = localStorage.getItem("accessToken");

    const url = new URL("http://localhost:3002/api/v1/chat/chat/newMessage");
    url.searchParams.append("roomId", currentRoom);
    url.searchParams.append("message", message);

    console.log("📤 Pushing message via REST first...");

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

    console.log("✅ REST push OK, now emit socket");

    socket?.emit("sendMessage", {
      roomId: currentRoom,
      message,
    });

    setMessages((prev) => [...prev, { text: message, sender: "me" }]);
  };

  return (
    <Layout>
      <div className="flex flex-1 h-full bg-black border border-gray-700 rounded-lg shadow-xl">
        <div className="w-[300px] bg-black border-r border-gray-700 p-4">
          <h2 className="text-xl font-semibold text-white mb-4">Chat Rooms</h2>
          <ul>
            {Array.isArray(rooms) &&
              rooms.map((room) => (
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
          <div className="flex items-center justify-between p-4 bg-black border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
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
              <button className="p-2 bg-gray-700 text-white rounded">
                <FaCog />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-black flex flex-col">
            <div className="flex flex-col flex-1 justify-end">
              {messages.map((msg, index) => (
                <ChatMessage key={index} text={msg.text} sender={msg.sender} />
              ))}
            </div>
          </div>

          <div className="p-4 bg-black border-t border-gray-700 relative">
            <ChatboxForm onSend={handleSend} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
