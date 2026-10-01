# 📊 BẢNG QUẢN LÝ ĐỒ ÁN TỐT NGHIỆP / DỰ ÁN (PROJECT MANAGEMENT MATRIX)
## 🏨 ĐỀ TÀI: XÂY DỰNG HỆ THỐNG WEBSITE ĐẶT PHÒNG KHÁCH SẠN TRỰC TUYẾN (VNSTAY.VN)

---

### 📋 MỤC LỤC BẢNG QUẢN LÝ DỰ ÁN
1. **TAB 1:** TỔNG QUAN DỰ ÁN & CẤU HÌNH CÔNG NGHỆ (PROJECT OVERVIEW)
2. **TAB 2:** MA TRẬN PHÂN CÔNG NHIỆM VỤ & TIẾN ĐỘ THI CÔNG (WBS & PROGRESS TRACKER)
3. **TAB 3:** MA TRẬN YÊU CẦU CHỨC NĂNG NGUYÊN MẪU (FUNCTIONAL REQUIREMENTS MATRIX)
4. **TAB 4:** DANH SÁCH BẢNG DỮ LIỆU CSDL & API ENDPOINTS (DB SCHEMA & API DOCUMENTATION)
5. **TAB 5:** BẢNG KỊCH BẢN KIỂM THỬ HỆ THỐNG (SYSTEM TEST CASE MATRIX)

---

## 📌 TAB 1: TỔNG QUAN DỰ ÁN & CẤU HÌNH CÔNG NGHỆ (PROJECT OVERVIEW)

* **Tên đề tài:** Xây dựng Hệ thống Website Đặt Phòng Khách Sạn & Resort Trực Tuyến Toàn Quốc (`VnStay.vn`)
* **Lĩnh vực:** Công nghệ Thông tin / Phần mềm Fullstack Web Application
* **Mô hình kiến trúc:** Client - Server RESTful API (Tách biệt Frontend & Backend)
* **Giao diện & Trải nghiệm (UI/UX):** Phong cách Trắng - Xanh Đại Dương (`#0284c7`), tối ưu hóa hiển thị thương mại du lịch (Traveloka / Agoda style).

### 🛠️ Cấu Hình Công Nghệ Chi Tiết (Tech Stack Breakdown):
* **Frontend (Khách hàng & Admin):**
  * `React 19`: Thư viện xây dựng giao diện ứng dụng đơn trang (SPA).
  * `React Router DOM v7`: Điều hướng trang linh hoạt (`/`, `/rooms`, `/checkout`, `/my-bookings`, `/admin`).
  * `Tailwind CSS v4`: Framework thiết kế giao diện responsive hiện đại.
  * `Lucide Icons`: Bộ biểu tượng trực quan chuyên nghiệp.
  * `Axios`: Thư viện xử lý HTTP requests giao tiếp API Backend.
  * `Vite`: Công cụ đóng gói & biên dịch ứng dụng tốc độ cao.
* **Backend (Máy chủ API & Xử lý nghiệp vụ):**
  * `Node.js & Express.js (v5)`: Xây dựng máy chủ RESTful API.
  * `SQLite3`: Hệ quản trị cơ sở dữ liệu nhúng nhẹ, nhanh, độc lập.
  * `JSON Web Token (JWT)`: Mã hóa định danh xác thực phiên làm việc 24h.
  * `Bcrypt.js`: Mã hóa băm mật khẩu bảo mật (Salt round 10).
  * `Helmet.js`: Cấu hình HTTP Security Headers chống XSS, Clickjacking.
  * `Express-Rate-Limit`: Chống tấn công dò mật khẩu tự động (Brute-Force Attack).

---

## 📅 TAB 2: MA TRẬN PHÂN CÔNG NHIỆM VỤ & TIẾN ĐỘ THI CÔNG (WBS & PROGRESS TRACKER)

