/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "@/utils/cookie";
import { RoleType } from "@/app/api/create-role/route";

export async function updateRole({
  roleId,
  name,
  description,
  permissionIds,
}: {
  roleId: string;
  name: string;
  description: string;
  permissionIds: string[];
}): Promise<RoleType> {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    const res = await fetch(`http://localhost:8080/api/role/update/${roleId}`, {
      method: "POST", // hoặc "PATCH" tuỳ backend bạn định nghĩa
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        description,
        permissionIds,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server error response:", errorData);
      throw new Error(
        errorData.error || `Update role failed with status ${res.status}`
      );
    }

    const data = await res.json();

    return {
      id: data.id ?? "",
      name: data.name ?? "",
      description: data.description ?? "",
      permissions: (data.permissions ?? []).map((p: any) => ({
        id: p.id ?? "",
        name: p.name ?? "",
        description: p.description ?? "",
      })),
    };
  } catch (error: any) {
    console.error("Update role error:", error);
    throw new Error(
      error.message || "Something went wrong while updating role"
    );
  }
}
