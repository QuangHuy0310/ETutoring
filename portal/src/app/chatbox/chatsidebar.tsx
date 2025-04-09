"use client";

import { useState, useMemo } from "react";
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

interface ChatMessageItem {
  text: string;
  sender: "me" | "other";
  senderId: string;
  createdAt?: string;
}

interface FileItem {
  filename: string;
  fileUrl: string;
  mime: string;
  senderId: string;
  createdAt?: string;
  type: "pdf" | "word" | "excel" | "ppt" | "other";
}

interface ChatSidebarProps {
  onClose: () => void;
  messages: ChatMessageItem[];
}

export default function ChatSidebar({ onClose, messages }: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [typeOpen, setTypeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const extractImagesByDate = () => {
    const grouped: { [date: string]: string[] } = {};

    messages.forEach((msg) => {
      let urls: string[] = [];

      try {
        const parsed = JSON.parse(msg.text);
        if (parsed?.type === "image-gallery" && Array.isArray(parsed.images)) {
          urls = parsed.images;
        }
      } catch {
        if (msg.text.startsWith("http") && msg.text.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
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
  };

  const groupedImages = useMemo(() => extractImagesByDate(), [messages]);

  const extractFiles = (): FileItem[] => {
    const fileList: FileItem[] = [];

    messages.forEach((msg) => {
      try {
        const parsed = JSON.parse(msg.text);
        if (parsed?.type === "doc-attachment" && parsed.fileUrl && parsed.filename) {
          const mime = parsed.mime || "application/octet-stream";
          const lower = mime.toLowerCase();

          let type: FileItem["type"] = "other";
          if (lower.includes("pdf")) type = "pdf";
          else if (lower.includes("word") || lower.includes("doc")) type = "word";
          else if (lower.includes("excel") || lower.includes("sheet")) type = "excel";
          else if (lower.includes("presentation") || lower.includes("powerpoint") || lower.includes("ppt")) type = "ppt";

          fileList.push({
            filename: parsed.filename,
            fileUrl: parsed.fileUrl,
            mime,
            senderId: msg.senderId,
            createdAt: msg.createdAt,
            type,
          });
        }
      } catch {}
    });

    return fileList;
  };

  const filteredFiles = useMemo(() => {
    return extractFiles()
      .filter((file) => !search || file.filename.toLowerCase().includes(search.toLowerCase()))
      .filter((file) => !selectedType || file.type === selectedType)
      .filter((file) => {
        const fileDate = new Date(file.createdAt ?? "").getTime();
        return (
          (!fromDate || fileDate >= new Date(fromDate).getTime()) &&
          (!toDate || fileDate <= new Date(toDate).getTime())
        );
      });
  }, [messages, search, selectedType, fromDate, toDate]);

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

  const fileTypeOptions = [
    { label: "PDF", icon: <FaFilePdf className="text-red-500" />, value: "pdf" },
    { label: "Word", icon: <FaFileWord className="text-blue-500" />, value: "word" },
    { label: "PowerPoint", icon: <FaFilePowerpoint className="text-orange-500" />, value: "ppt" },
    { label: "Excel", icon: <FaFileExcel className="text-green-500" />, value: "excel" },
  ];

  return (
    <div className="w-[350px] h-full bg-[#1e1e1e] text-white shadow-lg z-50 border-l border-gray-700 flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 font-semibold text-lg flex justify-between items-center">
        Thông tin hội thoại
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>

      <Tab.Group>
        <Tab.List className="flex border-b border-gray-700">
          {["Ảnh", "Files", "Links"].map((tab, idx) => (
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
          {/* === TAB ẢNH === */}
          <Tab.Panel className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-700">
              {Object.entries(groupedImages).map(([date, urls]) => (
                <div key={date}>
                  <h3 className="text-white font-semibold mb-2">
                    📅 Ngày {date.replaceAll("/", " Tháng ")}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {urls.map((url, idx) => (
                      <img
                        key={`${date}-${idx}`}
                        src={url}
                        alt={`Ảnh ${idx}`}
                        className="rounded object-cover w-full aspect-square bg-gray-700 max-w-full"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Tab.Panel>

          {/* === TAB FILE === */}
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
                  Loại <FaChevronDown className="ml-1" />
                </button>
                {typeOpen && (
                  <div className="absolute z-10 mt-2 bg-gray-900 border border-gray-700 rounded shadow-lg">
                    {fileTypeOptions.map((type) => (
                      <div
                        key={type.value}
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

              <div className="relative">
                <button
                  onClick={() => setDateOpen(!dateOpen)}
                  className="flex items-center px-2 py-1 bg-gray-800 rounded text-sm"
                >
                  Ngày gửi <FaChevronDown className="ml-1" />
                </button>
                {dateOpen && (
                  <div className="absolute z-10 mt-2 bg-gray-900 border border-gray-700 rounded shadow-lg p-3 w-56">
                    <label className="text-xs text-gray-400 mb-1 block">Từ ngày</label>
                    <input
                      type="date"
                      className="w-full mb-2 p-1 rounded bg-gray-800 text-white"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                    <label className="text-xs text-gray-400 mb-1 block">Đến ngày</label>
                    <input
                      type="date"
                      className="w-full p-1 rounded bg-gray-800 text-white"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {Object.entries(groupedFiles).map(([date, files]) => (
              <div key={date} className="mb-4">
                <div className="text-sm text-gray-400 mb-2">📅 Ngày {date}</div>
                <ul>
                  {files.map((file, i) => (
                    <li
                      key={i}
                      className="p-2 bg-gray-800 rounded mb-2 flex justify-between items-center overflow-hidden"
                    >
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:underline max-w-[75%] truncate"
                      >
                        📎 {file.filename}
                      </a>
                      <span className="text-xs text-green-400">✓</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Tab.Panel>

          {/* === TAB LINKS === */}
          <Tab.Panel className="p-4 text-center text-gray-400">
            Chức năng đang phát triển...
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
