"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/app/lib/utils";
import { Button } from "../componets/ui/button";
import { Input } from "../componets/ui/input";
import { setCookie } from "cookies-next";

interface LoginFormProps extends React.HTMLAttributes<HTMLFormElement> {}

const ROLE_REDIRECTS = {
  admin: "/admin",
  user: "/",
  tutor: "/tutor",
  default: "/login"
};

export default function LoginForm({ className, ...props }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3002/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Đăng nhập thất bại!");
      }

      if (!result.data || !result.data.accessToken) {
        throw new Error("Token không tìm thấy trong phản hồi");
      }

      const { accessToken } = result.data;

      // Lưu token vào cookie thay vì localStorage
      setCookie('accessToken', accessToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 ngày (tính bằng giây)
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Chuyển hướng người dùng dựa trên role
      redirectUserBasedOnRole(accessToken);
    } catch (err) {
      handleLoginError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectUserBasedOnRole = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userRole = payload.role;

      // Lưu user ID và email vào cookie
      if (payload.sub) {
        setCookie('userId', payload.sub, { 
          maxAge: 30 * 24 * 60 * 60,
          path: '/' 
        });
      }

      if (payload.email) {
        setCookie('userEmail', payload.email, { 
          maxAge: 30 * 24 * 60 * 60,
          path: '/' 
        });
      }

      const redirectPath =
        ROLE_REDIRECTS[userRole as keyof typeof ROLE_REDIRECTS] || ROLE_REDIRECTS.default;
      router.push(redirectPath);
    } catch (decodeError) {
      console.error("Lỗi khi giải mã token:", decodeError);
      setError("Không thể xác thực thông tin đăng nhập. Vui lòng thử lại.");
    }
  };

  const handleLoginError = (err: unknown) => {
    console.error("Lỗi đăng nhập:", err);
    if (err instanceof Error) {
      if (err.message.includes("Network") || err.message.includes("fetch")) {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError(err.message);
      }
    } else {
      setError("Đã xảy ra lỗi không xác định!");
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-4", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex justify-center">
        <img src="/logo.png" alt="Logo" className="h-12 w-12" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-black">Đăng nhập</h1>
      </div>

      <div className="grid gap-4">
        <Input
          id="email"
          type="email"
          placeholder="Nhập email của bạn"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full"
        />

        <Input
          id="password"
          type="password"
          placeholder="Nhập mật khẩu"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="w-full"
        />

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang đăng nhập...
            </div>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </div>
    </form>
  );
}
