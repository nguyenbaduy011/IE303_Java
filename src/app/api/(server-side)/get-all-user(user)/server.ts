/* eslint-disable @typescript-eslint/no-explicit-any */

import { EmployeeType } from "@/app/api/get-all-user(user)/route";
import { headers } from "next/headers";

export const fetchEmployeesServer = async (): Promise<EmployeeType[]> => {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const response = await fetch(`http://localhost:8080/api/employee/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader, // gửi cookie gốc nguyên vẹn\
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      if (response.status === 403) {
        throw new Error(
          "You do not have permission to view these information."
        );
      }
      if (response.status === 404) {
        throw new Error("Employees not found.");
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch employees`);
    }

    const data = await response.json();
    // Xử lý cấu trúc API linh hoạt
    const employeesArray = Array.isArray(data.employees) ? data.employees : [];
    return employeesArray.map((employee: any) => ({
      id: employee.id || "", // Fallback to empty string if id is missing
      user: {
        id: employee.user?.id || "",
        first_name: employee.user?.firstName || employee.user?.first_name || "",
        last_name: employee.user?.lastName || employee.user?.last_name || "",
      },
      position: employee.position
        ? {
            id: employee.position.id || null,
            name: employee.position.name || null,
            description: employee.position.description || null,
          }
        : null,
      department: employee.department
        ? {
            id: employee.department.id || null,
            name: employee.department.name || null,
            description: employee.department.description || null,
          }
        : null,
      team: employee.team
        ? {
            id: employee.team.id || null,
            name: employee.team.name || null,
          }
        : undefined,
      start_date: employee.startDate || employee.start_date || "",
      working_status: employee.workingStatus || employee.working_status || "",
    }));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch employees"
    );
  }
};
