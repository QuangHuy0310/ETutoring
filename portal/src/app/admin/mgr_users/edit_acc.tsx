import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";

interface EditAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: number, updatedData: { email?: string; role?: string }) => void;
  userId: number;
  currentName: string;
  currentEmail: string;
  currentRole: string;
}

const EditAccount: React.FC<EditAccountProps> = ({
  isOpen,
  onClose,
  onSave,
  userId,
  currentName,
  currentEmail,
  currentRole,
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cập nhật thông tin khi props thay đổi
  useEffect(() => {
    if (isOpen) {
      setEmail(currentEmail);
      setRole(currentRole);
      setError("");
    }
  }, [isOpen, currentEmail, currentRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Email không được để trống");
      return;
    }
    
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = getCookie('accessToken');
      
      if (!token) {
        setError("Không tìm thấy token xác thực");
        setIsSubmitting(false);
        return;
      }
      
      const response = await fetch(`http://localhost:3002/api/v1/users/edit-user?id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email.trim(),
          role: role
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Có lỗi xảy ra khi cập nhật thông tin");
      }
      
      // Cập nhật UI sau khi API thành công
      onSave(userId, { email: email.trim(), role });
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa tài khoản</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Thông tin hiện tại - chỉ hiển thị */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">
              Tên hiện tại
            </label>
            <input
              type="text"
              value={currentName}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
          
          {/* Email có thể chỉnh sửa */}
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập email mới"
            />
          </div>
          
          {/* Chọn role */}
          <div className="mb-4">
            <label htmlFor="role" className="block mb-1 font-medium">
              Vai trò
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 rounded text-red-700">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccount;