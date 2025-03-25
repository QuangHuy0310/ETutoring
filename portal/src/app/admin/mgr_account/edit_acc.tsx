import React, { useState, useEffect } from "react";

interface EditAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: number, updatedData: { name: string }) => void;
  userId: number;
  currentName: string;
}

const EditAccount: React.FC<EditAccountProps> = ({
  isOpen,
  onClose,
  onSave,
  userId,
  currentName,
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Cập nhật name khi currentName thay đổi
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError("");
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Tên không được để trống");
      return;
    }
    
    onSave(userId, { name: name.trim() });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa tài khoản</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-1 font-medium">
              Tên
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccount;