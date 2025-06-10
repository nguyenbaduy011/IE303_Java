/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "@/utils/cookie";

export type CreateRolePayload = {
  name: string;
  description: string;
  permissionIds: string[];
};

export type CreateRoleResponse = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  permissions: string[];
};

export async function createRole(
  payload: CreateRolePayload
): Promise<CreateRoleResponse> {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    const res = await fetch("http://localhost:8080/api/role/create", {
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
      console.error("Server error response:", errorData);
      throw new Error(
        errorData.error || `Create role failed with status ${res.status}`
      );
    }

    const data = (await res.json()) as CreateRoleResponse;
    return data;
  } catch (error: any) {
    console.error("Create role error:", error);
    throw new Error(
      error.message || "Something went wrong while creating role"
    );
  }
}
