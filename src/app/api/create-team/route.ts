/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "@/utils/cookie";

// Payload gửi lên để tạo team
export type CreateTeamPayload = {
  name: string;
  leaderId: string;
};

// Respone trả về khi tạo team thành công
export type CreateTeamResponse = {
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

export async function createTeam(
  payload: CreateTeamPayload
): Promise<CreateTeamResponse> {
  try {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      throw new Error("CSRF token not found in cookies");
    }

    console.log("Payload sent to create team:", payload);

    const res = await fetch("http://localhost:8080/api/team/create", {
      method: "POST",
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

    const data = (await res.json()) as CreateTeamResponse;
    return data;
  } catch (error: any) {
    console.error("createTeam error:", error.message, error.stack);
    throw new Error(error.message || "Unexpected error while creating team");
  }
}