| STT | Giai Đoạn (Phase) | Hạng Mục Công Việc (Task Description) | Người Thực Hiện | Thời Gian | Trạng Thái | Mức Độ Ưu Tiên |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **I** | **KHẢO SÁT & THIẾT KẾ** | | | | | |
| 1.1 | Nghiên cứu yêu cầu | Khảo sát quy trình đặt phòng thực tế từ Traveloka, Agoda, Booking.com | PM / UI Lead | Tuần 1 | 🟢 Hoàn thành (100%) | High |
| 1.2 | Thiết kế CSDL | Đỉnh nghĩa 6 bảng SQLite (`users`, `room_types`, `rooms`, `bookings`, `payments`, `reviews`) | DB Dev | Tuần 1 | 🟢 Hoàn thành (100%) | High |
| 1.3 | Thiết kế ERD/DBML | Dựng sơ đồ quan hệ CSDL chuẩn mã DBML trên `dbdiagram.io` | DB Dev | Tuần 1 | 🟢 Hoàn thành (100%) | High |
| **II** | **PHÁT TRIỂN BACKEND** | | | | | |
| 2.1 | Khởi tạo Server | Dựng máy chủ Node.js/Express Cổng 5000 và kết nối SQLite | Backend Dev | Tuần 2 | 🟢 Hoàn thành (100%) | High |
| 2.2 | API Xác thực (Auth) | Viết API Đăng ký (`/register`), Đăng nhập (`/login`) băm bcrypt & JWT | Backend Dev | Tuần 2 | 🟢 Hoàn thành (100%) | High |
| 2.3 | API Khách sạn/Phòng | Viết API xem danh sách phòng, chi tiết phòng & bộ lọc 63 tỉnh thành | Backend Dev | Tuần 2 | 🟢 Hoàn thành (100%) | High |
| 2.4 | API Đặt phòng & QR | Viết API tạo đơn đặt phòng, thanh toán mô phỏng QR & hủy đơn | Backend Dev | Tuần 3 | 🟢 Hoàn thành (100%) | High |
| 2.5 | API Admin Dashboard | Viết API thống kê doanh thu, duyệt đơn, tạo phòng, Walk-in booking | Backend Dev | Tuần 3 | 🟢 Hoàn thành (100%) | High |
| 2.6 | Bảo mật đa lớp | Cấu hình Helmet, Rate-limit (khóa 15p khi sai 5 lần), DB RBAC check | Security Dev | Tuần 3 | 🟢 Hoàn thành (100%) | High |
| **III** | **PHÁT TRIỂN FRONTEND** | | | | | |
| 3.1 | Khởi tạo UI Framework | Dựng React App Vite + Tailwind CSS chủ đạo Trắng - Xanh | Frontend Dev | Tuần 4 | 🟢 Hoàn thành (100%) | High |
| 3.2 | Trang Chủ (HomePage) | Dựng Hero search 63 tỉnh thành, Promo Vouchers, Reviews carousel | Frontend Dev | Tuần 4 | 🟢 Hoàn thành (100%) | High |
| 3.3 | Trang Danh Sách Phòng | Dựng Sidebar bộ lọc đa tiêu chí (địa điểm, giá, số khách, sắp xếp) | Frontend Dev | Tuần 4 | 🟢 Hoàn thành (100%) | High |
| 3.4 | Trang Chi Tiết Phòng | Dựng Gallery ảnh, tiện nghi, chính sách khách sạn & Review form | Frontend Dev | Tuần 5 | 🟢 Hoàn thành (100%) | High |
| 3.5 | Trang Checkout & QR | Dựng form giữ phòng & Modal quét mã QR VNPay/MoMo/Visa | Frontend Dev | Tuần 5 | 🟢 Hoàn thành (100%) | High |
| 3.6 | Trang Đơn Của Tôi | Dựng trang tra cứu E-Voucher QR Code & nút Hủy đơn trực tuyến | Frontend Dev | Tuần 5 | 🟢 Hoàn thành (100%) | High |
| 3.7 | Trang Admin Dashboard | Dựng 5 tab quản trị: Doanh thu, Walk-in, Phòng trống/thuê, CSV export | Frontend Dev | Tuần 6 | 🟢 Hoàn thành (100%) | High |
| **IV** | **TỐI ƯU & KIỂM THỬ** | | | | | |
| 4.1 | Tối ưu hóa UI/UX | Loại bỏ cảm giác AI, chuẩn hóa thuật ngữ tiếng Việt thương mại | UI/UX Lead | Tuần 7 | 🟢 Hoàn thành (100%) | Medium |
| 4.2 | Kiểm thử bảo mật | Test khóa Brute-force login, test giả mạo JWT Admin | Security Tester | Tuần 7 | 🟢 Hoàn thành (100%) | High |
| 4.3 | Đẩy GitHub Repo | Đồng bộ toàn bộ mã nguồn lên GitHub Repository chính thức | DevOps | Tuần 7 | 🟢 Hoàn thành (100%) | High |

