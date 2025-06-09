/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "@/utils/cookie";

export type UpdateTeamPayload = {
  name: string;
  leaderId: string;
};

// Response trả về khi tạo team thành công
export type UpdateTeamResponse = {
  id: string;
  name: string;
  leader: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    gender: "male" | "female";
    nationality: string;
    phoneNumber: string;
    hireDate: string;
    address: string;
  };
};

export async function updateTeam(
  teamId: string,
  payload: UpdateTeamPayload
): Promise<UpdateTeamResponse> {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    console.log("Payload sent to update team:", payload);

    const res = await fetch(`http://localhost:8080/api/team/update/${teamId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error from backend:", errorData);
      const errorMessage =
        errorData.message ||
        errorData.error ||
        (errorData.errors
          ? errorData.errors.map((e: any) => e.message).join(", ")
          : "Bad Request");
      throw new Error(errorMessage);
    }

    const data = (await res.json()) as UpdateTeamResponse;
    return data;
  } catch (error: any) {
    console.error("updateTeam error:", error.message, error.stack);
    throw new Error(error.message || "Unexpected error while updating team");
  }
}
