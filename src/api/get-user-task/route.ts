import { TaskType } from "@/types/types";

export const fetchTasks = async (
  userId: string,
  sessionId: string
): Promise<TaskType[]> => {
  const response = await fetch(
    `http://your-backend/api/tasks?userId=${userId}`,
    {
      headers: {
        Authorization: `Bearer ${sessionId}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch tasks`);
  }

  const data = await response.json();
  return data;
};
