"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/app/admin/AdminLayout";
import AddFacultyModal from "@/app/admin/mgr_faculties/add_faculty_form";
import { getCookie } from "cookies-next";

interface Faculty {
  id?: number;
  name: string;
}

const FacultyManagerPage: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Lấy dữ liệu faculty từ API khi component được tải
  useEffect(() => {
    const accessToken = getCookie('accessToken');

    if (!accessToken) {
      console.error("Access token not found in cookies");
      setError("Access token is required.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:3002/get-major", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        // Kiểm tra nếu response là 401 Unauthorized
        if (response.status === 401) {
          throw new Error("Unauthorized: Your session has expired. Please login again.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.statusCode === 200) {
          setFaculties(data.data);
          setError(null);
        } else {
          setError(data.message || "Failed to fetch faculties.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching faculties:", err);
        
        // Không cần xóa cookie ở đây vì middleware sẽ xử lý việc chuyển hướng
        setError("Failed to connect to the server. Please try again later.");
        setLoading(false);
      });
  }, []);
  
  const filteredFaculties = faculties.filter(faculty => 
    faculty && faculty.name && faculty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteFaculty = (id?: number) => {
    if (!id) {
      setError("Cannot delete faculty with undefined ID.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this faculty?")) {
      const accessToken = getCookie('accessToken');
      
      if (!accessToken) {
        setError("Access token is required for this operation.");
        return;
      }
      
      setLoading(true);
      
      fetch(`http://localhost:3002/delete-major/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.statusCode === 200) {
            setFaculties(faculties.filter((faculty) => faculty.id !== id));
            setError(null);
          } else {
            setError(data.message || "Failed to delete faculty.");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error deleting faculty:", err);
          setError("Failed to connect to the server. Please try again later.");
          setLoading(false);
        });
    }
  };
  
  const editFaculty = (id?: number) => {
    if (!id) {
      setError("Cannot edit faculty with undefined ID.");
      return;
    }
    alert(`Edit faculty with ID: ${id}`);
  };
  
  const createFaculty = () => {
    setIsAddModalOpen(true);
  };

  // Cập nhật hàm handleSaveFaculty
  const handleSaveFaculty = (newFaculty: Faculty) => {
    const accessToken = getCookie('accessToken');
    
    if (!accessToken) {
      setError("Access token is required for this operation.");
      return;
    }
    
    setLoading(true);
    
    // Trong trường hợp API chỉ cần tên faculty
    const payload = {
      name: newFaculty.name
    };
    
    fetch("http://localhost:3002/new-major", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        // Kiểm tra nếu response là 401 Unauthorized
        if (response.status === 401) {
          throw new Error("Unauthorized: Your session has expired. Please login again.");
        }
        return response.json();
      })
      .then((data) => {
        console.log("API Response:", data);
        
        if (data.statusCode === 200 || data.statusCode === 201) {
          // Thêm faculty mới vào danh sách
          const newFacultyData = data.data || { ...payload, id: Math.random() };
          setFaculties(prevFaculties => [...prevFaculties, newFacultyData]);
          setIsAddModalOpen(false);
          setError(null);
        } else {
          setError(data.message || "Failed to create faculty.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error creating faculty:", err);
        setError(`Failed to connect to the server: ${err.message}`);
        setLoading(false);
      });
  };

  // Hàm này có thể không cần vì bạn chỉ cần thêm name
  const getLastFacultyId = () => {
    return 0; // Không cần ID vì server sẽ tự tạo
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Faculties</h1>

        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by faculty name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          <button
            onClick={createFaculty}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition w-full md:w-auto"
          >
            Create Faculty
          </button>
        </div>

        {/* Hiển thị thông báo lỗi nếu có */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Hiển thị trạng thái loading */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-white text-black">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculties.length > 0 ? (
                  filteredFaculties.map((faculty, index) => (
                    <tr key={`faculty-${faculty.id || index}`} className="text-center">
                      <td className="border p-2">{faculty.name}</td>
                      <td className="border p-2">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => editFaculty(faculty.id)}
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteFaculty(faculty.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key="no-data">
                    <td colSpan={2} className="text-center py-4">
                      {searchTerm ? "No matching faculties found" : "No faculties found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Sửa form modal để chỉ cần nhập name */}
        <AddFacultyModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveFaculty}
          lastId={getLastFacultyId()}
        />
      </div>
    </AdminLayout>
  );
};

export default FacultyManagerPage;
