/* eslint-disable @typescript-eslint/no-explicit-any */
export type TaskType = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  deadline: string;
  status: "pending" | "in_progress" | "completed" | "failed" | string;
  assigned_to: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface TaskListResponse {
  tasks: TaskType[];
  total_pages: number;
  total_task_count: number;
  total_elements: number;
}

export const fetchTasks = async (userId: string): Promise<TaskListResponse> => {
  try {
    const res = await fetch(`http://localhost:8080/api/user/${userId}/tasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
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
      tasks: tasks,
      total_pages: data.totalPages ?? 0,
      total_task_count: data.totalTaskCount ?? 0,
      total_elements: data.totalElements ?? 0,
    };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {
      tasks: [],
      total_pages: 0,
      total_task_count: 0,
      total_elements: 0,
    };
  }
};
