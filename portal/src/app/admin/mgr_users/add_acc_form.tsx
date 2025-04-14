import React, { useState } from "react";
import { getCookie } from "cookies-next";

interface Faculty {
  id: string;
  name: string;
}

interface AddAccountFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (userData: {
    email: string;
    password: string;
    role: string;
  }) => void;
  faculties: Faculty[];
}

const AddAccountForm: React.FC<AddAccountFormProps> = ({
  open,
  onClose,
  onSubmit,
  faculties,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    // Clear API error when any field changes
    if (apiError) {
      setApiError(null);
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setApiError(null);
    
    try {
      // 1. Lấy token từ cookie
      const accessToken = getCookie('accessToken');
      
      if (!accessToken) {
        throw new Error("Access token not found. Please log in again.");
      }
      
      // 2. Tạo tài khoản mới
      const registerResponse = await fetch("http://localhost:3002/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.message || `Registration failed with status: ${registerResponse.status}`);
      }

      const userData = await registerResponse.json();
      console.log("Registration successful:", userData);
      
      // 3. Gửi email thông báo sau khi tạo tài khoản thành công
      try {
        const emailResponse = await fetch("http://localhost:3002/mail/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            to: formData.email,
            subject: "Account Created Successfully",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #4CAF50;">Welcome to Our Platform!</h2>
                <p>Hello,</p>
                <p>Your account has been created successfully with the following details:</p>
                <ul>
                  <li><strong>Email:</strong> ${formData.email}</li>
                  <li><strong>Password:</strong> ${formData.password}</li>
                  <li><strong>Role:</strong> ${formData.role}</li>
                </ul>
                <p>You can now login with your email and password.</p>
                <p>If you have any questions, feel free to contact our support team.</p>
                <p>Best regards,<br>Admin Team</p>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          console.warn("Email notification failed to send:", await emailResponse.text());
        } else {
          console.log("Email notification sent successfully");
        }
      } catch (emailError) {
        // Xử lý lỗi gửi email nhưng không ảnh hưởng đến luồng chính
        console.error("Failed to send email notification:", emailError);
      }
      
      // Notify parent component and close form
      onSubmit(formData);
      setFormData({
        email: "",
        password: "",
        role: "",
      });
      onClose();
      
    } catch (error: any) {
      console.error("Registration error:", error);
      setApiError(error.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cập nhật hàm testEmailApi
  const testEmailApi = async () => {
    try {
      console.log("Testing email API...");
      const accessToken = getCookie('accessToken');
      
      if (!accessToken) {
        console.error("Access token not found in cookie");
        return false;
      }
      
      const response = await fetch("http://localhost:3002/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          to: "test@example.com",
          subject: "Test Email",
          html: "<p>This is a test email</p>",
        }),
      });
      
      console.log("Email API response status:", response.status);
      const responseText = await response.text();
      console.log("Email API response:", responseText);
      
      return response.ok;
    } catch (error) {
      console.error("Email API test failed:", error);
      return false;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Account</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-medium">Error</p>
            <p>{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter email address"
              style={{ color: "black" }}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter password"
              style={{ color: "black" }}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                errors.role ? "border-red-500" : "border-gray-300"
              }`}
              style={{ color: "black" }}
              disabled={isLoading}
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="tutor">Tutor</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 ${
                isLoading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
              } text-white rounded-lg flex items-center justify-center min-w-[120px]`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </button>
            <button
              type="button"
              onClick={testEmailApi}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg mr-2"
            >
              Test Email API
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountForm;