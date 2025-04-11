"use client";

import { useEffect, useState } from "react";
import { FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";

// Định nghĩa interface cho dữ liệu lịch học từ API
interface APIScheduleItem {
  _id: string;
  userId: string;
  days: number; // Timestamp
  slotId: string;
  partnerId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  courseName?: string; // Có thể có thêm hoặc không
  roomName?: string;
  teacherName?: string;
}

// Định nghĩa interface cho thông tin slot
interface SlotInfo {
  _id: string;
  name: string;
  timeStart: string;
  timeEnd: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Định nghĩa interface cho dữ liệu lịch học đã được chuyển đổi
interface ScheduleItem {
  day: string;
  timeSlot: string;
  slotNumber: string; // "Slot 1", "Slot 2", ...
  courseName: string;
  roomName?: string;
  teacherName?: string;
  originalData?: APIScheduleItem; // Lưu trữ dữ liệu gốc nếu cần
  slotInfo?: SlotInfo; // Thông tin slot từ API
}

// Định nghĩa component Timetable
export default function Timetable() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slotNumbers = ["Slot 1", "Slot 2", "Slot 3", "Slot 4", "Slot 5"];
  
  // States
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null); // Lưu trữ raw response để debug
  const [slots, setSlots] = useState<Record<string, SlotInfo>>({});
  
  // Hàm decode JWT token để lấy userId
  const decodeToken = () => {
    try {
      if (typeof window === 'undefined') return null; // Check for server-side rendering
      
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return null;

      const tokenParts = accessToken.split('.');
      if (tokenParts.length !== 3) return null;

      const payload = JSON.parse(atob(tokenParts[1]));
      return {
        userId: payload.userId || payload.id || payload.sub // Extract userId from different possible token formats
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Chuyển đổi timestamp thành ngày trong tuần
  const timestampToDay = (timestamp: number): string => {
    const date = new Date(timestamp);
    const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ...
    // Map JS day index sang ngày trong tuần của chúng ta
    const dayMap: Record<number, string> = {
      0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"
    };
    return dayMap[dayIndex] || "Unknown";
  };

  // Lấy thông tin các slot từ API
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;

        const response = await fetch("http://localhost:3002/api/v1/slots/get-slot", {
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          console.error("Failed to fetch slots:", response.status);
          return;
        }

        const data = await response.json();
        console.log("Slots data:", data);
        
        // Tạo map từ slot ID đến thông tin slot
        const slotsMap: Record<string, SlotInfo> = {};
        
        if (data && data.data && Array.isArray(data.data)) {
          data.data.forEach((slot: SlotInfo) => {
            slotsMap[slot._id] = slot;
          });
        }
        
        setSlots(slotsMap);
        console.log("Slots map:", slotsMap);
      } catch (error) {
        console.error("Error fetching slots:", error);
      }
    };

    fetchSlots();
  }, []);

  // Chuyển đổi dữ liệu API thành định dạng cần thiết
  const convertAPIData = (apiItems: APIScheduleItem[]): ScheduleItem[] => {
    return apiItems.map(item => {
      // Lấy thông tin slot từ slots map
      const slotInfo = slots[item.slotId];
      
      // Tạo "Slot X" dựa trên thứ tự của slot trong slots map hoặc chỉ dùng ID nếu không tìm thấy
      let slotNumber = "Unknown Slot";
      if (slotInfo) {
        // Nếu slotInfo.name có format như "Slot 1", "Slot 2", v.v. thì dùng name
        if (slotInfo.name && /Slot \d+/.test(slotInfo.name)) {
          slotNumber = slotInfo.name;
        } else {
          // Nếu không, tạo tên slot dựa vào timeStart và timeEnd
          slotNumber = `${slotInfo.timeStart || ""} - ${slotInfo.timeEnd || ""}`;
        }
      }
      
      // Nếu không có thông tin slot, tạo tên mặc định dựa vào slotId
      if (slotNumber === "Unknown Slot") {
        // Tìm chữ số cuối cùng trong slotId (nếu có) để làm số slot
        const match = item.slotId.match(/(\d+)$/);
        if (match) {
          slotNumber = `Slot ${match[1]}`;
        } else {
          // Nếu không tìm thấy số, đánh số dựa vào 5 ký tự cuối cùng
          const shortId = item.slotId.substring(item.slotId.length - 5);
          slotNumber = `Slot ${shortId}`;
        }
      }
      
      return {
        day: timestampToDay(item.days),
        timeSlot: slotInfo ? `${slotInfo.timeStart || ""} - ${slotInfo.timeEnd || ""}` : "Unknown Time",
        slotNumber,
        courseName: item.courseName || "Course", // Placeholder nếu không có thông tin
        roomName: item.roomName,
        teacherName: item.teacherName,
        originalData: item,
        slotInfo
      };
    });
  };

  // Fetch schedule data
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        // Get token and decode it
        const accessToken = localStorage.getItem('accessToken');
        const tokenInfo = decodeToken();
        
        if (!accessToken || !tokenInfo) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch schedule from API
        const response = await fetch(`http://localhost:3002/get-schedule?userId=${tokenInfo.userId}`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setRawResponse(data); // Lưu trữ raw response để debug
        console.log('Raw API response:', data);
        
        // Process the API response
        let apiScheduleItems: APIScheduleItem[] = [];

        if (data && data.data) {
          // Kiểm tra nếu response có cấu trúc { data: [...] }
          if (Array.isArray(data.data)) {
            apiScheduleItems = data.data;
          } else if (typeof data.data === 'object' && data.data.schedules) {
            apiScheduleItems = data.data.schedules;
          }
        } else if (Array.isArray(data)) {
          // Nếu API trả về trực tiếp mảng schedules
          apiScheduleItems = data;
        } else if (typeof data === 'object' && data.schedules) {
          // Nếu API trả về object với schedules property
          apiScheduleItems = data.schedules;
        }

        // Convert API data to required format
        const convertedItems = convertAPIData(apiScheduleItems);
        console.log('Converted schedule items:', convertedItems);
        setScheduleData(convertedItems);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setError("Failed to fetch schedule. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Chỉ fetch lịch học sau khi đã lấy thông tin về slots
    if (Object.keys(slots).length > 0) {
      fetchSchedule();
    }
  }, [slots]);

  // Create a schedule grid
  const scheduleGrid = slotNumbers.map(slotNumber => {
    const row = days.map(day => {
      const classesInSlot = scheduleData.filter(
        item => item.day === day && item.slotNumber === slotNumber
      );
      
      if (classesInSlot.length === 0) {
        return null;
      }
      
      return classesInSlot.map((item, index) => (
        <div key={index} className="bg-blue-900 rounded p-1 text-xs mb-1">
          <div className="font-bold">{item.courseName}</div>
          <div className="text-gray-300">{item.timeSlot}</div>
          {item.roomName && <div>Room: {item.roomName}</div>}
          {item.teacherName && <div>Teacher: {item.teacherName}</div>}
        </div>
      ));
    });
    
    return { slotNumber, row };
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-black bg-opacity-50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-300">Loading your schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-black bg-opacity-50 rounded-lg">
        <FaExclamationTriangle className="text-yellow-500 text-3xl mb-4" />
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {scheduleData.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-black bg-opacity-50 rounded-lg">
          <FaCalendarAlt className="text-gray-500 text-3xl mb-4" />
          <p className="text-gray-300">No schedule available at this time.</p>
          {rawResponse && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg text-xs overflow-auto max-w-full max-h-48">
              <p className="text-gray-300 mb-2">Debug - Raw API Response:</p>
              <pre className="text-gray-400">{JSON.stringify(rawResponse, null, 2)}</pre>
            </div>
          )}
        </div>
      ) : (
        <>
          <table className="w-full border border-gray-600 text-center">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border border-gray-600 p-2">Slot / Day</th>
                {days.map(day => <th key={day} className="border border-gray-600 p-2">{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {scheduleGrid.map(({ slotNumber, row }, i) => (
                <tr key={i} className="border border-gray-600">
                  <td className="border border-gray-600 p-2 bg-gray-800 text-white">{slotNumber}</td>
                  {row.map((classes, j) => (
                    <td key={j} className="border border-gray-600 p-2 bg-gray-700 text-white min-w-[120px]">
                      {classes || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
      
        </>
      )}
    </div>
  );
}