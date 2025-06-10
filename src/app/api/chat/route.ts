import { tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import z from "zod";

import { UserType } from "@/app/api/get-user-information/route";
import { EmploymentDetailType } from "@/app/api/employment-detail/route";
import { fetchEmployeesAdminServer } from "@/app/api/(server-side)/get-all-user(admin)/server";
import { fetchUserByIdServer } from "@/app/api/(server-side)/get-user-information/server";
import { fetchEmploymentDetailServer } from "@/app/api/(server-side)/get-user-employment-detail/server";
import { fetchTeamsServer } from "@/app/api/(server-side)/get-all-team/server";
import { fetchCurrentUserServer } from "@/app/api/(server-side)/get-current-user/server";
import { createTaskServer } from "@/app/api/(server-side)/create-task/server";
import { fetchEmployeesServer } from "@/app/api/(server-side)/get-all-user(user)/server";
import { fetchTeamServer } from "@/app/api/(server-side)/get-team/server";
import { fetchUserTasksServer } from "@/app/api/(server-side)/get-user-tasks/server";

// Định nghĩa type cho dữ liệu thô từ fetchEmployeesAdminServer
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

// Định nghĩa type cho dữ liệu thô từ fetchEmployeesServer
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

  // Lấy thông tin user hiện tại
  const currentUser = await fetchCurrentUserServer();
  if (!currentUser) {
    return new Response("Không tìm thấy thông tin người dùng hiện tại.", {
      status: 404,
    });
  }

  // Giả sử currentUser.user.role là object hoặc string có role name
  const roleName = currentUser.role?.name || "";

  let employeesAdmin: AdminEmployeeType[] = [];
  let employees: ServerEmployeeType[] = [];
  let teams = [];
  let leaderIds: string[] = [];

  if (roleName === "SUPER_ADMIN") {
    employeesAdmin = await fetchEmployeesAdminServer();
    teams = await fetchTeamsServer();
    leaderIds = teams.map((team) => team.leader.id);
  } else {
    employees = await fetchEmployeesServer();
  }

  // Chuẩn hóa dữ liệu employees để khớp với userInformation
  let normalizedEmployees: userInformation[] = [];
  if (roleName === "SUPER_ADMIN" && employeesAdmin) {
    normalizedEmployees = await Promise.all(
      employeesAdmin.map(async (e) => {
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
            position: e.position,
            department: e.department,
            team: e.team || { id: "", name: "" },
            start_date: e.start_date,
            working_status: e.working_status,
          },
        };
      })
    );
  } else if (employees) {
    normalizedEmployees = await Promise.all(
      employees.map(async (e) => {
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
            position: e.position,
            department: e.department,
            team: e.team || { id: "", name: "" },
            start_date: e.startDate,
            working_status: e.workingStatus,
          },
        };
      })
    );
  }

  // Kiểm tra dữ liệu
  console.log("Normalized employees:", normalizedEmployees);

  const systemPrompt = `
  Bạn là một trợ lý ảo chuyên nghiệp trong hệ thống quản lý nhân sự Socius. Mục tiêu là trả lời chính xác, ngắn gọn, và chỉ sử dụng các tool được chỉ định để render dữ liệu dưới dạng card.
  
  🔹 **Thông tin người dùng hiện tại:**
  - Họ tên: ${currentUser.user.firstName} ${currentUser.user.lastName}
  - ID: ${currentUser.user.id}
  
  🔹 **Danh sách trưởng nhóm (Team Leader):**
  ${leaderIds.map((id) => `- User ID: ${id}`).join("\n")}
  
  ---
  
  🔧 **QUY TẮC BẮT BUỘC (TUÂN THỦ 100%)**
  
  1. 🚫 **TUYỆT ĐỐI KHÔNG được trả về bất kỳ văn bản, JSON, hoặc thẻ JSX nào.**
     - ❌ Không được viết: <EmployeeInfoCard ... />
     - ✅ Chỉ gọi tool và để hệ thống tự render card.
     - Mọi nội dung trả về phải được thực hiện thông qua gọi tool.
  
  2. ✅ **Nếu người dùng yêu cầu thông tin cá nhân** (ví dụ: "Thông tin của tôi", "Hồ sơ của Nguyễn Văn A", "Thông tin nhân viên ID X"):
     - Gọi tool: \`getInformation({ userId })\`
     - KHÔNG được viết bất kỳ văn bản nào khác.
  
  3. ✅ **Nếu người dùng yêu cầu danh sách nhân viên**:
     - Gọi tool: \`getEmployeeList({ ...params })\`
     - KHÔNG được viết bất kỳ câu dẫn hay đoạn mô tả nào.
  
  4. ✅ **Nếu người dùng yêu cầu thêm nhiệm vụ**:
     - Nếu \`currentUser.id\` KHÔNG thuộc \`leaderIds\`, trả về chuỗi: "Bạn không phải trưởng nhóm, không thể tạo nhiệm vụ."
     - Ngược lại, gọi \`addTask(...)\`
  
  5. 🚫 **Tuyệt đối KHÔNG sử dụng dữ liệu trong prompt để tự lọc, xử lý hoặc trả lời.**
  
  ---
  
  ✨ **Tóm lại**:
  - ✅ Chỉ gọi tool → để hệ thống hiển thị component tương ứng.
  - 🚫 KHÔNG bao giờ trả về văn bản chứa JSX như: <EmployeeInfoCard ... />
  - ✅ Tuân thủ hoàn toàn các quy tắc trên để trả lời đúng định dạng hệ thống yêu cầu.
  `;
  

  const result = streamText({
    model: openai("gpt-4.1-mini"),
    system: systemPrompt,
    messages,
    maxSteps: 5,
    maxTokens: 150, // Giới hạn token để giảm output dư thừa
    tools: {
      getInformation: tool({
        description: "Trả về thông tin cá nhân theo userId",
        parameters: z.object({
          userId: z.string().describe("ID của người dùng (UUID)"),
        }),
        execute: async ({ userId }) => {
          console.log("Calling getInformation for userId:", userId);
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
      addTask: tool({
        description: "Thêm nhiệm vụ cho nhân viên",
        parameters: z.object({
          name: z.string().describe("Tên nhiệm vụ"),
          description: z.string().describe("Mô tả nhiệm vụ"),
          deadline: z.string().describe("Thời hạn nhiệm vụ"),
          status: z.string().describe("Trạng thái nhiệm vụ"),
          assignedToId: z
            .string()
            .describe("ID người được giao nhiệm vụ (UUID)"),
        }),
        execute: async ({ name, description, deadline, assignedToId }) => {
          console.log("Calling addTask with:", {
            name,
            description,
            deadline,
            assignedToId,
          });
          const task = await createTaskServer({
            name,
            description,
            deadline,
            status: "in_progress",
            assignedToId,
          });
          console.log("addTask result:", task);
          return task;
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