---

## 🎯 TAB 3: MA TRẬN YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS MATRIX)

### 👥 1. Nhóm Chức Năng Khách Hàng (Customer / Guest Features):
* **F-C01 [Tìm kiếm toàn quốc]:** Tìm kiếm phòng theo địa điểm 63 tỉnh thành (Đà Nẵng, Phú Quốc, Đà Lạt, Nha Trang, Sapa,...), chọn ngày Check-in/Check-out & số lượng khách.
* **F-C02 [Bộ lọc đa tiêu chí]:** Lọc theo khoảng giá tiền, hạng phòng (Standard, Deluxe, Suite, Villa) và sắp xếp giá tăng/giảm.
* **F-C03 [Chi tiết phòng & Tiện nghi]:** Xem nhiều ảnh gallery, thông số $m^2$, số giường, vị trí bãi biển, chính sách hủy phòng.
* **F-C04 [Đánh giá & Bình luận]:** Đọc đánh giá từ khách thực tế và gửi bình luận đánh giá sao trực tiếp.
* **F-C05 [Thanh toán mô phỏng QR Code]:** Thanh toán qua mã QR VNPay, MoMo, Thẻ Visa/Mastercard hoặc Tiền mặt.
* **F-C06 [E-Voucher QR Code]:** Nhận mã vé điện tử QR Code để xuất trình khi làm thủ tục nhận phòng tại lễ tân.
* **F-C07 [Hủy đơn trực tuyến]:** Hủy đơn hàng chủ động trong trang cá nhân theo quy định.

### 🛡️ 2. Nhóm Chức Năng Quản Trị Viên (Admin Features):
* **F-A01 [Thống kê Doanh thu Real-time]:** Báo cáo tổng doanh số thực tế, doanh số chờ duyệt, tỷ lệ lấp đầy phòng (Occupancy Rate %) & doanh thu theo phương thức thanh toán.
* **F-A02 [Đặt phòng tại quầy Walk-in]:** Tạo đơn trực tiếp cho khách vãng lai nhận phòng ngay tại lễ tân mà khách không cần đăng ký tài khoản.
* **F-A03 [Theo dõi Trạng thái Phòng]:** Phân loại trực quan 🟢 Phòng Trống vs 🔴 Đã Có Khách Thuê (Hiển thị Tên khách, SĐT & thời gian lưu trú hiện tại).
* **F-A04 [Bật/Tắt Bảo trì phòng]:** Chuyển trạng thái phòng nhanh giữa *Cho thuê* và *Bảo trì*.
* **F-A05 [Quản lý Mã Khách Hàng]:** Tra cứu Mã KH (`usr_...`), tổng tiền chi tiêu và xem danh sách các phòng từng khách đã thuê.
* **F-A06 [Xuất Báo Cáo CSV/Excel]:** Tải dữ liệu toàn bộ đơn hàng và doanh số ra file `.csv` lưu trữ.
* **F-A07 [Tìm kiếm toàn cục (Global Search)]:** Tìm nhanh theo số phòng (`101`, `102`), tên khách, SĐT, mã đơn.

---

## 💾 TAB 4: CSDL & DANH SÁCH RESTFUL API ENDPOINTS (DB & API DOCS)

### 🗄️ 1. Cấu Trúc Bảng Dữ Liệu SQLite (6 Bảng):
1. **`users`:** `id (PK)`, `name`, `email (UK)`, `password (bcrypt)`, `role (ADMIN/CUSTOMER)`, `phone`, `created_at`.
2. **`room_types`:** `id (PK)`, `name`, `description`.
3. **`rooms`:** `id (PK)`, `room_number (UK)`, `room_type_id (FK)`, `name`, `description`, `price_per_night`, `capacity`, `bed_count`, `size_sqm`, `location`, `hotel_name`, `images (JSON)`, `amenities (JSON)`, `is_available`, `rating`, `review_count`.
4. **`bookings`:** `id (PK)`, `user_id (FK)`, `room_id (FK)`, `check_in`, `check_out`, `guest_count`, `total_price`, `status`, `guest_name`, `guest_email`, `guest_phone`, `special_requests`, `created_at`.
5. **`payments`:** `id (PK)`, `booking_id (FK)`, `method`, `transaction_id`, `amount`, `status`, `paid_at`.
6. **`reviews`:** `id (PK)`, `user_id (FK)`, `room_id (FK)`, `user_name`, `rating`, `comment`, `created_at`.

