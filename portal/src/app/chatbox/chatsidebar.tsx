"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FaSearch,
  FaChevronDown,
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
} from "react-icons/fa";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import { getCookie } from "cookies-next";

interface FileItem {
  _id: string;
  filename: string;
  fileUrl: string;
  mime: string;
  senderId: string;
  createdAt?: string;
  type: "pdf" | "word" | "excel" | "ppt" | "other";
  comment?: string;
}

interface ChatMessageItem {
  text: string;
  sender: "me" | "other";
  senderId: string;
  createdAt?: string;
}

interface ChatSidebarProps {
  onClose: () => void;
  messages: ChatMessageItem[];
}

export default function ChatSidebar({ onClose, messages }: ChatSidebarProps) {
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [commentBoxOpenId, setCommentBoxOpenId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState<string>("");

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
  const roomId = typeof window !== "undefined" ? localStorage.getItem("currentRoom") : null;

  const fetchDocs = async () => {
    const token = getCookie("accessToken");
    if (!token || !roomId) return;

    try {
      const url = new URL("http://localhost:3002/get-document");
      url.searchParams.set("roomId", roomId);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      const docs = result?.data;

      if (!Array.isArray(docs)) return;

      const parsed: FileItem[] = docs.map((doc) => {
        const ext = doc.path?.split(".").pop()?.toLowerCase() || "";
        let type: FileItem["type"] = "other";
        if (ext.includes("pdf")) type = "pdf";
        else if (ext.includes("doc")) type = "word";
        else if (ext.includes("ppt")) type = "ppt";
        else if (ext.includes("xls") || ext.includes("csv")) type = "excel";

        return {
          _id: doc._id,
          filename: doc.name || doc.title,
          fileUrl: doc.path,
          mime: ext,
          senderId: doc.userId,
          createdAt: doc.createdAt,
          comment: doc.comment,
          type,
        };
      });

      setFileList(parsed);
    } catch (e) {
      console.error("❌ Lỗi fetch tài liệu:", e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [roomId]);

  const handleSendComment = async (fileId: string) => {
    const token = getCookie("accessToken");
    if (!token || !fileId || !commentDraft.trim()) return;

    try {
      const url = new URL("http://localhost:3002/new-comment-document");
      url.searchParams.set("id", fileId);
      url.searchParams.set("comment", commentDraft.trim());

      const res = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to comment");

      console.log("✅ Comment sent");
      setCommentBoxOpenId(null);
      setCommentDraft("");
      await fetchDocs(); // ✅ Không reload nữa!
    } catch (err) {
      console.error("❌ Lỗi gửi comment:", err);
    }
  };

  const filteredFiles = useMemo(() => {
    return fileList
      .filter((file) =>
        !search || file.filename.toLowerCase().includes(search.toLowerCase())
      )
      .filter((file) => !selectedType || file.type === selectedType);
  }, [fileList, search, selectedType]);

  const groupFilesByDate = (files: FileItem[]) => {
    const grouped: { [date: string]: FileItem[] } = {};
    files.forEach((file) => {
      const date = file.createdAt
        ? new Date(file.createdAt).toLocaleDateString("vi-VN")
        : "Không rõ ngày";
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(file);
    });
    return grouped;
  };

  const groupedFiles = useMemo(() => groupFilesByDate(filteredFiles), [filteredFiles]);

  const groupedImages = useMemo(() => {
    const grouped: { [date: string]: string[] } = {};

    messages.forEach((msg) => {
      let urls: string[] = [];

      try {
        const parsed = JSON.parse(msg.text);
        if (parsed?.type === "image-gallery" && Array.isArray(parsed.images)) {
          urls = parsed.images;
        }
      } catch {
        if (
          msg.text.startsWith("http") &&
          msg.text.match(/\.(jpeg|jpg|png|gif|webp)$/i)
        ) {
          urls = [msg.text];
        }
      }

      if (urls.length > 0) {
        const date = msg.createdAt
          ? new Date(msg.createdAt).toLocaleDateString("vi-VN")
          : new Date().toLocaleDateString("vi-VN");

        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(...urls);
      }
    });

    return grouped;
  }, [messages]);

  const fileTypeOptions = [
    { label: "Tất cả", icon: <span className="text-white">📁</span>, value: null },
    { label: "PDF", icon: <FaFilePdf className="text-red-500" />, value: "pdf" },
    { label: "Word", icon: <FaFileWord className="text-blue-500" />, value: "word" },
    { label: "PowerPoint", icon: <FaFilePowerpoint className="text-orange-500" />, value: "ppt" },
    { label: "Excel", icon: <FaFileExcel className="text-green-500" />, value: "excel" },
  ];

  return (
    <div className="w-[350px] h-full bg-[#1e1e1e] text-white shadow-lg z-50 border-l border-gray-700 flex flex-col overflow-y-auto overflow-x-hidden">
      <div className="p-4 border-b border-gray-700 font-semibold text-lg flex justify-between items-center">
        Information Chatbox
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>

      <Tab.Group>
        <Tab.List className="flex border-b border-gray-700">
          {["Photos", "Files"].map((tab, idx) => (
            <Tab
              key={idx}
              className={({ selected }) =>
                clsx(
                  "flex-1 py-2 text-center font-medium",
                  selected ? "border-b-2 border-blue-500 text-white" : "text-gray-400"
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="flex-1">
          <Tab.Panel className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-700">
              {Object.entries(groupedImages).map(([date, urls]) => (
                <div key={date}>
                  <h3 className="text-white font-semibold mb-2">
                    📅 Day {date.replaceAll("/", " Tháng ")}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {urls.map((url, idx) => (
                      <img
                        key={`${date}-${idx}`}
                        src={url}
                        alt={`Ảnh ${idx}`}
                        className="rounded object-cover w-full aspect-square bg-gray-700 max-w-full cursor-pointer"
                        onClick={() => setSelectedImage(url)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Tab.Panel>

          <Tab.Panel className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600">
            <div className="flex items-center mb-3 bg-gray-800 px-3 py-2 rounded">
              <FaSearch className="mr-2 text-gray-400" />
              <input
                placeholder="Tìm kiếm File"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-white w-full"
              />
            </div>

            <div className="flex gap-2 mb-4">
              <div className="relative">
                <button
                  onClick={() => setTypeOpen(!typeOpen)}
                  className="flex items-center px-2 py-1 bg-gray-800 rounded text-sm"
                >
                  Type <FaChevronDown className="ml-1" />
                </button>
                {typeOpen && (
                  <div className="absolute z-10 mt-2 bg-gray-900 border border-gray-700 rounded shadow-lg max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                    {fileTypeOptions.map((type) => (
                      <div
                        key={type.label}
                        className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-700"
                        onClick={() => {
                          setSelectedType(type.value);
                          setTypeOpen(false);
                        }}
                      >
                        {type.icon}
                        <span className="ml-2">{type.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {Object.entries(groupedFiles).map(([date, files]) => (
              <div key={date} className="mb-4">
                <div className="text-sm text-gray-400 mb-2">📅 Day {date}</div>
                <ul>
                  {files.map((file, i) => (
                    <li key={i} className="p-2 bg-gray-800 rounded mb-2 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:underline max-w-[75%] truncate"
                        >
                          📎 {file.filename}
                        </a>
                        <span className="text-xs text-green-400">✓</span>
                      </div>

                      {file.comment && (
                        <div className="text-sm text-gray-300 italic mb-1 px-1">
                          💬 {file.comment}
                        </div>
                      )}

                      {["admin", "staff", "tutor"].includes(role || "") &&
                        userId !== file.senderId && (
                          <div className="flex justify-end">
                            {commentBoxOpenId === file._id ? (
                              <div className="mt-2 w-full">
                                <input
                                  className="w-full p-1 text-sm rounded bg-gray-700 text-white border border-gray-600"
                                  value={commentDraft}
                                  onChange={(e) => setCommentDraft(e.target.value)}
                                  placeholder="Nhập comment..."
                                />
                                <div className="flex gap-2 mt-2 justify-end">
                                  <button
                                    className="text-sm px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                    onClick={() => handleSendComment(file._id)}
                                  >
                                    Send
                                  </button>
                                  <button
                                    className="text-sm px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded"
                                    onClick={() => {
                                      setCommentBoxOpenId(null);
                                      setCommentDraft("");
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="text-xs text-blue-400 hover:underline mt-1"
                                onClick={() => {
                                  setCommentBoxOpenId(file._id);
                                  setCommentDraft(file.comment || "");
                                }}
                              >
                                💬 Comment
                              </button>
                            )}
                          </div>
                        )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[999]"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg object-contain"
          />
        </div>
      )}
    </div>
  );
}
