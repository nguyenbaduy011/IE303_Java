/* eslint-disable @typescript-eslint/no-explicit-any */
export type RestoreEmployeeResponse =
  | {
      success: true;
      message: string;
      restorationDate: string;
      employeeId: string;
    }
  | {
      success: false;
      message: string;
    };

import { getCookie } from "@/utils/cookie";
export async function restoreEmployee(
  employeeId: string
): Promise<RestoreEmployeeResponse> {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    const res = await fetch(
      `http://localhost:8080/api/employee/restore/${employeeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        credentials: "include",
      }
    );

    const data = (await res.json()) as RestoreEmployeeResponse;

    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Failed to restore employee");
    }

    return data;
  } catch (error: any) {
    console.error("restoreEmployee error:", error.message, error.stack);
    throw new Error(
      error.message || "Unexpected error while restoring employee"
    );
  }
}
