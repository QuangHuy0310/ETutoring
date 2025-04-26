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

interface RoomInfo {
  roomId: string;
  name: string;
  avatarPath?: string;
}

export default function ChatboxPage() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [roomInfos, setRoomInfos] = useState<RoomInfo[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const userIdRef = useRef<string | null>(null);
  const currentRoomRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async (roomId: string) => {
    const token = getCookie("accessToken");
    if (!token) return;

    try {
      const res = await fetch(
        `http://localhost:3002/api/v1/chat/chat/messages?roomId=${roomId}&limit=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
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

  const handleJoinRoom = (roomId: string) => {
    if (!socket) return;
    socket.emit("joinRoom", roomId);
    console.log("🔗 [Socket Emit] joinRoom:", roomId);
  };

  useEffect(() => {
    const token = getCookie("accessToken");
    if (!token) return;

    try {
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

    socket = io("http://localhost:3002", {
      transports: ["websocket"],
      query: { token },
    });

    socket.on("connect", () => {
      console.log("🛰️ [Socket Connected]:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("🔌 [Socket Disconnected]:", reason);
    });

    socket.on("newMessage", (msg: any) => {
      if (!msg || !msg.roomId || !msg.senderId || !msg.message) {
        console.warn("❌ [Socket] Payload không hợp lệ:", msg);
        return;
      }

      const roomFromSocket = String(msg.roomId).trim();
      const current = String(currentRoomRef.current).trim();

      if (roomFromSocket === current) {
        setMessages((prev) => [
          ...prev,
          {
            text: msg.message,
            sender: msg.senderId === userIdRef.current ? "me" : "other",
            senderId: msg.senderId,
            createdAt: msg.createdAt || new Date().toISOString(),
          },
        ]);
      }
    });

    const fetchRoomsAndNames = async () => {
      try {
        const res = await fetch("http://localhost:3002/get-room", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const response = await res.json();
        const roomList = response?.data;
        if (!Array.isArray(roomList)) {
          console.error("❌ API /get-room không trả mảng:", roomList);
          return;
        }

        const fetchNames = await Promise.all(
          roomList.map(async (roomId: string) => {
            try {
              const res = await fetch(
                `http://localhost:3002/get-user-by-roomId?roomId=${roomId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const result = await res.json();
              const users = result?.data;

              if (!Array.isArray(users)) {
                return { roomId, name: "Unknown", avatarPath: null };
              }

              const otherUser = users.find((user: any) => user.userId !== userIdRef.current);

              if (!otherUser) {
                return { roomId, name: "Unknown", avatarPath: null };
              }

              // 🎯 Gọi tiếp /get-infors
              const infoRes = await fetch(
                `http://localhost:3002/get-infors?idUser=${otherUser.userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const infos = await infoRes.json();
              const infoData = infos?.data?.[0];

              return {
                roomId,
                name: otherUser.name || "Unknown",
                avatarPath: infoData?.path || null,
              };
            } catch (error) {
              console.error("❌ Lỗi fetch userInfo:", error);
              return { roomId, name: "Unknown", avatarPath: null };
            }
          })
        );

        setRoomInfos(fetchNames);

        if (roomList.length > 0) {
          setCurrentRoom(roomList[0]);
          localStorage.setItem("currentRoom", roomList[0]);
        }
      } catch (err) {
        console.error("❌ Lỗi khi fetch get-room:", err);
      }
    };

    fetchRoomsAndNames();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!currentRoom || !userId) return;
    currentRoomRef.current = currentRoom;
    handleJoinRoom(currentRoom);
    fetchMessages(currentRoom);
  }, [currentRoom, userId]);

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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("❌ REST API lỗi:", res.status);
        return;
      }

      console.log("✅ [REST API] Tin nhắn đã gửi thành công");
    } catch (err) {
      console.error("❌ Lỗi khi gửi tin nhắn:", err);
    }
  };

  const currentRoomInfo = roomInfos.find((room) => room.roomId === currentRoom);

  return (
    <Layout>
      <div className="flex flex-row flex-1 h-full bg-black border border-gray-700 rounded-lg shadow-xl">
        {/* Sidebar */}
        <div className="w-[300px] bg-black border-r border-gray-700 p-4">
          <h2 className="text-xl font-semibold text-white mb-4">Chat Rooms</h2>
          <ul>
            {roomInfos.map((room) => (
              <li
                key={room.roomId}
                className={`p-2 rounded cursor-pointer hover:bg-gray-700 ${
                  room.roomId === currentRoom ? "bg-gray-700" : ""
                }`}
                onClick={() => {
                  setCurrentRoom(room.roomId);
                  localStorage.setItem("currentRoom", room.roomId);
                  handleJoinRoom(room.roomId);
                }}
              >
                🏠 {room.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Content */}
        <div className="flex flex-col flex-1 h-full">
          <div className="flex items-center justify-between p-4 bg-black border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <img
                src={
                  currentRoomInfo?.avatarPath
                    ? currentRoomInfo.avatarPath.startsWith("http")
                      ? currentRoomInfo.avatarPath
                      : "/default-avatar.png"
                    : "/default-avatar.png"
                }
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-lg font-semibold text-white">
                {currentRoomInfo?.name || "Đang chọn phòng..."}
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
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="p-4 bg-black border-t border-gray-700 relative">
            <ChatboxForm onSend={handleSend} />
          </div>
        </div>

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
