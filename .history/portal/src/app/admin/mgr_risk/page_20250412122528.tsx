"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/app/admin/AdminLayout";
import { getCookie } from "cookies-next";

interface Risk {
  id: number;
  name: string;
  level: string;
  email: string;
}

const RiskManagerPage: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>([
    {
      id: 1,
      name: "Server Downtime",
      level: "High",
      email: "Yuh@example.com",
    },
    {
      id: 2,
      name: "Data Breach",
      level: "High",
      email: "Huy@example.com",
    },
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Thêm useEffect để kiểm tra token và lấy dữ liệu risk
  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const token = getCookie('accessToken');
        
        if (!token) {
          console.error("Access token not found in cookies");
          setIsLoading(false);
          return;
        }
        
        // Ở đây bạn có thể thêm logic để fetch dữ liệu risk từ API
        // Ví dụ:
        // const response = await fetch("http://localhost:3002/api/risks", {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const data = await response.json();
        // setRisks(data);
        
        // Giả lập thời gian fetch data
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
        
      } catch (error) {
        console.error("Error fetching risks:", error);
        setIsLoading(false);
      }
    };
    
    fetchRisks();
  }, []);
  
  // Filter risks based on search term
  const filteredRisks = risks.filter(risk => 
    risk.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle viewing risk details
  const viewRiskDetails = (id: number) => {
    // Cập nhật để sử dụng token từ cookie nếu cần API call
    const token = getCookie('accessToken');
    
    if (!token) {
      console.error("Access token not found in cookies");
      return;
    }
    
    alert(`Viewing risk details for ID: ${id}`);
    // Ví dụ về chuyển hướng hoặc mở modal chi tiết
    // router.push(`/admin/mgr_risk/${id}`);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Risk Management</h1>

        {/* Search box */} 
        <div className="mb-4 flex flex-col md:flex-row items-center gap-2">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by risk name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {/* Risk list */}
        <div className="border rounded-lg p-4 bg-white text-black">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Risk Name</th>
                  <th className="border p-2">Risk Level</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.length > 0 ? (
                  filteredRisks.map((risk) => (
                    <tr key={risk.id} className="text-center">
                      <td className="border p-2">{risk.id}</td>
                      <td className="border p-2">{risk.name}</td>
                      <td className="border p-2">{risk.level}</td>
                      <td className="border p-2">{risk.email}</td>
                      <td className="border p-2">
                        <div 
                          className="text-blue-500 cursor-pointer hover:underline"
                          onClick={() => viewRiskDetails(risk.id)}
                        >
                          View
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      {searchTerm ? "No matching risks found" : "No risks found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default RiskManagerPage;
