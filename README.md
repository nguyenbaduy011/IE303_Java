<!-- Banner -->
<p align="center">
  <a href="https://www.uit.edu.vn/" title="Trường Đại học Công nghệ Thông tin" style="border: none;">
    <img src="https://i.imgur.com/WmMnSRt.png" alt="Trường Đại học Công nghệ Thông tin | University of Information Technology">
  </a>
</p>

![Image](https://github.com/user-attachments/assets/17ac92f1-f23f-4b86-bf29-1e983c8f3d73)

<!-- Title -->
<h1 align="center"><b>ĐỒ ÁN CUỐI KỲ - CÔNG NGHỆ JAVA</b></h1>

<p align="center"><i>Trường Đại học Công nghệ Thông tin - Đại học Quốc gia TP.HCM</i></p>

---

## 🔖 Thông tin nhóm

| STT | MSSV       | Họ và Tên              | Email                    |
|-----|------------|------------------------|--------------------------|
| 1   | 22520322   | Nguyễn Bá Duy          | 22520322@gm.uit.edu.vn  |
| 2   | 22520449   | Võ Chính Hiệu          | 22520449@gm.uit.edu.vn  |
| 3   | 22520625   | Phạm Nguyễn Gia Khang  | 22520625@gm.uit.edu.vn  |
| 4   | 22520316   | Lê Thanh Duy           | 22520316@gm.uit.edu.vn  |

---

## 📘 Thông tin môn học

- **Tên môn học**: Công nghệ Java  
- **Mã môn học**: IE303  
- **Mã lớp**: IE303.P21.CNCL  
- **Năm học**: Học kỳ 2 (2024 - 2025)  
- **Giảng viên hướng dẫn**: ThS. Huỳnh Văn Tín

---

## 📝 Đề tài đồ án

**Tên đề tài**: Xây dựng website quản lý nhân sự kết hợp mạng xã hội nội bộ – **Socius**

**Mục tiêu**:  
Socius là một hệ thống giúp doanh nghiệp quản lý thông tin nhân sự hiệu quả, tăng cường kết nối giữa các nhân viên, và hỗ trợ công việc nội bộ thông qua các công cụ giao tiếp, quản lý task, và đặc biệt là **Assistant AI** – hỗ trợ thông minh dành cho cả **admin** (trong thao tác quản lý) và **nhân viên** (trong thao tác tìm kiếm, truy vấn dữ liệu).

---

## ✨ Các chức năng chính

- 📋 **Quản lý nhân sự**: Thêm, sửa, xoá, tìm kiếm thông tin nhân viên  
- 🔐 **Xác thực và phân quyền**: Đăng nhập, phân quyền (Admin, Nhân viên), quản lý phiên người dùng thông qua **React Context trong Next.js** 
- 📩 **Giao tiếp nội bộ**: Nhắn tin giữa nhân viên, nhận thông báo từ hệ thống  
- ✅ **Quản lý công việc**: Nhân viên xem và cập nhật trạng thái các task được giao  
- 🤖 **Assistant AI**:
  - Hỗ trợ **Admin**: Tư vấn, đề xuất thao tác, tìm kiếm nhân sự nhanh theo tiêu chí
  - Hỗ trợ **Nhân viên**: Truy vấn thông tin nhanh về công việc, thời gian biểu, liên hệ
- 📊 **Dashboard tổng quan**: Theo dõi số lượng nhân viên, tình trạng làm việc, task đang xử lý

---

## 🛠️ Công nghệ sử dụng

| Loại | Công nghệ |
|------|-----------|
| Ngôn ngữ | TypeScript |
| Frontend | Next.js, React.js |
| UI Framework | Tailwind CSS, shadcn/ui |
| Backend | **Spring Boot** (repo riêng) |
| AI Assistant | Tích hợp AI API (OpenAI / Local AI service) |
| Giao tiếp API | RESTful (JSON) |
| Trạng thái ứng dụng | React Context, React Hooks |

---

## 🔗 Repository liên quan

- 🌐 **Frontend (hiện tại)**: [Socius Frontend](https://github.com/nguyenbaduy011/IE303_Java)
- ⚙️ **Backend (Spring Boot)**: [Socius Backend](https://github.com/Haryuya11/socius-web-backend)

---

## 🚀 Cài đặt và chạy dự án (Frontend)

# 1. Clone repository
git clone https://github.com/nguyenbaduy011/IE303_Java.git

# 2. Di chuyển vào thư mục dự án
cd IE303_Java

# 3. Cài đặt dependencies với Bun
bun install (⚠️ Yêu cầu đã cài đặt Bun trên máy tính.)

# 4. Khởi chạy server phát triển
bun run dev
