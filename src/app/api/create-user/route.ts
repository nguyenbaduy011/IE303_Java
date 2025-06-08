/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "@/utils/cookie";

export type CreateEmployeePayload = {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  gender: "male" | "female";
  nationality: string | null;
  phoneNumber: string;
  address: string | null;
  imageUrl: string | null;
  hireDate: string;
  positionId: string;
  departmentId: string;
  teamId: string | null;
  roleId: string;
  salary: number;
  workingStatus: "active";
};

export type CreateEmployeeResponse = {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    imageUrl: string | null;
    gender: "male" | "female";
    nationality: string | null;
    phoneNumber: string;
    hireDate: string;
    address: string | null;
  };
  position: {
    id: string;
    name: string;
    description: string;
  } | null;
  department: {
    id: string;
    name: string;
    description: string;
  } | null;
  team: {
    id: string;
    name: string;
    leader: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      birthDate: string;
      gender: "male" | "female";
      nationality: string;
      phoneNumber: string;
      hireDate: string;
      address: string;
    };
  } | null;
  role: {
    id: string;
    name: string;
    description: string;
    permissions: {
      id: string;
      name: string;
      description: string;
    }[];
  } | null;
  startDate: string;
  salary: number;
  workingStatus: "active" | "inactive";
};

export async function createEmployee(
  payload: CreateEmployeePayload
): Promise<CreateEmployeeResponse> {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    console.log("Payload sent:", payload); // Log payload để debug

    const res = await fetch("http://localhost:8080/api/admin/employee", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Detailed error from backend:", errorData);
      const errorMessage =
        errorData.message ||
        errorData.error ||
        (errorData.errors
          ? errorData.errors.map((e: any) => e.message).join(", ")
          : "Bad Request");
      throw new Error(errorMessage);
    }

    const data = (await res.json()) as CreateEmployeeResponse;
    return data;
  } catch (error: any) {
    console.error("createEmployee error:", error.message, error.stack);
    throw new Error(
      error.message || "Unexpected error while creating employee"
    );
  }
}
