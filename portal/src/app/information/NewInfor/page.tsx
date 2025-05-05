"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewInfor() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    path: "",
    email: "",
    phone: "",
    address: "",
    major: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("Bạn cần đăng nhập lại.");
      setLoading(false);
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("http://localhost:3002/new-Information", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error occurred while submitting the form.");
      }
      // Đăng xuất sau khi nhập thông tin thành công
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      alert("Information submitted successfully. Please log in again.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Infomation Form</h2>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className="w-full p-2 border rounded" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" required type="email" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" className="w-full p-2 border rounded" required />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="w-full p-2 border rounded" required />
        <input name="major" value={form.major} onChange={handleChange} placeholder="Major" className="w-full p-2 border rounded" required />
        <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className="w-full p-2 border rounded" required />
        <input name="path" value={form.path} onChange={handleChange} placeholder="Desc" className="w-full p-2 border rounded" />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? "Sending..." : "Save information"}
        </button>
      </form>
    </div>
  );
}
