/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "@/utils/cookie";

export async function removeEmployeeFromTeam(
  employeeId: string
): Promise<boolean> {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    const res = await fetch(
      `http://localhost:8080/api/employee/remove/${employeeId}/team`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        credentials: "include",
      }
    );

    if (!res.ok) {
      throw new Error(
        `Failed to remove employee from team (status: ${res.status})`
      );
    }

    // Nếu không có nội dung thì cũng không sao
    const text = await res.text();
    console.log("Raw response text:", JSON.stringify(text));

    // Ưu tiên xử lý theo response nếu có
    if (text.trim() === "1") return true;
    if (text.trim() === "0") return false;

    // Nếu không có gì (rỗng), nhưng status code là 200 → giả định thành công
    if (text.trim() === "") return true;

    throw new Error("Unexpected response value (expected '1', '0', or '')");
  } catch (error: any) {
    console.error("removeEmployeeFromTeam error:", error.message, error.stack);
    throw new Error(
      error.message || "Unexpected error while removing employee from team"
    );
  }
}
  