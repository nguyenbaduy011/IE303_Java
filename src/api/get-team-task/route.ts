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
};

export interface TaskListResponse {
  tasks: TaskType[];
  totalPages: number;
  totalTaskCount: number;
  totalElements: number;
}

export const fetchTeamTasks = async (
  teamId: string
): Promise<TaskListResponse> => {
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
    console.error("Error fetching team tasks:", error);
    return {
      tasks: [],
      totalPages: 0,
      totalTaskCount: 0,
      totalElements: 0,
    };
  }
};
