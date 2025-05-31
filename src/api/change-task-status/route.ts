/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "@/utils/cookie";

// route.ts
export type TaskStatus = "pending" | "completed" | "failed" | "in_progress";

export interface AssignedTo {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  deadline: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo: AssignedTo;
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<Task | null> {
  const csrfToken = getCookie("XSRF-TOKEN");
  if (!csrfToken) {
    throw new Error("CSRF token not found in cookies");
  }

  try {
    const res = await fetch(
      `http://localhost:8080/api/task/${taskId}/update-status/${status}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ taskId, status }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json(); // Mong đợi JSON
      console.error("Server error response:", errorData);
      throw new Error(
        errorData.error || `Failed to update task status: ${res.status}`
      );
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error calling updateTaskStatus:", error);
    throw new Error(error.message || "Something went wrong");
  }
}
