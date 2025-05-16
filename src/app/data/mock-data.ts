import {
  AccountType,
  AppSettingType,
  DepartmentType,
  EmployeeRankingType,
  EmploymentDetailType,
  EmploymentHistoryType,
  LoginHistoryType,
  NotificationRecipient,
  NotificationType,
  PeerVoteType,
  PerformanceReviewType,
  PeriodType,
  PermissionType,
  PositionType,
  RolePermissionType,
  RoleType,
  SalaryHistoryType,
  TargetType,
  TaskType,
  TeamType,
  UserType,
} from "@/types/types";

const mockPosition: PositionType = {
  id: "pos-123e4567-e89b-12d3-a456-426614174001",
  name: "Software Engineer",
  description:
    "Responsible for developing and maintaining software applications",
  created_at: "2022-01-01T00:00:00Z",
  updated_at: "2025-05-08T10:00:00Z",
};

const mockDepartment: DepartmentType = {
  id: "dept-123e4567-e89b-12d3-a456-426614174002",
  name: "Engineering",
  description: "Handles all technical development and IT operations",
  created_at: "2022-01-01T00:00:00Z",
  updated_at: "2025-05-08T10:00:00Z",
};

const mockRole: RoleType = {
  id: "role-123e4567-e89b-12d3-a456-426614174003",
  name: "Developer",
  description: "Role for software developers",
  created_at: "2022-01-01T00:00:00Z",
  updated_at: "2025-05-08T10:00:00Z",
};

const mockPermissions: PermissionType[] = [
  {
    id: "perm-123e4567-e89b-12d3-a456-426614174004",
    name: "write_code",
    description: "Permission to write and commit code",
    created_at: "2022-01-01T00:00:00Z",
    updated_at: "2025-05-08T10:00:00Z",
  },
  {
    id: "perm-123e4567-e89b-12d3-a456-426614174005",
    name: "review_code",
    description: "Permission to review code",
    created_at: "2022-01-01T00:00:00Z",
    updated_at: "2025-05-08T10:00:00Z",
  },
];

const mockRolePermissions: RolePermissionType[] = [
  {
    role_id: mockRole.id,
    permission_id: mockPermissions[0].id,
  },
  {
    role_id: mockRole.id,
    permission_id: mockPermissions[1].id,
  },
];

const mockUserData: UserType = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  first_name: "Joe",
  last_name: "Mama",
  email: "joemama@example.com",
  birth_date: "1975-04-30",
  image_url:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWii2rKTD3FgFmJVzm3Z3-QXdHOQhqm_7aWQZk_XoE4CfPByvrmH2cFshN4Trv5CPkxzs&usqp=CAU",
  gender: "male",
  nationality: "Vietnam",
  phone_number: "+1234567890",
  hire_date: "2022-01-01",
  address: "123 Main Street, Springfield, IL",
  created_at: "2022-01-01T00:00:00Z",
  updated_at: "2025-05-08T10:00:00Z",
};

const mockTeam: TeamType = {
  id: "team-123e4567-e89b-12d3-a456-426614174006",
  name: "Backend Team",
  leader_id: mockUserData.id,
  created_at: "2022-01-01T00:00:00Z",
  updated_at: "2025-05-08T10:00:00Z",
};

const mockEmploymentDetail: EmploymentDetailType = {
  id: "empdet-123e4567-e89b-12d3-a456-426614174007",
  user_id: mockUserData.id,
  position_id: mockPosition.id,
  department_id: mockDepartment.id,
  team_id: mockTeam.id,
  role_id: mockRole.id,
  start_date: "2022-01-01",
  salary: 5000,
  working_status: "active",
  created_at: "2022-01-01T00:00:00Z",
  updated_at: "2025-05-08T10:00:00Z",
};

const mockSalaryHistory: SalaryHistoryType[] = [
  {
    id: "salhist-123e4567-e89b-12d3-a456-426614174009",
    user_id: mockUserData.id,
    previous_salary: null,
    new_salary: 5000,
    effective_date: "2023-01-01",
    reason: "Annual raise",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2025-05-08T10:00:00Z",
  },
];

const mockNotifications: NotificationType[] = [
  {
    id: "noti-123e4567-e89b-12d3-a456-426614174017",
    title: "Performance Review Reminder",
    sender_id: "admin-123e4567-e89b-12d3-a456-426614174018",
    message: "Please complete your Q1 2025 performance review",
    expiry_date: "2025-06-30",
    type: "reminder",
    is_urgent: true,
    created_at: "2025-04-01T00:00:00Z",
    updated_at: "2025-05-08T10:00:00Z",
  },
];

// Dữ liệu mẫu cho các bảng còn lại
const mockPeriods: PeriodType[] = [
  {
    id: "period-123e4567-e89b-12d3-a456-426614174008",
    name: "Q1 2025",
    type: "monthly",
    start_date: "2025-01-01",
    end_date: "2025-03-31",
    status: "active",
    description: "Performance review period for Q1 2025",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-05-08T10:00:00Z",
  },
];

