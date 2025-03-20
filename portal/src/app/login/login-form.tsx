"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/app/lib/utils";
import { Button } from "../componets/ui/button";
import {Input } from "../componets/ui/input";


interface LoginFormProps extends React.HTMLAttributes<HTMLFormElement> {}

export default function LoginForm({ className, ...props }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3002/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Đăng nhập thất bại!");
      }

      const { accessToken } = result.data;

      // Lưu token vào localStorage
      localStorage.setItem("accessToken", accessToken);

      // Giải mã token để lấy thông tin user
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const userRole = payload.role;

      // Chuyển hướng dựa trên role
      if (userRole === "admin") {
        router.push("/admin");
      } else if (userRole === "user") {
        router.push("/blog");
      } else {
        router.push("/"); // Mặc định về trang chủ
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không xác định!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-4", className)} {...props} onSubmit={handleSubmit}>
      {/* Phần Logo */}
      <div className="flex justify-center">
        <img src="/logo.png" alt="Logo" className="h-12 w-12" />
      </div>

      {/* Tiêu đề */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-black">Đăng nhập</h1>
      </div>

      {/* Form đăng nhập */}
      <div className="grid gap-4">
        <Input
          id="email"
          type="email"
          placeholder="Nhập email của bạn"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <Input
          id="password"
          type="password"
          placeholder="Nhập mật khẩu"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <a href="#" className="text-sm text-right underline-offset-4 hover:underline">
          Quên mật khẩu?
        </a>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </div>
    </form>
  );
}
