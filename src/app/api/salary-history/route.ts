/* eslint-disable @typescript-eslint/no-explicit-any */
export type SalaryHistoryType = {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
  };
  previous_salary: number; // Changed to number
  new_salary: number; // Changed to number
  change_amount: number; // Changed to number
  percentage_change: number; // Changed to number
  effective_date: string;
  reason: string;
};

export interface SalaryHistoryResponse {
  salary_history: SalaryHistoryType[];
  total_pages: number;
  history_count: number;
  total_elements: number;
}

export const fetchSalaryHistory = async (
  userId: string
): Promise<SalaryHistoryResponse> => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/user/${userId}/salary-history`,
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
        `HTTP ${response.status} - Failed to fetch salary history`
      );
    }

    const data = await response.json();
    console.log("Raw Salary History API Response:", data); // Debug raw response

    const salaryHistoryArray: SalaryHistoryType[] = Array.isArray(
      data.salaryHistory
    )
      ? data.salaryHistory.map((item: any) => ({
          id: item.id ?? crypto.randomUUID(),
          user: {
            id: item.user?.id ?? "",
            first_name: item.user?.firstName ?? "", // Match API
            last_name: item.user?.lastName ?? "", // Match API
          },
          previous_salary: Number(item.previousSalary) || 0, // Map to correct field
          new_salary: Number(item.newSalary) || 0, // Map to correct field
          change_amount: Number(item.changeAmount) || 0, // Map to correct field
          percentage_change: Number(item.percentageChange) || 0, // Map to correct field
          effective_date: item.effectiveDate ?? new Date().toISOString(),
          reason: item.reason ?? "No reason provided",
        }))
      : [];

    console.log("Mapped Salary History:", salaryHistoryArray); // Debug mapped data

    return {
      salary_history: salaryHistoryArray,
      total_pages: Number(data.totalPages) || 0,
      history_count: Number(data.historyCount) || 0,
      total_elements: Number(data.totalElements) || 0,
    };
  } catch (error) {
    console.error("Error fetching salary history:", error);
    return {
      salary_history: [],
      total_pages: 0,
      history_count: 0,
      total_elements: 0,
    };
  }
};
