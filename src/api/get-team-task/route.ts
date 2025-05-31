/* eslint-disable @typescript-eslint/no-explicit-any */
import { TaskType } from "@/types/types";

export const fetchTasks = async (teamId: string): Promise<TaskType[]> => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/team/${teamId}/tasks`,
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
        throw new Error("Tasks not found for this team.");
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch tasks`);
    }

    const data = await response.json();
    console.log("Tasks API response:", data); // Ghi log để debug dữ liệu thô
    const tasksArray = Array.isArray(data) ? data : data.content || [];
    return tasksArray.map((task: any) => {
      const deadline = task.deadline;
      if (!deadline || isNaN(new Date(deadline).getTime())) {
        console.warn(`Invalid deadline in task ${task.id}: ${deadline}`);
      }
      return {
        id: task.id,
        name: task.name,
        description: task.description,
        deadline: deadline,
        status: task.status,
        assigned_to: task.assignedTo ? task.assignedTo.id : null,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
      };
    });
  } catch (error) {
    console.error("Error in fetchTasks:", error); // Ghi chi tiết lỗi
    throw error;
  }
};
