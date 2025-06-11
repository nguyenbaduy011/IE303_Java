import { getCookie } from "@/utils/cookie";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function resetPassword({ email }: { email: string }) {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    const res = await fetch("http://localhost:8080/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      let errorMessage = `Reset password failed with status ${res.status}`;
      let errorData = null;

      try {
        if (isJsonResponse(res)) {
          const text = await res.text();
          if (text) {
            errorData = JSON.parse(text);
            console.error("Server error response:", errorData);
            errorMessage = errorData.error || errorMessage;
          }
        } else {
          const text = await res.text();
          console.warn("Server error with non-JSON body:", text);
        }
      } catch (jsonErr) {
        console.warn("Failed to parse error response JSON", jsonErr);
      }

      throw new Error(errorMessage);
    }

    return await parseJsonResponse(res);
  } catch (error: any) {
    console.error("Reset password error:", error);
    throw new Error(error.message || "Something went wrong");
  }
}

function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get("Content-Type");
  return contentType !== null && contentType.includes("application/json");
}

async function parseJsonResponse(response: Response) {
  if (isJsonResponse(response)) {
    const text = await response.text();
    if (text) {
      return JSON.parse(text);
    }
  }
  return { success: true }; // fallback nếu không có JSON
}
