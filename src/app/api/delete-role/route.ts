/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "@/utils/cookie";

export async function deleteRole(
  roleId: string
): Promise<{ success: boolean }> {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    const res = await fetch(`http://localhost:8080/api/role/delete/${roleId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
      },
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server error response:", errorData);
      throw new Error(
        errorData.error || `Delete role failed with status ${res.status}`
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Delete role error:", error);
    throw new Error(
      error.message || "Something went wrong while deleting role"
    );
  }
}
