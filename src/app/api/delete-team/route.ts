/* eslint-disable @typescript-eslint/no-unused-vars */
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
      let errorMessage = "Failed to delete team";

      try {
        const errorData = await res.json();
        console.error("Error from backend:", errorData);

        errorMessage =
          errorData.message ||
          errorData.error ||
          (errorData.errors
            ? errorData.errors.map((e: any) => e.message).join(", ")
            : errorMessage);
      } catch (jsonError) {
        console.warn("Could not parse error response as JSON");
      }

      throw new Error(errorMessage);
    }

    if (res.status === 204) {
      return { message: "Team deleted successfully" };
    }

    // Nếu có nội dung JSON thì mới parse
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = (await res.json()) as { message: string };
      return data;
    }

    // Nếu không có nội dung JSON, trả về message mặc định
    return { message: "Team deleted successfully" };
  } catch (error: any) {
    console.error("deleteTeam error:", error.message, error.stack);
    throw new Error(error.message || "Unexpected error while deleting team");
  }
}
