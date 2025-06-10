/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "@/utils/cookie";

export async function addEmployeeToTeam(employeeId: string, teamId: string) {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    const res = await fetch(
      `http://localhost:8080/api/employee/add/${employeeId}/team/${teamId}`,
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
      let errorMessage = `Failed to add employee to team with status ${res.status}`;

      try {
        const errorData = await res.json();
        console.error("Server error response:", errorData);
        errorMessage = errorData.error || errorMessage;
      } catch (jsonErr) {
        console.warn("Response error body is not valid JSON");
      }

      throw new Error(errorMessage);
    }

    // ✅ Nếu không có JSON body (ví dụ 200 OK nhưng không trả JSON), thì trả mặc định
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json(); // ✅ An toàn gọi nếu đúng content-type
    }

    // ✅ Nếu không có JSON, trả về message mặc định
    return { message: "Employee added to team successfully" };
  } catch (error: any) {
    console.error("addEmployeeToTeam error:", error);
    throw new Error(
      error.message || "Unexpected error while adding employee to team"
    );
  }
}
