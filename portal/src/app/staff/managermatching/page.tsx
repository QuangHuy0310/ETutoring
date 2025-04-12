"use client";

import React, { useState, useEffect } from "react";
import StaffLayout from "@/app/staff/StaffLayout";
import ManagerMatchingForm from "@/app/staff/managermatching/form";
import { getCookie } from "cookies-next";

interface MatchingData {
  id?: string;
  studentName: string;
  tutorName: string;
  subject: string;
  timeSlot: string;
  status: string;
}

const ManagerMatchingPage: React.FC = () => {
  const [matchings, setMatchings] = useState<MatchingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch matching data
  useEffect(() => {
    const fetchMatchings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = getCookie('accessToken');
        if (!token) {
          throw new Error("Vui lòng đăng nhập để xem trang này");
        }

        // Trong thực tế, sẽ có API call tại đây
        // Tạm thời sử dụng dữ liệu mẫu
        setTimeout(() => {
          const mockData: MatchingData[] = [
            { 
              id: "1", 
              studentName: "Alice", 
              tutorName: "Mr. John", 
              subject: "Math", 
              timeSlot: "10:00 - 11:00", 
              status: "Studying" 
            },
            { 
              id: "2", 
              studentName: "Bob", 
              tutorName: "Ms. Anna", 
              subject: "English", 
              timeSlot: "14:00 - 15:00", 
              status: "Reserved" 
            },
            { 
              id: "3", 
              studentName: "Charlie", 
              tutorName: "Dr. Smith", 
              subject: "Science", 
              timeSlot: "09:00 - 10:30", 
              status: "Completed" 
            },
          ];
          setMatchings(mockData);
          setIsLoading(false);
        }, 500);
        
      } catch (err: any) {
        console.error("Error fetching matchings:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
        setIsLoading(false);
      }
    };

    fetchMatchings();
  }, []);

  const handleSubmit = (data: MatchingData) => {
    // Trong thực tế, sẽ có API call để lưu dữ liệu
    const newMatching = {
      ...data,
      id: `${matchings.length + 1}` // Giả lập ID tự tăng
    };
    
    setMatchings([...matchings, newMatching]);
    setShowForm(false);
  };

  const handleDelete = (id: string | undefined) => {
    if (!id) return;
    
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      setMatchings(matchings.filter(match => match.id !== id));
    }
  };

  return (
    <StaffLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản lý phân công</h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? "Đóng biểu mẫu" : "Thêm mới"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4 text-black">
            <p>{error}</p>
          </div>
        )}
        
        {showForm && (
          <div className="mb-6">
            <ManagerMatchingForm onSubmit={handleSubmit} />
          </div>
        )}

        <div className="border rounded-lg p-4 shadow-md bg-white text-black">
          <h2 className="text-xl font-semibold mb-3">Danh sách phân công</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Sinh viên</th>
                  <th className="border p-2">Giảng viên</th>
                  <th className="border p-2">Môn học</th>
                  <th className="border p-2">Thời gian</th>
                  <th className="border p-2">Trạng thái</th>
                  <th className="border p-2">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {matchings.length > 0 ? (
                  matchings.map((match) => (
                    <tr key={match.id} className="text-center">
                      <td className="border p-2">{match.studentName}</td>
                      <td className="border p-2">{match.tutorName}</td>
                      <td className="border p-2">{match.subject}</td>
                      <td className="border p-2">{match.timeSlot}</td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded-full text-white ${
                          match.status === 'Studying' ? 'bg-green-500' :
                          match.status === 'Reserved' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}>
                          {match.status}
                        </span>
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={() => handleDelete(match.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Không tìm thấy kết quả
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default ManagerMatchingPage;
