/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from "next/headers";

export interface DepartmentType {
  id: string;
  name: string;
  description: string;
}

export const fetchDepartments = async (): Promise<DepartmentType[]> => {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const response = await fetch(`http://localhost:8080/api/department`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      if (response.status === 403) {
        throw new Error("You do not have permission to view this information.");
      }
      if (response.status === 404) {
        throw new Error("Departments not found.");
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch departments`);
    }

    const data = await response.json();
    const departmentsArray = Array.isArray(data) ? data : [];

    return departmentsArray.map(
      (dept: any): DepartmentType => ({
        id: dept.id,
        name: dept.name,
        description: dept.description,
      })
    );
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch departments"
    );
  }
};
