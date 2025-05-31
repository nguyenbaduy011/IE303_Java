export interface UserLite {
  id: string;
  first_name: string;
  last_name: string;
}

export interface PositionType {
  id: string;
  name: string;
  description: string;
}

export interface DepartmentType {
  id: string;
  name: string;
  description: string;
}

export interface TeamType {
  id: string;
  name: string;
}

export interface EmploymentDetailType {
  id: string;
  user: UserLite;
  position: PositionType;
  department: DepartmentType;
  team: TeamType;
  start_date: string;
  working_status: string;
}

export interface EmploymentDetailResponse {
  employment_detail: EmploymentDetailType | null;
}

export const fetchEmploymentDetail = async (
  userId: string
): Promise<EmploymentDetailResponse> => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/user/${userId}/employment-detail`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} - Failed to fetch employment detail`
      );
    }

    const data = await response.json();

    const detail: EmploymentDetailType | null = data.employmentDetail
      ? {
          id: data.employmentDetail.id ?? "",
          start_date: data.employmentDetail.startDate ?? "",
          working_status: data.employmentDetail.workingStatus ?? "",
          user: {
            id: data.employmentDetail.user?.id ?? "",
            first_name: data.employmentDetail.user?.firstName ?? "",
            last_name: data.employmentDetail.user?.lastName ?? "",
          },
          position: {
            id: data.employmentDetail.position?.id ?? "",
            name: data.employmentDetail.position?.name ?? "",
            description: data.employmentDetail.position?.description ?? "",
          },
          department: {
            id: data.employmentDetail.department?.id ?? "",
            name: data.employmentDetail.department?.name ?? "",
            description: data.employmentDetail.department?.description ?? "",
          },
          team: {
            id: data.employmentDetail.team?.id ?? "",
            name: data.employmentDetail.team?.name ?? "",
          },
        }
      : null;

    return {
      employment_detail: detail,
    };
  } catch (error) {
    console.error("Error fetching employment detail:", error);
    return {
      employment_detail: null,
    };
  }
};
