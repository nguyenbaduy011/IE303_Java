/* eslint-disable @typescript-eslint/no-explicit-any */
export type TerminateEmployeeResponse =
  | {
      success: true;
      message: string;
      terminationDate: string;
      employeeId: string;
    }
  | {
      success: false;
      message: string;
    };

import { getCookie } from "@/utils/cookie";

export async function terminateEmployee(
  employeeId: string
): Promise<TerminateEmployeeResponse> {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    const res = await fetch(
      `http://localhost:8080/api/employee/terminate/single/${employeeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        credentials: "include",
      }
    );

    const data = (await res.json()) as TerminateEmployeeResponse;

    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Failed to terminate employee");
    }

    return data;
  } catch (error: any) {
    console.error("terminateEmployee error:", error.message, error.stack);
    throw new Error(
      error.message || "Unexpected error while terminating employee"
    );
  }
}
