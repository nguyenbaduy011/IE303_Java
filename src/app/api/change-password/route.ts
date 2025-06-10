/* eslint-disable @typescript-eslint/no-unused-vars */
import { getCookie } from "@/utils/cookie";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function changePassword({
  currentPassword,
  newPassword,
  confirmPassword,
}: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    const res = await fetch("http://localhost:8080/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });

    if (!res.ok) {
      let errorMessage = `Change password failed with status ${res.status}`;
      try {
        const errorData = await res.json();
        console.error("Server error response:", errorData);
        errorMessage = errorData.error || errorMessage;
      } catch (jsonErr) {
        console.warn("No JSON body in error response");
      }
      throw new Error(errorMessage);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : { success: true };
  } catch (error: any) {
    console.error("Change password error:", error);
    throw new Error(error.message || "Something went wrong");
  }
}
