/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import z from "zod";
import { headers } from "next/headers";
import { UserType } from "@/app/api/get-user-information/route";
import { EmploymentDetailType } from "@/app/api/employment-detail/route";
import { fetchEmployeesAdminServer } from "@/app/api/(server-side)/get-all-user(admin)/server";
import { fetchUserByIdServer } from "@/app/api/(server-side)/get-user-information/server";
import { fetchEmploymentDetailServer } from "@/app/api/(server-side)/get-user-employment-detail/server";
import { fetchTeamsServer } from "@/app/api/(server-side)/get-all-team/server";
import { fetchCurrentUserServer } from "@/app/api/(server-side)/get-current-user/server";
import { fetchEmployeesServer } from "@/app/api/(server-side)/get-all-user(user)/server";
import { fetchUserTeamServer } from "@/app/api/(server-side)/get-team/server";
import { fetchUserTasksServer } from "@/app/api/(server-side)/get-user-tasks/server";

// New imports for the additional APIs
export interface DepartmentType {
  id: string;
  name: string;
  description: string;
}

export interface PositionType {
  id: string;
  name: string;
  description: string;
}

export interface PermissionType {
  id: string;
  name: string;
  description: string;
}

export interface RoleWithPermissionsType {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  permissions: PermissionType[];
}

const fetchDepartments = async (): Promise<DepartmentType[]> => {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const response = await fetch(`http://localhost:8080/api/department`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
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
        throw new Error("Departments not found.");
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch departments`);
    }

    const data = await response.json();
    const departmentsArray = Array.isArray(data) ? data : [];

    return departmentsArray.map(
      (dept: any): DepartmentType => ({
        id: dept.id,
        name: dept.name,
        description: dept.description,
      })
    );
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch departments"
    );
  }
};

const fetchPositions = async (): Promise<PositionType[]> => {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const response = await fetch("http://localhost:8080/api/position", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
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
        throw new Error("Positions not found.");
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch positions`);
    }

    const data = await response.json();
    const positionsArray = Array.isArray(data) ? data : [];

    return positionsArray.map(
      (position: any): PositionType => ({
        id: position.id,
        name: position.name,
        description: position.description,
      })
    );
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch positions"
    );
  }
};

