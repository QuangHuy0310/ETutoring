/**
 * Tiện ích quản lý token
 */

/**
 * Lấy accessToken mới từ refreshToken
 * @returns Promise<string | null> accessToken mới hoặc null nếu có lỗi
 */
export async function getAccessTokenFromRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await fetch("http://localhost:3002/api/v1/auth/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.error("Failed to refresh token:", response.status);
      return null;
    }

    const data = await response.json();
    return data.accessToken || null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

/**
 * Lưu tokens vào localStorage
 */
export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("accessToken", accessToken); // Tạm thời giữ lại để tương thích với code cũ
}

/**
 * Xóa tokens khỏi localStorage khi đăng xuất
 */
export function clearTokens(): void {
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
}