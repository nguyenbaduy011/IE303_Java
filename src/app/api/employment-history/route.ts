/* eslint-disable @typescript-eslint/no-explicit-any */
export type EmploymentHistoryType = {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
  };
  position: {
    id: string;
    name: string;
    description: string;
  };
  department: {
    id: string;
    name: string;
    description: string;
  };
  team: {
    id: string;
    name: string;
  };
  start_date: string;
  end_date: string;
  salary: number;
  description: string;
};

export interface EmploymentHistoryResponse {
  total_pages: number;
  history_count: number;
  total_elements: number;
  history: EmploymentHistoryType[];
}

export const fetchEmploymentHistory = async (
  userId: string
): Promise<EmploymentHistoryResponse> => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/user/${userId}/employment-history`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: Failed to fetch employment history`
      );
    }

    const data = await response.json();

    const historyArray: EmploymentHistoryType[] = Array.isArray(data.history)
      ? data.history.map((item: any) => ({
          id: item.id ?? "",
          user: {
            id: item.user?.id ?? "",
            firstName: item.user?.firstName ?? "",
            lastName: item.user?.lastName ?? "",
          },
          position: {
            id: item.position?.id ?? "",
            name: item.position?.name ?? "",
            description: item.position?.description ?? "",
          },
          department: {
            id: item.department?.id ?? "",
            name: item.department?.name ?? "",
            description: item.department?.description ?? "",
          },
          team: {
            id: item.team?.id ?? "",
            name: item.team?.name ?? "",
          },
          start_date: item.startDate ?? "",
          end_date: item.endDate ?? "",
          salary: item.salary ?? 0,
          description: item.description ?? "",
        }))
      : [];

    return {
      total_pages: data.totalPages ?? 0,
      history_count: data.historyCount ?? 0,
      total_elements: data.totalElements ?? 0,
      history: historyArray,
    };
  } catch (error) {
    console.error("Error fetching employment history:", error);
    return {
      total_pages: 0,
      history_count: 0,
      total_elements: 0,
      history: [],
    };
  }
};
