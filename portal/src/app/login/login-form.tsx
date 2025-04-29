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
  tutor: "/",
  staff: "/staff",
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
      setError("Please enter both email and password.");
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
        throw new Error(result.message || "Login failed!");
      }

      if (!result.data || !result.data.accessToken) {
        throw new Error("Token not found in response.");
      }

      const { accessToken } = result.data;

      setCookie('accessToken', accessToken, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

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

      localStorage.setItem('accessToken', token);
      localStorage.setItem('userId', payload.id || payload.sub || '');
      localStorage.setItem('userEmail', payload.email || '');
      localStorage.setItem('userName', payload.name || '');
      localStorage.setItem('userRole', userRole || '');

      setCookie('userId', payload.id || payload.sub || '', { maxAge: 30 * 24 * 60 * 60, path: '/' });
      setCookie('userEmail', payload.email || '', { maxAge: 30 * 24 * 60 * 60, path: '/' });
      setCookie('userName', payload.name || '', { maxAge: 30 * 24 * 60 * 60, path: '/' });

      const redirectPath =
        ROLE_REDIRECTS[userRole as keyof typeof ROLE_REDIRECTS] || ROLE_REDIRECTS.default;

      console.log(`Redirecting role ${userRole} to ${redirectPath}`);

      alert("Login successful! Redirecting...");

      window.location.href = redirectPath;
    } catch (decodeError) {
      console.error("Token decoding error:", decodeError);
      setError("Could not verify login information. Please try again.");
    }
  };

  const handleLoginError = (err: unknown) => {
    console.error("Login error:", err);
    if (err instanceof Error) {
      if (err.message.includes("Network") || err.message.includes("fetch")) {
        setError("Unable to connect to the server. Please check your network.");
      } else {
        setError(err.message);
      }
    } else {
      setError("An unknown error occurred.");
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
        <h1 className="text-2xl font-bold text-black">Log In</h1>
      </div>

      <div className="grid gap-4">
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full"
        />

        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
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
              Logging in...
            </div>
          ) : (
            "Log In"
          )}
        </Button>
      </div>
    </form>
  );
}
