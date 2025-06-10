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
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  hire_date: string;
  birth_date: string;
  gender: string;
  nationality: string;
  image_url: string;
  phone_number: string;
  address: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  department?: {
    id: string;
    name: string;
  };
  position?: {
    id: string;
    name: string;
  };
  team?: {
    id: string;
    name: string;
  };
  working_status: string;
  salary: number;
};
