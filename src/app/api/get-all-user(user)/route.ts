/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserType {
  id: string;
  first_name: string;
  last_name: string;
}

export interface PositionType {
  id: string | null;
  name: string | null;
  description: string | null;
}

export interface DepartmentType {
  id: string | null;
  name: string | null;
  description: string | null;
}

export interface TeamType {
  id: string | null;
  name: string | null;
}

export interface PermissionType {
  id: string | null;
  name: string | null;
  description: string | null;
}

export interface EmployeeType {
  id: string;
  user: UserType;
  position: PositionType | null;
  department: DepartmentType | null;
  team?: TeamType | null;
  start_date: string;
  working_status: string;
}

export const fetchEmployees = async (): Promise<EmployeeType[]> => {
  try {
    const response = await fetch(`http://localhost:8080/api/employee/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
