/* eslint-disable @typescript-eslint/no-explicit-any */
import { TaskType } from "@/types/types";

export const fetchTasks = async (userId: string): Promise<TaskType[]> => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/user/${userId}/tasks`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      if (response.status === 403) {
        throw new Error("You do not have permission to view these tasks.");
      }
      if (response.status === 404) {
        throw new Error("Tasks not found for this user.");
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch tasks`);
    }

    const data = await response.json();
    // Xử lý cấu trúc API linh hoạt
    const tasksArray = Array.isArray(data) ? data : data.content || [];
    return tasksArray.map((task: any) => ({
      id: task.id,
      name: task.name,
      description: task.description,
      deadline: task.deadline,
      status: task.status,
      assigned_to: task.assignedTo ? task.assignedTo.id : null,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
    }));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch tasks"
    );
  }
};