const mockEmploymentHistory: EmploymentHistoryType[] = [
  {
    id: "emphist-123e4567-e89b-12d3-a456-426614174010",
    user_id: mockUserData.id,
    position_id: "pos-old-123e4567-e89b-12d3-a456-426614174011", // Giả lập vị trí cũ
    department_id: "dept-old-123e4567-e89b-12d3-a456-426614174012", // Giả lập phòng ban cũ
    team_id: "team-123e4567-e89b-12d3-a456-426614174006",
    role_id: "role-old-123e4567-e89b-12d3-a456-426614174013", // Giả lập vai trò cũ
    start_date: "2020-01-01",
    end_date: "2021-12-31",
    salary: 3000,
    description: "Previous role as Junior Developer",
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2021-12-31T00:00:00Z",
  },
];

const mockTargets: TargetType[] = [
  {
    id: "target-123e4567-e89b-12d3-a456-426614174014",
    name: "Complete Backend API",
    description: "Develop and deploy backend API by Q2 2025",
    deadline: "2025-06-30",
    status: "in_progress",
    assigned_to: mockUserData.id,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-05-08T10:00:00Z",
  },
];

const mockTasks: TaskType[] = [
  {
    id: "task-123e4567-e89b-12d3-a456-426614174015",
    name: "Implement Authentication",
    description: "Add JWT authentication to the API",
    deadline: "2025-06-01",
    status: "pending",
    assigned_to: mockUserData.id,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-05-08T10:00:00Z",
  },
];

const mockPerformanceReviews: PerformanceReviewType[] = [
  {
    id: "perfrev-123e4567-e89b-12d3-a456-426614174016",
    employee_id: mockUserData.id,
    reviewer_id: "reviewer-123e4567-e89b-12d3-a456-426614174017", // Giả lập ID reviewer
    period_id: mockPeriods[0].id,
    rating: 8.5,
    comment: "Great performance, keep up the good work!",
    created_at: "2025-04-01T00:00:00Z",
    updated_at: "2025-05-08T10:00:00Z",
  },
];

const mockPeerVotes: PeerVoteType[] = [
  {
    id: "vote-123e4567-e89b-12d3-a456-426614174018",
    voter_id: "voter-123e4567-e89b-12d3-a456-426614174019", // Giả lập ID voter
    voted_employee_id: mockUserData.id,
    period_id: mockPeriods[0].id,
    reason: "Excellent teamwork",
    vote_type: "positive",
    created_at: "2025-04-01T00:00:00Z",
    updated_at: "2025-05-08T10:00:00Z",
  },
];

const mockEmployeeRankings: EmployeeRankingType[] = [
  {
    id: "rank-123e4567-e89b-12d3-a456-426614174020",
    employee_id: mockUserData.id,
    period_id: mockPeriods[0].id,
    rank: 1,
    criteria: "performance",
    created_at: "2025-04-01T00:00:00Z",
    updated_at: "2025-05-08T10:00:00Z",
  },
];

const mockNotificationRecipients: NotificationRecipient[] = [
  {
    notification_id: mockNotifications[0].id,
    user_id: mockUserData.id,
    is_read: false,
    read_at: null,
  },
];

const mockAccounts: AccountType[] = [
  {
    id: "acc-123e4567-e89b-12d3-a456-426614174021",
    user_id: mockUserData.id,
    last_login: "2025-05-08T09:00:00Z",
    is_active: true,
    is_default_password: false,
    password: "hashed_password_123", // Giả lập mật khẩu đã mã hóa
    created_at: "2022-01-01T00:00:00Z",
    updated_at: "2025-05-08T10:00:00Z",
  },
];

const mockLoginHistory: LoginHistoryType[] = [
  {
    id: "loghist-123e4567-e89b-12d3-a456-426614174022",
    user_id: mockUserData.id,
    login_time: "2025-05-08T09:00:00Z",
    ip_address: "192.168.1.1",
    device_info: "Chrome on Windows 10",
    created_at: "2025-05-08T09:00:00Z",
    updated_at: "2025-05-08T10:00:00Z",
  },
];

const mockAppSettings: AppSettingType[] = [
  {
    id: "setting-123e4567-e89b-12d3-a456-426614174023",
    setting_key: "default_language",
    setting_value: "en",
    description: "Default language for the application",
    created_at: "2022-01-01T00:00:00Z",
    updated_at: "2025-05-08T10:00:00Z",
  },
];

// Mock user tổng hợp với thông tin từ các bảng liên quan
export const mockUser = {
  user: mockUserData,
  department: mockDepartment,
  position: mockPosition,
  team: mockTeam,
  role: mockRole,
  permissions: mockPermissions,
  employmentDetail: mockEmploymentDetail,
  employmentHistory: mockEmploymentHistory,
  salaryHistory: mockSalaryHistory,
  notifications: mockNotifications,
  performanceReviews: mockPerformanceReviews,
  tasks: mockTasks,
  targets: mockTargets,
};

// Gộp tất cả dữ liệu mẫu thành một đối tượng
export const mockData = {
  user: mockUser,
  rolePermissions: mockRolePermissions,
  periods: mockPeriods,
  employmentHistory: mockEmploymentHistory,
  targets: mockTargets,
  tasks: mockTasks,
  performanceReviews: mockPerformanceReviews,
  peerVotes: mockPeerVotes,
  employeeRankings: mockEmployeeRankings,
  notificationRecipients: mockNotificationRecipients,
  accounts: mockAccounts,
  loginHistory: mockLoginHistory,
  appSettings: mockAppSettings,
};
