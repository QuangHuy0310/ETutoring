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

// Định nghĩa interface cho dữ liệu lịch học đã được chuyển đổi
interface ScheduleItem {
  day: string;
  timeSlot: string;
  courseName: string;
  roomName?: string;
  teacherName?: string;
  originalData?: APIScheduleItem; // Lưu trữ dữ liệu gốc nếu cần
}

// Map slotId sang khung giờ
const slotMap: Record<string, string> = {
  "3831aeff-8588-4204-9c61-4d38cf0f4947": "8:00-10:00",
  // Thêm các slotId khác tương ứng với các khung giờ
  // Nếu không biết, sẽ phải xác định sau
};

// Định nghĩa component Timetable
export default function Timetable() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = ["8:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00", "17:00-19:00"];
  
  // States
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null); // Lưu trữ raw response để debug
  
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

  // Lấy thông tin khung giờ từ slotId
  const getTimeSlot = (slotId: string): string => {
    return slotMap[slotId] || "Unknown";
  };

  // Chuyển đổi dữ liệu API thành định dạng cần thiết
  const convertAPIData = (apiItems: APIScheduleItem[]): ScheduleItem[] => {
    return apiItems.map(item => {
      return {
        day: timestampToDay(item.days),
        timeSlot: getTimeSlot(item.slotId),
        courseName: item.courseName || "Course", // Placeholder nếu không có thông tin
        roomName: item.roomName,
        teacherName: item.teacherName,
        originalData: item
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

    fetchSchedule();
  }, []);

  // Create a schedule grid
  const scheduleGrid = slots.map(slot => {
    const row = days.map(day => {
      const classesInSlot = scheduleData.filter(
        item => item.day === day && item.timeSlot === slot
      );
      
      if (classesInSlot.length === 0) {
        return null;
      }
      
      return classesInSlot.map((item, index) => (
        <div key={index} className="bg-blue-900 rounded p-1 text-xs mb-1">
          <div className="font-bold">{item.courseName}</div>
          {item.roomName && <div>Room: {item.roomName}</div>}
          {item.teacherName && <div>Teacher: {item.teacherName}</div>}
          <div className="text-gray-300 text-xs mt-1">ID: {item.originalData?._id.substring(0, 8)}...</div>
        </div>
      ));
    });
    
    return { slot, row };
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
              {scheduleGrid.map(({ slot, row }, i) => (
                <tr key={i} className="border border-gray-600">
                  <td className="border border-gray-600 p-2 bg-gray-800 text-white">{slot}</td>
                  {row.map((classes, j) => (
                    <td key={j} className="border border-gray-600 p-2 bg-gray-700 text-white min-w-[120px]">
                      {classes || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Debug panel */}
          <div className="mt-4 p-4 bg-gray-800 rounded-lg text-xs overflow-auto max-h-32">
            <p className="text-gray-300 mb-2">Debug - Original Data:</p>
            <pre className="text-gray-400">{JSON.stringify(scheduleData, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
}