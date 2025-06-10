/* eslint-disable @typescript-eslint/no-explicit-any */

export interface TeamLeaderType {
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

export interface TeamWithLeaderType {
  id: string;
  name: string;
  leader: TeamLeaderType | null;
}

export const fetchTeams = async (): Promise<TeamWithLeaderType[]> => {
  try {
    const response = await fetch(`http://localhost:8080/api/team`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
        leader: team.leader
          ? {
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
            }
          : null,
      })
    );
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch teams"
    );
  }
};
