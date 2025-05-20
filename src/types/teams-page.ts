export type TeamView = {
  id: string; // UUID của đội nhóm
  name: string; // Tên đội nhóm
  leader_id?: string | null; // ID trưởng nhóm
};

export type EmploymentDetailView = {
  id: string; // UUID của bản ghi employment
  user_id: string; // ID người dùng
  team_id?: string | null; // ID đội nhóm
  position_id: string; // ID vị trí
  department_id: string; // ID phòng ban
};

export type PositionView = {
  id: string; // UUID của vị trí
  name: string; // Tên vị trí
};

export type DepartmentView = {
  id: string; // UUID của phòng ban
  name: string; // Tên phòng ban
};

export type UserView = {
  id: string; // UUID của người dùng
  first_name: string; // Tên
  last_name: string; // Họ
  email: string; // Email
  phone_number?: string | null; // Số điện thoại
  image_url?: string | null; // URL hình ảnh
  hire_date: string; // Ngày tuyển dụng
};

export type UserFullView = UserView & {
  employment: EmploymentDetailView; // Chi tiết việc làm
  position: PositionView; // Thông tin vị trí
  department: DepartmentView; // Thông tin phòng ban
};

export type UpdateEmploymentPayload = {
  team_id?: string | null; // ID đội nhóm, null khi xóa
};
