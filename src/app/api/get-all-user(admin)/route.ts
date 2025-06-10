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

export interface RoleType {
  id: string | null;
  name: string | null;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  permissions: PermissionType[];
}

export interface EmployeeType {
  id: string;
  user: UserType;
  position: PositionType | null;
  department: DepartmentType | null;
  team?: TeamType | null;
  role: RoleType | null;
  start_date: string;
  working_status: string;
}

export const fetchEmployees = async (): Promise<EmployeeType[]> => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/employee/admin/all`,
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
        throw new Error("You do not have permission to view this information.");
      }
      if (response.status === 404) {
        throw new Error("Employees not found.");
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch employees`);
    }

    const data = await response.json();
    // Check if data.employees is an array; fallback to data if it’s an array, or empty
    const employeesArray = Array.isArray(data.employees)
      ? data.employees
      : Array.isArray(data)
        ? data
        : [];

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
      role: employee.role
        ? {
            id: employee.role.id || null,
            name: employee.role.name || null,
            description: employee.role.description || null,
            created_at:
              employee.role.createdAt || employee.role.created_at || null,
            updated_at:
              employee.role.updatedAt || employee.role.updated_at || null,
            permissions: Array.isArray(employee.role.permissions)
              ? employee.role.permissions.map((perm: any) => ({
                  id: perm.id || null,
                  name: perm.name || null,
                  description: perm.description || null,
                }))
              : [],
          }
        : null,
      start_date: employee.startDate || employee.start_date || "",
      working_status: employee.workingStatus || employee.working_status || "",
    }));
  } catch (error) {
    console.error("Error in fetchEmployees:", error); // Log for debugging
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch employees"
    );
  }
};
