/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "@/utils/cookie";

export type PermissionType = {
  id: string;
  name: string;
  description: string;
};

export type RoleType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  permissions: PermissionType[];
};

export type UserType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  gender: string;
  nationality: string;
  phoneNumber: string;
  hireDate: string;
  address: string;
};

export type PositionType = {
  id: string;
  name: string;
  description: string;
};

export type DepartmentType = {
  id: string;
  name: string;
  description: string;
};

export type TeamType = {
  id: string;
  name: string;
  leader: UserType;
};

export type EmployeeRoleTransferResponse = {
  id: string;
  user: UserType;
  position: PositionType;
  department: DepartmentType;
  team: TeamType;
  role: RoleType;
  startDate: string;
  salary: number;
  workingStatus: string;
};

export async function transferEmployeeRole({
  employeeId,
  newRoleId,
}: {
  employeeId: string;
  newRoleId: string;
}): Promise<EmployeeRoleTransferResponse> {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    const res = await fetch(
      `http://localhost:8080/api/admin/employee-transfer/${employeeId}/role/${newRoleId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        credentials: "include",
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server error response:", errorData);
      throw new Error(
        errorData.error ||
          `Transfer employee role failed with status ${res.status}`
      );
    }

    const data = (await res.json()) as EmployeeRoleTransferResponse;

    return data;
  } catch (error: any) {
    console.error("Transfer employee role error:", error);
    throw new Error(
      error.message || "Something went wrong while transferring employee role"
    );
  }
}
