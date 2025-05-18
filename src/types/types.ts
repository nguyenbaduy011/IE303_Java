// File: types.ts

// Type cho bảng positions (Danh sách các vị trí công việc) - Đã có
export type PositionType = {
  id: string; // UUID, khóa chính, tự động sinh
  name: string; // Tên vị trí, không null, duy nhất
  description?: string | null; // Mô tả, có thể null
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng departments (Danh sách các phòng ban) - Đã có
export type DepartmentType = {
  id: string; // UUID, khóa chính, tự động sinh
  name: string; // Tên phòng ban, không null, duy nhất
  description?: string | null; // Mô tả, có thể null
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng roles (Danh sách các vai trò)
export type RoleType = {
  id: string; // UUID, khóa chính, tự động sinh
  name: string; // Tên vai trò, không null, duy nhất
  description?: string | null; // Mô tả, có thể null
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng permissions (Danh sách các quyền)
export type PermissionType = {
  id: string; // UUID, khóa chính, tự động sinh
  name: string; // Tên quyền, không null, duy nhất
  description?: string | null; // Mô tả, có thể null
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng role_permissions (Mối quan hệ giữa vai trò và quyền)
export type RolePermissionType = {
  role_id: string; // ID vai trò, khóa ngoại tham chiếu roles(id)
  permission_id: string; // ID quyền, khóa ngoại tham chiếu permissions(id)
};

// Type cho bảng periods (Kỳ hạn đánh giá hoặc thời gian)
export type PeriodType = {
  id: string; // UUID, khóa chính, tự động sinh
  name: string; // Tên kỳ hạn, không null
  type: "daily" | "weekly" | "monthly" | "yearly"; // Loại kỳ hạn, chỉ cho phép các giá trị cố định
  start_date: string; // Ngày bắt đầu, không null, phải <= ngày hiện tại
  end_date: string; // Ngày kết thúc, không null, phải >= start_date
  status: "active" | "inactive"; // Trạng thái kỳ hạn, chỉ cho phép active hoặc inactive
  description?: string | null; // Mô tả, có thể null
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng users (Thông tin cá nhân người dùng) - Đã có
export type UserType = {
  id: string; // UUID, khóa chính, tự động sinh
  first_name: string; // Tên, không null
  last_name: string; // Họ, không null
  email: string; // Email, không null, duy nhất, phải đúng định dạng email
  birth_date: string; // Ngày sinh, không null, phải <= ngày hiện tại - 18 năm
  image_url?: string | null; // URL hình ảnh, có thể null
  gender: "male" | "female"; // Giới tính, chỉ cho phép male hoặc female
  nationality?: string | null; // Quốc tịch
  phone_number?: string | null; // Số điện thoại, định dạng 10-15 số
  hire_date: string; // Ngày tuyển dụng, không null, phải <= ngày hiện tại
  address?: string | null; // Địa chỉ
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng teams (Danh sách các đội nhóm)
export type TeamType = {
  id: string; // UUID, khóa chính, tự động sinh
  name: string; // Tên đội nhóm, không null, duy nhất
  leader_id?: string | null; // ID người lãnh đạo, khóa ngoại tham chiếu users(id), duy nhất, có thể null
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng employment_details (Thông tin việc làm hiện tại)
export type EmploymentDetailType = {
  id: string; // UUID, khóa chính, tự động sinh
  user_id: string; // ID người dùng, không null, khóa ngoại tham chiếu users(id), duy nhất
  position_id: string; // ID vị trí, không null, khóa ngoại tham chiếu positions(id)
  department_id: string; // ID phòng ban, không null, khóa ngoại tham chiếu departments(id)
  team_id?: string | null; // ID đội nhóm, có thể null, khóa ngoại tham chiếu teams(id)
  role_id: string; // ID vai trò, không null, khóa ngoại tham chiếu roles(id)
  start_date: string; // Ngày bắt đầu, không null, phải <= ngày hiện tại
  salary: number; // Lương, không null, phải >= 0
  working_status: "active" | "inactive" | "terminated"; // Trạng thái làm việc, chỉ cho phép các giá trị cố định
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// // Type thể hiện toàn bộ thông tin chi tiết của nhân viên
// export type EmployeeDetail = {
//   user: UserType;
//   employment: EmploymentDetailType;
//   department: DepartmentType;
//   role: RoleType;
// };

// Type cho bảng employment_history (Lịch sử việc làm)
export type EmploymentHistoryType = {
  id: string; // UUID, khóa chính, tự động sinh
  user_id: string; // ID người dùng, không null, khóa ngoại tham chiếu users(id)
  position_id: string; // ID vị trí, không null, khóa ngoại tham chiếu positions(id)
  department_id: string; // ID phòng ban, không null, khóa ngoại tham chiếu departments(id)
  team_id?: string | null; // ID đội nhóm, có thể null, khóa ngoại tham chiếu teams(id)
  role_id: string; // ID vai trò, không null, khóa ngoại tham chiếu roles(id)
  start_date: string; // Ngày bắt đầu, không null, phải <= ngày hiện tại
  end_date: string; // Ngày kết thúc, không null, phải >= start_date
  salary: number; // Lương, không null, phải >= 0
  description?: string | null; // Mô tả, có thể null
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng salary_history (Lịch sử lương)
export type SalaryHistoryType = {
  id: string; // UUID, khóa chính, tự động sinh
  user_id: string; // ID người dùng, không null, khóa ngoại tham chiếu users(id)
  previous_salary: number | null; // Lương cũ, không null, phải >= 0
  new_salary: number; // Lương mới, không null, phải >= 0
  effective_date: string; // Ngày hiệu lực, không null
  reason?: string | null; // Lý do thay đổi, có thể null
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng targets (Mục tiêu)
export type TargetType = {
  id: string; // UUID, khóa chính, tự động sinh
  name: string; // Tên mục tiêu, không null, duy nhất
  description?: string | null; // Mô tả, có thể null
  deadline: string; // Hạn chót, không null
  status: "pending" | "completed" | "failed" | "in_progress"; // Trạng thái, chỉ cho phép các giá trị cố định
  assigned_to?: string | null; // ID người được giao, có thể null, khóa ngoại tham chiếu users(id)
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng tasks (Nhiệm vụ)
export type TaskType = {
  id: string; // UUID, khóa chính, tự động sinh
  name: string; // Tên nhiệm vụ, không null, duy nhất
  description?: string | null; // Mô tả, có thể null
  deadline: string; // Hạn chót, không null, phải > ngày hiện tại
  status: "pending" | "completed" | "failed" | "in_progress"; // Trạng thái, chỉ cho phép các giá trị cố định
  assigned_to?: string | null; // ID người được giao, có thể null, khóa ngoại tham chiếu users(id)
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng performance_reviews (Đánh giá hiệu suất)
export type PerformanceReviewType = {
  id: string; // UUID, khóa chính, tự động sinh
  employee_id: string; // ID nhân viên, không null, khóa ngoại tham chiếu users(id)
  reviewer_id: string; // ID người đánh giá, không null, khóa ngoại tham chiếu users(id)
  period_id: string; // ID kỳ hạn, không null, khóa ngoại tham chiếu periods(id)
  rating: number; // Điểm đánh giá, không null, từ 0 đến 10
  comment?: string | null; // Nhận xét, có thể null
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng peer_votes (Phiếu bầu từ đồng nghiệp)
export type PeerVoteType = {
  id: string; // UUID, khóa chính, tự động sinh
  voter_id: string; // ID người bầu, không null, khóa ngoại tham chiếu users(id)
  voted_employee_id: string; // ID nhân viên được bầu, không null, khóa ngoại tham chiếu users(id)
  period_id: string; // ID kỳ hạn, không null, khóa ngoại tham chiếu periods(id)
  reason?: string | null; // Lý do, có thể null
  vote_type: "positive" | "negative"; // Loại phiếu, chỉ cho phép positive hoặc negative
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng employee_ranking (Xếp hạng nhân viên)
export type EmployeeRankingType = {
  id: string; // UUID, khóa chính, tự động sinh
  employee_id: string; // ID nhân viên, không null, khóa ngoại tham chiếu users(id)
  period_id: string; // ID kỳ hạn, không null, khóa ngoại tham chiếu periods(id)
  rank: number; // Xếp hạng, không null
  criteria: "performance" | "peer_vote" | "attendance" | "task_completion"; // Tiêu chí xếp hạng, chỉ cho phép các giá trị cố định
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho các loại thông báo - Đã có
export type NotiType = "info" | "reminder" | "error";

// Type cho bảng notifications (Thông báo) - Đã có
export type NotificationType = {
  id: string; // UUID, khóa chính, tự động sinh
  title: string; // Tiêu đề, không null
  sender_id: string; // ID người gửi, không null, khóa ngoại tham chiếu users(id)
  message: string; // Nội dung, không null
  expiry_date: string; // Ngày hết hạn, không null
  type: NotiType; // Loại thông báo, chỉ cho phép các giá trị cố định
  is_urgent: boolean; // Mức độ khẩn cấp, không null
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng notification_recipients (Người nhận thông báo) - Đã có
export type NotificationRecipient = {
  notification_id: string; // ID thông báo, không null, khóa ngoại tham chiếu notifications(id)
  user_id: string; // ID người nhận, không null, khóa ngoại tham chiếu users(id)
  is_read: boolean; // Đã đọc chưa, mặc định false
  read_at: string | null; // Thời gian đọc, có thể null
};

// Type cho bảng account (Thông tin tài khoản)
export type AccountType = {
  id: string; // UUID, khóa chính, tự động sinh
  user_id: string; // ID người dùng, không null, khóa ngoại tham chiếu users(id)
  last_login: string; // Lần đăng nhập cuối, mặc định CURRENT_TIMESTAMP
  is_active: boolean; // Trạng thái hoạt động, mặc định true
  is_default_password: boolean; // Sử dụng mật khẩu mặc định, mặc định true
  password: string; // Mật khẩu, không null
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng login_history (Lịch sử đăng nhập)
export type LoginHistoryType = {
  id: string; // UUID, khóa chính, tự động sinh
  user_id: string; // ID người dùng, không null, khóa ngoại tham chiếu users(id)
  login_time: string; // Thời gian đăng nhập, mặc định CURRENT_TIMESTAMP
  ip_address?: string | null; // Địa chỉ IP, có thể null
  device_info?: string | null; // Thông tin thiết bị, có thể null
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// Type cho bảng app_settings (Cài đặt ứng dụng)
export type AppSettingType = {
  id: string; // UUID, khóa chính, tự động sinh
  setting_key: string; // Khóa cài đặt, không null, duy nhất
  setting_value: string; // Giá trị cài đặt, không null
  description?: string | null; // Mô tả, có thể null
  created_at: string; // Thời gian tạo, mặc định CURRENT_TIMESTAMP
  updated_at: string; // Thời gian cập nhật, mặc định CURRENT_TIMESTAMP
};

// ------------------------------------------------

export type RoleWithPermissions = RoleType & {
  permissions: PermissionType[];
};

export type UserFullShape = {
  /* ── Thông tin cá nhân ── */
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  image_url: string | null;
  gender: "male" | "female";
  nationality: string | null;
  phone_number: string | null;
  hire_date: string;
  address: string | null;
  department: DepartmentType;
  role: RoleWithPermissions;
  session_id: string;
  authenticated: boolean;
  message: string;
  password_changed_required: boolean;
  employment: EmploymentDetailType;
  position: PositionType;
  team?: TeamType | null;
};
