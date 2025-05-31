/* eslint-disable @typescript-eslint/no-explicit-any */
interface UsersType {
  id: string;
  name: string;
  image_url: string | null; // Cho phép null để khớp với dữ liệu API
  session_id: string;
  last_seen: string;
  online: boolean;
}

export async function getOnlineUsers(): Promise<UsersType[]> {
  try {
    const res = await fetch("http://localhost:8080/api/user-online/list", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      if (res.status === 403) {
        throw new Error("You do not have permission to view these users.");
      }
      if (res.status === 404) {
        throw new Error("Users not found.");
      }
      throw new Error(`HTTP ${res.status}: Failed to fetch online users`);
    }

    const data = await res.json();

    const usersArray = Array.isArray(data) ? data : data.content || [];

    // Ánh xạ và kiểm tra dữ liệu
    return usersArray.map((user: any) => ({
      id: user.userId || "", // Đảm bảo không undefined
      name: user.fullName || "Unknown", // Giá trị mặc định nếu thiếu
      image_url: user.imageUrl ?? null, // Xử lý null/undefined
      session_id: user.sessionId || "", // Đảm bảo không undefined
      last_seen: user.lastSeen || new Date().toISOString(), // Giá trị mặc định
      online: user.online ?? false, // Xử lý null/undefined
    }));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng trực tuyến:", error);
    return []; // Trả về mảng rỗng để đảm bảo kiểu trả về
  }
}
