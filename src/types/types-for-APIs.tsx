//Type cho bảng employment_history (Lịch sử việc làm)
export type EmploymentHistoryCardType = {
  id: string; // UUID, khóa chính
  start_date: string; // Ngày bắt đầu, không null
  end_date: string; // Ngày kết thúc, không null
  salary: number; // Lương, không null, phải >= 0
  description?: string | null; // Mô tả, có thể null
  department: {
    name: string; // Tên phòng ban
  };
  position: {
    name: string; // Tên vị trí
  };
  team: {
    name: string | null; // Tên đội nhóm, có thể null
  };
};

//Type cho bảng performance_chart_tasks (Đánh giá hiệu suất)
export type PerformanceChartCardType = {
  created_at: string; // Thời gian tạo, dùng để nhóm theo tháng
  status: "pending" | "completed" | "failed" | "in_progress"; // Trạng thái, dùng để tính tỷ lệ hoàn thành
};

//Type cho bảng salary_history (Lịch sử lương)
export type SalaryHistoryCardPropsType = {
  id: string; // UUID, khóa chính
  previous_salary: number | null; // Lương cũ, có thể null
  new_salary: number; // Lương mới, không null, phải >= 0
  effective_date: string; // Ngày hiệu lực, không null
  reason?: string | null; // Lý do thay đổi, có thể null
};

//Type cho bảng users (Thoại tin cá nhân người dùng)
export type UserProfileCardPropsType = {
  id: string; // UUID, khóa chính
  first_name: string; // Tên
  last_name: string; // Họ
  email: string; // Email
  birth_date: string; // Ngày sinh
  image_url?: string | null; // URL hình ảnh
  gender: "male" | "female"; // Giới tính
  nationality?: string | null; // Quốc tịch
  phone_number?: string | null; // Số điện thoại
  hire_date: string; // Ngày tuyển dụng
  address?: string | null; // Địa chỉ
};