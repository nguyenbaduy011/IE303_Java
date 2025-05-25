export async function logoutUser(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      return { success: true };
    }

    throw new Error(`Logout failed with status ${res.status}`);
  } catch (error: any) {
    console.error("Error during logout:", error);
    return {
      success: false,
      error: error.message || "Failed to connect to server",
    };
  }
}
