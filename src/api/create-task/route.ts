import { getCookie } from "@/utils/cookie";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function createTask({
  name,
  description,
  deadline,
  status,
  assignedToId,
}: {
  name: string;
  description: string;
  deadline: string; // dạng ISO string: "2025-06-01T23:59:59.000Z"
  status: string;
  assignedToId: string;
}) {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    const res = await fetch("http://localhost:8080/api/task/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        description,
        deadline,
        status,
        assignedToId,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server error response:", errorData);
      throw new Error(
        errorData.error || `Create task failed with status ${res.status}`
      );
    }

    //Trả về task đã tạo
    return await res.json(); 
  } catch (error: any) {
    console.error("Create task error:", error);
    throw new Error(
      error.message || "Something went wrong while creating task"
    );
  }
}
