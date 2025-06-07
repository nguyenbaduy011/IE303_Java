/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from "next/headers";
import { TaskListResponse, TaskType } from "@/app/api/get-user-task/route";

export const fetchUserTasksServer = async (
  userId: string
): Promise<TaskListResponse> => {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const res = await fetch(`http://localhost:8080/api/user/${userId}/tasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader, // gửi cookie gốc nguyên vẹn
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Fetch error details:", errorText);
      throw new Error(`HTTP ${res.status} - Failed to fetch tasks`);
    }

    const data = await res.json();

    const tasks: TaskType[] = Array.isArray(data.task)
      ? data.task.map((item: any) => ({
          id: item.id ?? "",
          created_at: item.createdAt ?? "",
          updated_at: item.updatedAt ?? "",
          name: item.name ?? "",
          description: item.description ?? "",
          deadline: item.deadline ?? "",
          status: item.status ?? "",
          assigned_to: {
            id: item.assignedTo?.id ?? "",
            first_name: item.assignedTo?.firstName ?? "",
            last_name: item.assignedTo?.lastName ?? "",
          },
        }))
      : [];

    return {
      tasks,
      total_pages: data.totalPages ?? 0,
      total_task_count: data.totalTaskCount ?? 0,
      total_elements: data.totalElements ?? 0,
    };
  } catch (error) {
    console.error("Server-side error fetching tasks:", error);
    return {
      tasks: [],
      total_pages: 0,
      total_task_count: 0,
      total_elements: 0,
    };
  }
};
