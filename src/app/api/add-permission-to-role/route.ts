/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getCookie } from "@/utils/cookie";

export async function addPermissionsToRole(
  roleId: string,
  permissionIds: string[]
) {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    const res = await fetch(
      `http://localhost:8080/api/role/add/${roleId}/permissions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(permissionIds), // gửi mảng permissionIds
      }
    );

    if (!res.ok) {
      let errorMessage = `Failed to add permissions to role with status ${res.status}`;

      try {
        const errorData = await res.json();
        console.error("Server error response:", errorData);
        errorMessage = errorData.error || errorMessage;
      } catch (jsonErr) {
        console.warn("Response error body is not valid JSON");
      }

      throw new Error(errorMessage);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }

    return { message: "Permissions added to role successfully" };
  } catch (error: any) {
    console.error("addPermissionsToRole error:", error);
    throw new Error(
      error.message || "Unexpected error while adding permissions to role"
    );
  }
}
