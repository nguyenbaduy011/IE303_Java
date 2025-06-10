/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from "next/headers";

export interface UserWithoutTeamType {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  gender: string;
  nationality: string;
  phone_number: string;
  hire_date: string;
  address: string;
}

export const fetchUsersNotInAnyTeamServer = async (): Promise<
  UserWithoutTeamType[]
> => {
  try {
    // Lấy cookies từ request header
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const response = await fetch(
      `http://localhost:8080/api/user/not-in-any-team`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // thêm cookie từ request header
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      if (response.status === 403) {
        throw new Error("You do not have permission to view this information.");
      }
      if (response.status === 404) {
        throw new Error("Users not found.");
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch users`);
    }

    const data = await response.json();
    const usersArray = Array.isArray(data) ? data : [];

    return usersArray.map((user: any) => ({
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      birth_date: user.birthDate,
      gender: user.gender,
      nationality: user.nationality,
      phone_number: user.phoneNumber,
      hire_date: user.hireDate,
      address: user.address,
    }));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch users"
    );
  }
};
