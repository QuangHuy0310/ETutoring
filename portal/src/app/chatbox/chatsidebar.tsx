"use client";

import { useState } from "react";
import { FaSearch, FaChevronDown, FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileExcel } from "react-icons/fa";
import { Tab } from "@headlessui/react";
import clsx from "clsx";

const dummyFiles = [
  {
    name: "Resume TANG MINH NHUT.pdf",
    type: "pdf",
    size: "1.41 MB",
    sender: "Tăng Minh Nhựt",
    date: "2025-02-27",
  },
  {
    name: "APTIS SPEAKING - BC.pdf",
    type: "pdf",
    size: "1.28 MB",
    sender: "Bum",
    date: "2025-02-03",
  },
  {
    name: "BÁO GIÁ KÊNH GT.docx",
    type: "word",
    size: "1.23 MB",
    sender: "Bum",
    date: "2025-01-18",
  },
];

const fileTypeOptions = [
  { label: "PDF", icon: <FaFilePdf className="text-red-500" />, value: "pdf" },
  { label: "Word", icon: <FaFileWord className="text-blue-500" />, value: "word" },
  { label: "PowerPoint", icon: <FaFilePowerpoint className="text-orange-500" />, value: "ppt" },
  { label: "Excel", icon: <FaFileExcel className="text-green-500" />, value: "excel" },
];

const senderOptions = ["Tăng Minh Nhựt", "Bum"];

function ChatSidebar({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [typeOpen, setTypeOpen] = useState(false);
  const [senderOpen, setSenderOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const filterFiles = () => {
    return dummyFiles
      .filter((file) => !search || file.name.toLowerCase().includes(search.toLowerCase()))
      .filter((file) => !selectedType || file.type === selectedType)
      .filter((file) => !selectedSender || file.sender === selectedSender)
      .filter((file) => {
        if (!fromDate && !toDate) return true;
        const fileDate = new Date(file.date).getTime();
        return (
          (!fromDate || fileDate >= new Date(fromDate).getTime()) &&
          (!toDate || fileDate <= new Date(toDate).getTime())
        );
      });
  };

  const groupByDate = (files: typeof dummyFiles) => {
    const grouped: { [date: string]: typeof dummyFiles } = {};
    files.forEach((file) => {
      if (!grouped[file.date]) grouped[file.date] = [];
      grouped[file.date].push(file);
    });
    return grouped;
  };

  const groupedFiles = groupByDate(filterFiles());

  return (
    <div className="absolute top-0 bottom-0 right-0 w-[350px] h-full bg-[#1e1e1e] text-white shadow-lg z-50 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700 font-semibold text-lg flex justify-between items-center">
        Thông tin hội thoại
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>

      <Tab.Group>
        <Tab.List className="flex border-b border-gray-700">
          {["Ảnh/Video", "Files", "Links"].map((tab, idx) => (
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

        <Tab.Panels className="flex-1 overflow-auto">
          <Tab.Panel>
            <div className="p-4 text-center text-gray-400">Chức năng đang phát triển...</div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="p-4">
              {/* Search */}
              <div className="flex items-center mb-3 bg-gray-800 px-3 py-2 rounded">
                <FaSearch className="mr-2 text-gray-400" />
                <input
                  placeholder="Tìm kiếm File"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-white w-full"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-4">
                {/* Type Filter */}
                <div className="relative">
                  <button
                    onClick={() => setTypeOpen((prev) => !prev)}
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

                {/* Sender Filter */}
                <div className="relative">
                  <button
                    onClick={() => setSenderOpen((prev) => !prev)}
                    className="flex items-center px-2 py-1 bg-gray-800 rounded text-sm"
                  >
                    Người gửi <FaChevronDown className="ml-1" />
                  </button>
                  {senderOpen && (
                    <div className="absolute z-10 mt-2 bg-gray-900 border border-gray-700 rounded shadow-lg w-40 p-2">
                      <input
                        placeholder="Tìm kiếm"
                        className="w-full mb-2 p-1 bg-gray-800 text-sm text-white rounded"
                        onChange={(e) => {
                          const keyword = e.target.value.toLowerCase();
                          senderOptions.filter((s) => s.toLowerCase().includes(keyword));
                        }}
                      />
                      {senderOptions.map((s) => (
                        <div
                          key={s}
                          className="px-3 py-1 text-sm hover:bg-gray-700 cursor-pointer"
                          onClick={() => {
                            setSelectedSender(s);
                            setSenderOpen(false);
                          }}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Filter */}
                <div className="relative">
                  <button
                    onClick={() => setDateOpen((prev) => !prev)}
                    className="flex items-center px-2 py-1 bg-gray-800 rounded text-sm"
                  >
                    Ngày gửi <FaChevronDown className="ml-1" />
                  </button>
                  {dateOpen && (
                    <div className="absolute z-10 mt-2 bg-gray-900 border border-gray-700 rounded shadow-lg p-3 w-56">
                      <label className="text-xs text-gray-400 mb-1 block">Chọn khoảng thời gian</label>
                      <input
                        type="date"
                        className="w-full mb-2 p-1 rounded bg-gray-800 text-white"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
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

              {/* File List */}
              {Object.entries(groupedFiles).map(([date, files]) => (
                <div key={date} className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">
                    📅 Ngày {new Date(date).toLocaleDateString("vi-VN")}
                  </div>
                  <ul>
                    {files.map((file, i) => (
                      <li key={i} className="p-2 bg-gray-800 rounded mb-2 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-white">{file.name}</div>
                          <div className="text-sm text-gray-400">{file.size}</div>
                        </div>
                        <div className="text-xs text-green-400">✓</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="p-4 text-center text-gray-400">Chức năng đang phát triển...</div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default ChatSidebar;
