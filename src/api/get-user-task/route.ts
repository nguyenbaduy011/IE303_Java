import { TaskType } from "@/types/types";

export const fetchTasks = async (userId: string): Promise<TaskType[]> => {
  try {
    const response = await fetch(`http://localhost:8080/api/user/${userId}/tasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch tasks`);
    }

    const data = await response.json();
    // Ánh xạ response.content sang TaskType
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.content.map((task: any) => ({
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
    throw new Error(error instanceof Error ? error.message : "Failed to fetch tasks");
  }
};
