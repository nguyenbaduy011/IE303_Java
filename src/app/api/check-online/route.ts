export type CheckOnlineResponse = {
  isValid: boolean;
  error?: string;
};

export async function checkOnline({
  id,
}: {
  id: string;
}): Promise<CheckOnlineResponse> {
  try {
    const res = await fetch(
      `http://localhost:8080/api/session/user/${id}/status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (res.ok) {
      const isValid = await res.json(); // true hoặc false
      return { isValid };
    }

    if (res.status === 401 || res.status === 403) {
      return { isValid: false, error: "Session expired or unauthorized" };
    }

    throw new Error(`Unexpected response status: ${res.status}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error checking online status:", error);
    return {
      isValid: false,
      error: error.message || "Failed to connect to server. Please try again.",
    };
  }
}
