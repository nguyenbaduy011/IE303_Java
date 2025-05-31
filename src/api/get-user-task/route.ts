/* eslint-disable @typescript-eslint/no-explicit-any */
export type TaskType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  deadline: string;
  status: "pending" | "in_progress" | "completed" | "failed" | string;
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface TaskListResponse {
  tasks: TaskType[];
  totalPages: number;
  totalTaskCount: number;
  totalElements: number;
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
          createdAt: item.createdAt ?? "",
          updatedAt: item.updatedAt ?? "",
          name: item.name ?? "",
          description: item.description ?? "",
          deadline: item.deadline ?? "",
          status: item.status ?? "",
          assignedTo: {
            id: item.assignedTo?.id ?? "",
            firstName: item.assignedTo?.firstName ?? "",
            lastName: item.assignedTo?.lastName ?? "",
          },
        }))
      : [];

    return {
      tasks: tasks,
      totalPages: data.totalPages ?? 0,
      totalTaskCount: data.totalTaskCount ?? 0,
      totalElements: data.totalElements ?? 0,
    };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {
      tasks: [],
      totalPages: 0,
      totalTaskCount: 0,
      totalElements: 0,
    };
  }
};
