"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckInfo() {
  const router = useRouter();

  useEffect(() => {
    const checkUserInfo = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.replace("/login");
        return;
      }
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const { role, id, sub } = payload;
        if (role !== "tutor" && role !== "user") {
          // Không phải role cần check, cho phép truy cập bình thường
          router.replace("/");
          return;
        }
        // Gọi API để lấy thông tin user
        const res = await fetch(`http://localhost:3002/get-infors?idUser=${id || sub}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        // Nếu không có thông tin hoặc data rỗng thì chuyển sang trang nhập thông tin
        if (!data || !data.data || data.data.length === 0) {
          router.replace("/information/NewInfor");
        } else {
          // Nếu đã có info thì về trang chủ
          router.replace("/");
        }
      } catch (error) {
        // Nếu lỗi, chuyển sang trang nhập thông tin
        router.replace("/information/NewInfor");
      }
    };
    checkUserInfo();
  }, [router]);

  return null;
}
