/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserType {
  id: string;
  first_name: string;
  last_name: string;
}

export interface PositionType {
  id: string;
  name: string;
  description: string;
}

export interface DepartmentType {
  id: string;
  name: string;
  description: string;
}

export interface TeamType {
  id: string;
  name: string;
}

export interface PermissionType {
  id: string;
  name: string;
  description: string;
}

export interface RoleType {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  permissions: PermissionType[];
}

export interface EmployeeType {
  id: string;
  user: UserType;
  position: PositionType;
  department: DepartmentType;
  team?: TeamType; // Optional
  role: RoleType;
  start_date: string;
  working_status: string;
}

export const fetchEmployees = async (): Promise<EmployeeType[]> => {
  try {
    const response = await fetch(`http://localhost:8080/api/admin/employees`, {
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
    const employeesArray = Array.isArray(data.employees) ? data.employees : [];

    return employeesArray.map((employee: any) => ({
      id: employee.id,
      user: {
        id: employee.user.id,
        first_name: employee.user.firstName,
        last_name: employee.user.lastName,
      },
      position: {
        id: employee.position.id,
        name: employee.position.name,
        description: employee.position.description,
      },
      department: {
        id: employee.department.id,
        name: employee.department.name,
        description: employee.department.description,
      },
      team: employee.team
        ? {
            id: employee.team.id,
            name: employee.team.name,
          }
        : undefined,
      role: {
        id: employee.role.id,
        name: employee.role.name,
        description: employee.role.description,
        created_at: employee.role.createdAt,
        updated_at: employee.role.updatedAt,
        permissions: employee.role.permissions.map((perm: any) => ({
          id: perm.id,
          name: perm.name,
          description: perm.description,
        })),
      },
      start_date: employee.startDate,
      working_status: employee.workingStatus,
    }));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch employees"
    );
  }
};
