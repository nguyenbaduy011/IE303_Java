/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "@/utils/cookie";

// Xóa team theo teamId
export async function deleteTeam(teamId: string): Promise<{ message: string }> {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    const res = await fetch(`http://localhost:8080/api/team/delete/${teamId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
      },
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error from backend:", errorData);
      const errorMessage =
        errorData.message ||
        errorData.error ||
        (errorData.errors
          ? errorData.errors.map((e: any) => e.message).join(", ")
          : "Failed to delete team");
      throw new Error(errorMessage);
    }

    const data = (await res.json()) as { message: string };
    return data;
  } catch (error: any) {
    console.error("deleteTeam error:", error.message, error.stack);
    throw new Error(error.message || "Unexpected error while deleting team");
  }
}