const fetchRoles = async (): Promise<RoleWithPermissionsType[]> => {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const response = await fetch("http://localhost:8080/api/role/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
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
        throw new Error("Roles not found.");
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch roles`);
    }

    const data = await response.json();
    const rolesArray = Array.isArray(data) ? data : [];

    return rolesArray.map(
      (role: any): RoleWithPermissionsType => ({
        id: role.id,
        created_at: role.createdAt,
        updated_at: role.updatedAt,
        name: role.name,
        description: role.description,
        permissions: Array.isArray(role.permissions)
          ? role.permissions.map(
              (p: any): PermissionType => ({
                id: p.id,
                name: p.name,
                description: p.description,
              })
            )
          : [],
      })
    );
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch roles"
    );
  }
};

// Existing types from the original code
interface AdminUserType {
  id: string;
  first_name: string;
  last_name: string;
}

interface AdminEmployeeType {
  id: string;
  user: AdminUserType;
  position: {
    id: string;
    name: string;
    description: string;
  };
  department: {
    id: string;
    name: string;
    description: string;
  };
  team?: {
    id: string;
    name: string;
  };
  role: {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    permissions: { id: string; name: string; description: string }[];
  };
  start_date: string;
  working_status: string;
}

interface UserEmployeeType {
  id: string;
  firstName: string;
  lastName: string;
}

interface ServerEmployeeType {
  id: string;
  user: UserEmployeeType;
  position: {
    id: string;
    name: string;
    description: string;
  };
  department: {
    id: string;
    name: string;
    description: string;
  };
  team?: {
    id: string;
    name: string;
  };
  startDate: string;
  workingStatus: string;
}

export type userInformation = {
  information: UserType;
  employmentDetail: EmploymentDetailType;
};

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get current user
  const currentUser = await fetchCurrentUserServer();
  if (!currentUser || !currentUser.user?.id) {
    console.error("Invalid or missing user ID from fetchCurrentUserServer");
    return new Response("Không tìm thấy thông tin người dùng hiện tại.", {
      status: 404,
    });
  }
  const roleName = currentUser.role?.name || "";

  let employeesAdmin: AdminEmployeeType[] = [];
  let employees: ServerEmployeeType[] = [];
  let teams = [];
  let leaderIds: string[] = [];
  let currentUserTeam = null;

  // Validate teamId
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const teamId = currentUser.team?.id;
  if (teamId && !uuidRegex.test(teamId)) {
    console.error("Invalid teamId format:", teamId);
    return new Response("ID đội nhóm không hợp lệ.", { status: 400 });
  }

  // Pre-fetch user team
  if (teamId) {
    try {
      currentUserTeam = await fetchUserTeamServer(teamId);
      console.log("Pre-fetched current user team:", currentUserTeam?.id);
    } catch (error: any) {
      console.error("Failed to pre-fetch current user team:", error.message);
    }
  }

  // Normalize AdminEmployeeType
  const normalizeAdminEmployee = async (
    e: AdminEmployeeType
  ): Promise<userInformation> => {
    const fullUser = await fetchUserByIdServer(e.user.id);
    const fullEmployment = await fetchEmploymentDetailServer(e.user.id);

    return {
      information: fullUser || {
        id: e.user.id,
        createdAt: "",
        updatedAt: "",
        firstName: e.user.first_name,
        lastName: e.user.last_name,
        email: "",
        birthDate: "",
        image_url: "",
        gender: "",
        nationality: "",
        phoneNumber: "",
        hireDate: e.start_date,
        address: "",
      },
      employmentDetail: fullEmployment || {
        id: e.id,
        user: {
          id: e.user.id,
          first_name: e.user.first_name,
          last_name: e.user.last_name,
        },
        position: {
          id: e.position?.id ?? "",
          name: e.position?.name ?? "",
          description: e.position?.description ?? "",
        },
        department: {
          id: e.department?.id ?? "",
          name: e.department?.name ?? "",
          description: e.department?.description ?? "",
        },
        team: e.team
          ? { id: e.team.id ?? "", name: e.team.name ?? "" }
          : { id: "", name: "" },
        start_date: e.start_date,
        working_status: e.working_status,
      },
    };
  };

  // Normalize ServerEmployeeType
  const normalizeBasicEmployee = async (
    e: ServerEmployeeType
  ): Promise<userInformation> => {
    const fullUser = await fetchUserByIdServer(e.user.id);
    const fullEmployment = await fetchEmploymentDetailServer(e.user.id);

    return {
      information: fullUser || {
        id: e.user.id,
        createdAt: "",
        updatedAt: "",
        firstName: e.user.firstName,
        lastName: e.user.lastName,
        email: "",
        birthDate: "",
        image_url: "",
        gender: "",
        nationality: "",
        phoneNumber: "",
        hireDate: e.startDate,
        address: "",
      },
      employmentDetail: fullEmployment || {
        id: e.id,
        user: {
          id: e.user.id,
          first_name: e.user.firstName,
          last_name: e.user.lastName,
        },
        position: {
          id: e.position?.id ?? "",
          name: e.position?.name ?? "",
          description: e.position?.description ?? "",
        },
        department: {
          id: e.department?.id ?? "",
          name: e.department?.name ?? "",
          description: e.department?.description ?? "",
        },
        team: e.team
          ? { id: e.team.id ?? "", name: e.team.name ?? "" }
          : { id: "", name: "" },
        start_date: e.startDate,
        working_status: e.workingStatus,
      },
    };
  };

  let normalizedEmployees: userInformation[] = [];

  if (roleName === "SUPER_ADMIN") {
    employeesAdmin = (await fetchEmployeesAdminServer()).filter(
      (e): e is AdminEmployeeType =>
        e.position !== null && e.department !== null && e.role !== null
    );
    teams = await fetchTeamsServer();
    leaderIds = teams.flatMap((team) =>
      team.leader?.id ? [team.leader.id] : []
    );
    normalizedEmployees = await Promise.all(
      employeesAdmin.map(normalizeAdminEmployee)
    );
  } else {
    const fetchedEmployees = await fetchEmployeesServer();
    employees = fetchedEmployees.map((e: any) => ({
      ...e,
      startDate: e.startDate ?? e.start_date ?? "",
      workingStatus: e.workingStatus ?? e.working_status ?? "",
    })) as ServerEmployeeType[];
    normalizedEmployees = await Promise.all(
      employees.map(normalizeBasicEmployee)
    );
  }

  const systemPrompt = `Bạn là trợ lý ảo chuyên nghiệp trong hệ thống quản lý nhân sự Socius. Trả lời chính xác, ngắn gọn, sử dụng đúng công cụ được cung cấp để truy xuất dữ liệu. Luôn kèm theo phản hồi văn bản tóm tắt (không quá 50 từ). Chỉ hiển thị **card** (Markdown) nếu dữ liệu thực sự cần thiết, ngắn gọn (dưới 5 mục), rõ ràng và dễ đọc. Tránh hiển thị danh sách dài hoặc thông tin lặp lại.

**Thông tin người dùng:**
- Họ tên: ${currentUser.user.firstName} ${currentUser.user.lastName}
- ID: ${currentUser.user.id}
- Vai trò: ${roleName}
- Nhóm: ${currentUser.team?.id ?? "Không có"}
**Trưởng nhóm:** ${leaderIds.map((id) => `- ${id}`).join("\n")}

---

### **QUY TẮC HOẠT ĐỘNG:**

1. **Phân quyền truy cập:**
   - SUPER_ADMIN: Truy cập toàn bộ dữ liệu hệ thống (nhân viên, team, phòng ban, vị trí, vai trò).
   - Non-SUPER_ADMIN: Chỉ truy cập nhân viên và team liên quan (\`fetchEmployeesServer\`, \`fetchUserTeamServer\`).
   - Các công cụ \`getDepartments\`, \`getPositions\`, \`getRoles\` chỉ dùng cho SUPER_ADMIN. Nếu không đủ quyền, trả lời: **"Bạn không có quyền thực hiện hành động này."**

2. **Trình bày kết quả:**
   - Chỉ dùng card khi dữ liệu **ngắn gọn, trọng yếu và dễ đọc**.
   - Với danh sách dài: **tóm tắt văn bản**, chỉ nêu số lượng hoặc điểm chính.
   - Không hiển thị danh sách lớn nếu người dùng không yêu cầu rõ ràng (VD: không tự động liệt kê toàn bộ nhiệm vụ khi chỉ hỏi "ai có nhiều task nhất").
   - Khi được hỏi thông tin của một người cụ thể, chỉ sử dụng card để trả về, không sử dụng văn bản, không sử dụng card danh sách.
   - Nếu đã trả về được card thì không trả về văn bản với toàn bộ nội dung trong card. Chỉ trả về văn bản với nội dung tóm tắt. Hoặc có thể trả lời theo kiểu "Dưới đây là card thông tin bạn cần".

3. **Định dạng card (Markdown):**
   - Dùng tiêu đề rõ ràng (VD: **Danh sách nhân viên**, **Chi tiết nhiệm vụ**).
   - Trình bày súc tích, không trình bày lại dữ liệu trong văn bản phản hồi.
   - Tối đa 5 mục; nếu dài hơn, ưu tiên tóm tắt.

4. **Xác minh ID và dữ liệu:**
   - Kiểm tra \`userId\`, \`teamId\`, \`taskId\` là UUID hợp lệ. Nếu không hợp lệ: **"ID không hợp lệ hoặc không tìm thấy."**
   - Nếu không có dữ liệu phù hợp, trả lời: **"Không tìm thấy thông tin phù hợp."**

5. **Ngôn ngữ và phong cách:**
   - Ngôn ngữ: **Tiếng Việt**, rõ ràng, chuyên nghiệp.
   - Tránh dùng ngôn ngữ đời thường, không trang trọng.
   - Nếu yêu cầu mơ hồ, trả lời: **"Vui lòng cung cấp thêm thông tin."**

6. **Xử lý lỗi:**
   - Nếu công cụ trả lỗi hoặc không phản hồi: **"Có lỗi, vui lòng thử lại."**
   - Không mô tả lỗi kỹ thuật, không ghi log nội bộ.

7. **Bảo mật dữ liệu:**
   - Không trả về thông tin nhạy cảm (như lương, mật khẩu).
   - Chỉ hiển thị dữ liệu mà người dùng hiện tại được phép truy cập.

---

### **LƯU Ý:**
- Luôn phản hồi ngắn gọn bằng văn bản, tóm tắt ý chính.
- Chỉ dùng card nếu dữ liệu ngắn, quan trọng và dễ đọc.
- Không lặp nội dung giữa card và phần mô tả.
- Ưu tiên quyền truy cập, độ chính xác, và bảo mật.

`;

  const result = await streamText({
    model: openai("gpt-4.1-mini"),
    system: systemPrompt,
    messages,
    maxRetries: 3,
    maxSteps: 4,
    maxTokens: 200,
    tools: {
      getInformation: tool({
        description: "Trả về thông tin cá nhân theo userId",
        parameters: z.object({
          userId: z.string().describe("ID của người dùng (UUID)"),
        }),
        execute: async ({ userId }) => {
          console.log("Calling getInformation for userId:", userId);
          if (!uuidRegex.test(userId)) {
            throw new Error("ID người dùng không hợp lệ");
          }
          const user: userInformation = {
            information: {} as UserType,
            employmentDetail: {} as EmploymentDetailType,
          };

          const [fetchedUser, fetchedEmploymentDetail] = await Promise.all([
            fetchUserByIdServer(userId),
            fetchEmploymentDetailServer(userId),
          ]);

          if (!fetchedUser) {
            throw new Error("Không tìm thấy thông tin người dùng");
          }
          if (!fetchedEmploymentDetail) {
            throw new Error("Không tìm thấy chi tiết công việc");
          }

          user.information = fetchedUser;
          user.employmentDetail = fetchedEmploymentDetail;
          console.log("getInformation result:", user);
          return user;
        },
      }),
      getEmployeeList: tool({
        description:
          "Trả về danh sách nhân viên, có thể lọc theo giới tính, trạng thái, phòng ban, hoặc team",
        parameters: z.object({
          gender: z.string().optional().describe("Giới tính: 'male', 'female'"),
          status: z
            .string()
            .optional()
            .describe("Trạng thái: 'active', 'inactive'"),
          department: z.string().optional().describe("Tên phòng ban"),
          team: z.string().optional().describe("Tên team"),
        }),
        execute: async ({ gender, status, department, team }) => {
          console.log("Calling getEmployeeList with filters:", {
            gender,
            status,
            department,
            team,
          });
          const filtered = normalizedEmployees.filter((e) => {
            const info = e.information;
            const empDetail = e.employmentDetail;
            return (
              (!gender || info.gender === gender) &&
              (!status || empDetail.working_status === status) &&
              (!department || empDetail.department?.name === department) &&
              (!team || empDetail.team?.name === team)
            );
          });
          console.log("Filtered employees:", filtered);
          return { employees: filtered };
        },
      }),
      getTaskList: tool({
        description: "Trả về danh sách nhiệm vụ của một người dùng theo userId",
        parameters: z.object({
          userId: z.string().describe("ID của người dùng (UUID)"),
        }),
        execute: async ({ userId }) => {
          console.log("Calling getTaskList for userId:", userId);
          if (!uuidRegex.test(userId)) {
            throw new Error("ID người dùng không hợp lệ");
          }
          const taskList = await fetchUserTasksServer(userId);
          console.log("getTaskList result:", taskList);
          return taskList;
        },
      }),
      getTeam: tool({
        description:
          "Trả về thông tin chi tiết của một team, bao gồm leader và danh sách thành viên",
        parameters: z.object({
          teamId: z.string().describe("ID của team (UUID)"),
        }),
        execute: async ({ teamId }) => {
          console.log("Calling getTeam with teamId:", teamId);
          if (!uuidRegex.test(teamId)) {
            throw new Error("ID đội nhóm không hợp lệ");
          }
          const team = await fetchUserTeamServer(teamId);
          if (!team) {
            throw new Error(
              "Không tìm thấy thông tin đội nhóm hoặc có lỗi xảy ra"
            );
          }
          console.log("getTeam result:", team);
          return team;
        },
      }),
      getDepartments: tool({
        description:
          "Trả về danh sách tất cả phòng ban (chỉ dành cho SUPER_ADMIN)",
        parameters: z.object({}),
        execute: async () => {
          console.log("Calling getDepartments");
          if (roleName !== "SUPER_ADMIN") {
            throw new Error("Bạn không có quyền thực hiện hành động này.");
          }
          const departments = await fetchDepartments();
          console.log("getDepartments result:", departments);
          return { departments };
        },
      }),
      getPositions: tool({
        description:
          "Trả về danh sách tất cả vị trí (chỉ dành cho SUPER_ADMIN)",
        parameters: z.object({}),
        execute: async () => {
          console.log("Calling getPositions");
          if (roleName !== "SUPER_ADMIN") {
            throw new Error("Bạn không có quyền thực hiện hành động này.");
          }
          const positions = await fetchPositions();
          console.log("getPositions result:", positions);
          return { positions };
        },
      }),
      getRoles: tool({
        description:
          "Trả về danh sách tất cả vai trò (chỉ dành cho SUPER_ADMIN)",
        parameters: z.object({}),
        execute: async () => {
          console.log("Calling getRoles");
          if (roleName !== "SUPER_ADMIN") {
            throw new Error("Bạn không có quyền thực hiện hành động này.");
          }
          const roles = await fetchRoles();
          console.log("getRoles result:", roles);
          return { roles };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
