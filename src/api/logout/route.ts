/* eslint-disable @typescript-eslint/no-explicit-any */
// Hàm gọi API logout và xóa cookie ở client-side
export async function logoutUser(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: "include", // Đảm bảo gửi cookie đến server
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || `Logout failed with status ${res.status}`
      );
    }

    // Xóa cookie user, session, SOCIUS_SESSION, và XSRF-TOKEN
    document.cookie = `user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
    document.cookie = `session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
    document.cookie = `SOCIUS_SESSION=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
    document.cookie = `XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;

    return { success: true };
  } catch (error: any) {
    console.error("Failed when logout:", error);
    return {
      success: false,
      error: error.message || "Can not connect to server",
    };
  }
}
