/* eslint-disable @typescript-eslint/no-explicit-any */

import { TeamWithLeaderType } from "@/app/api/get-all-teams(admin)/route";
import { headers } from "next/headers";

export const fetchTeamsServer = async (): Promise<TeamWithLeaderType[]> => {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const response = await fetch(`http://localhost:8080/api/team`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader, // gửi cookie gốc nguyên vẹn\
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      if (response.status === 403) {
        throw new Error("You do not have permission to view this information.");
      }
      if (response.status === 404) {
        throw new Error("Teams not found.");
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch teams`);
    }

    const data = await response.json();
    const teamsArray = Array.isArray(data) ? data : [];

    return teamsArray.map(
      (team: any): TeamWithLeaderType => ({
        id: team.id,
        name: team.name,
        leader: {
          id: team.leader.id,
          first_name: team.leader.firstName,
          last_name: team.leader.lastName,
          email: team.leader.email,
          birth_date: team.leader.birthDate,
          gender: team.leader.gender,
          nationality: team.leader.nationality,
          phone_number: team.leader.phoneNumber,
          hire_date: team.leader.hireDate,
          address: team.leader.address,
        },
      })
    );
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch teams"
    );
  }
};
