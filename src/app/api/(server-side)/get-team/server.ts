import { headers } from "next/headers";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserType {
  id: string;
  first_name: string;
  last_name: string;
}

export interface PositionType {
  id: string;
  name: string;
}

export interface UserTeamType {
  id: string;
  name: string;
}

export interface DepartmentType {
  id: string;
  name: string;
}

export interface EmploymentDetail {
  position: PositionType;
  team: UserTeamType;
  department: DepartmentType;
  working_status: "active" | "inactive" | "terminated" | string;
  start_date: string;
}

export type Member = {
  user: UserType;
  employment_detail: EmploymentDetail;
};

export type TeamType = {
  id: string;
  name: string;
  leader: {
    id: string;
    first_name: string;
    last_name: string;
  };
  member_count: number;
  members: Member[];
};

export async function fetchUserTeamServer(teamId: string): Promise<TeamType | null> {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const res = await fetch(
      `http://localhost:8080/api/team/${teamId}/members`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // gửi cookie gốc nguyên vẹn\
        },
      }
    );

    if (!res.ok) {
      if (res.status === 401)
        throw new Error("Session expired. Please log in again.");
      if (res.status === 403)
        throw new Error("You do not have permission to view this team.");
      if (res.status === 404) throw new Error("Team not found.");
      throw new Error(`HTTP ${res.status}: Failed to fetch team`);
    }

    const rawData: any = await res.json();
    const membersArray = Array.isArray(rawData.members) ? rawData.members : [];

    const processedTeam: TeamType = {
      id: rawData.id || "",
      name: rawData.name || "",
      leader: {
        id: rawData.leader?.id || "",
        first_name: rawData.leader?.firstName || "",
        last_name: rawData.leader?.lastName || "",
      },
      member_count: rawData.memberCount ?? membersArray.length,
      members: membersArray.map((member: any) => ({
        user: {
          id: member.user?.id || "",
          first_name: member.user?.firstName || "",
          last_name: member.user?.lastName || "",
        },
        employment_detail: {
          position: {
            id: member.employmentDetail?.position?.id || "",
            name: member.employmentDetail?.position?.name || "",
          },
          team: {
            id: member.employmentDetail?.team?.id || "",
            name: member.employmentDetail?.team?.name || "",
          },
          department: {
            id: member.employmentDetail?.department?.id || "",
            name: member.employmentDetail?.department?.name || "",
          },
          working_status: member.employmentDetail?.workingStatus || "active",
          start_date: member.employmentDetail?.startDate || "",
        },
      })),
    };

    return processedTeam;
  } catch (error) {
    console.error("Error when fetching team:", error);
    return null;
  }
}
