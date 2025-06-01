/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "@/utils/cookie";
import { TaskType } from "@/api/get-user-task/route";

export async function createTask({
  name,
  description,
  deadline,
  status,
  assignedToId,
}: {
  name: string;
  description: string;
  deadline: string;
  status: "pending" | "in_progress" | "completed" | "failed";
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

    const data = await res.json();
    return {
      id: data.id ?? "",
      created_at: data.createdAt ?? "",
      updated_at: data.updatedAt ?? "",
      name: data.name ?? "",
      description: data.description ?? "",
      deadline: data.deadline ?? "",
      status: data.status ?? "",
      assigned_to: {
        id: data.assignedTo?.id ?? "",
        first_name: data.assignedTo?.firstName ?? "",
        last_name: data.assignedTo?.lastName ?? "",
      },
    } as TaskType;
  } catch (error: any) {
    console.error("Create task error:", error);
    throw new Error(
      error.message || "Something went wrong while creating task"
    );
  }
}
