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
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    console.log("CSRF Token:", csrfToken);

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
      const errorData = await res.json(); // Mong đợi JSON
      console.error("Server error response:", errorData);
      throw new Error(
        errorData.error || `Change password failed with status ${res.status}`
      );
    }

    return await res.json();
  } catch (error: any) {
    console.error("Change password error:", error);
    throw new Error(error.message || "Something went wrong");
  }
}