### 🔌 2. Danh Sách RESTful API Endpoints:

| Phương Thức (Method) | Đường Dẫn API (Endpoint) | Quyền Truy Cập | Chức Năng |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản khách hàng mới |
| `POST` | `/api/auth/login` | Public | Đăng nhập hệ thống (Bảo vệ bởi Rate-Limit 5 lần/15p) |
| `GET` | `/api/rooms` | Public | Lấy danh sách tất cả phòng & lọc theo địa điểm/giá |
| `GET` | `/api/rooms/:id` | Public | Lấy thông tin chi tiết 1 phòng & các đánh giá |
| `POST` | `/api/bookings` | Customer / Admin | Tạo đơn đặt phòng mới |
| `GET` | `/api/bookings/my-bookings` | Customer | Lấy danh sách đơn đặt phòng cá nhân |
| `PUT` | `/api/bookings/:id/cancel` | Customer | Hủy đơn đặt phòng |
| `POST` | `/api/reviews` | Customer | Gửi bình luận & chấm điểm sao cho phòng |
| `GET` | `/api/admin/stats` | **Admin Only** | Lấy thống kê tổng quan doanh thu & tỷ lệ phòng |
| `GET` | `/api/admin/rooms` | **Admin Only** | Lấy trạng thái phòng trống/thuê kèm thông tin khách |
| `GET` | `/api/admin/customers` | **Admin Only** | Lấy danh sách mã KH (`usr_...`) & phòng đã thuê |
| `POST` | `/api/admin/bookings/walk-in` | **Admin Only** | Tạo đơn đặt phòng trực tiếp tại quầy cho khách vãng lai |
| `PUT` | `/api/admin/rooms/:id/toggle-maintenance` | **Admin Only** | Bật/Tắt trạng thái phòng bảo trì |
| `PUT` | `/api/admin/bookings/:id/status` | **Admin Only** | Cập nhật trạng thái đơn hàng (`CONFIRMED`, `CANCELLED`) |

---

## 🧪 TAB 5: BẢNG KỊCH BẢN KIỂM THỬ HỆ THỐNG (SYSTEM TEST CASE MATRIX)

| Mã Test Case | Tên Kịch Bản Kiểm Thử | Các Bước Thực Hiện | Kết Quả Kỳ Vọng | Kết Quả Thực Tế | Trạng Thái |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Kiểm thử Đăng nhập sai quá 5 lần | Nhập sai mật khẩu Admin 5 lần liên tiếp trong 15 phút | Hệ thống chặn IP và thông báo khóa tạm thời 15 phút | Trả về lỗi 429 Too Many Requests kèm thông báo khóa | 🟢 PASS |
| **TC-02** | Kiểm thử Truy cập Admin không có Token | Mở URL `/admin` hoặc gọi API `/api/admin/stats` bằng tài khoản Customer | Hệ thống chặn và trả về lỗi từ chối truy cập | Trả về lỗi 403 Forbidden | 🟢 PASS |
| **TC-03** | Kiểm thử Đặt phòng & Tạo mã QR | Chọn ngày Check-in/out ➔ Chọn thanh toán VNPay QR | Hệ thống tính đúng tiền và hiển thị mã QR kèm E-Voucher | Tạo đơn thành công, hiển thị QR & E-Voucher | 🟢 PASS |
| **TC-04** | Kiểm thử Đặt phòng tại quầy (Walk-in) | Admin nhấn `➕ Đặt Phòng Tại Quầy` ➔ Nhập tên khách & phòng | Tạo đơn `CONFIRMED` lập tức mà khách không cần tài khoản | Đơn hàng cập nhật thành công vào CSDL | 🟢 PASS |
| **TC-05** | Kiểm thử Xuất Báo Cáo CSV | Admin nhấn `📥 Xuất Báo Cáo CSV` trong Dashboard | Trình duyệt tự động tải file `.csv` dữ liệu doanh thu | Tải file `VnStay_BaoCaoDoanhThu.csv` mở tốt bằng Excel | 🟢 PASS |
