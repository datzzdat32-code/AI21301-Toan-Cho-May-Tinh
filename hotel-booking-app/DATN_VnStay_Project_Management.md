# 📊 BẢNG QUẢN LÝ ĐỒ ÁN TỐT NGHIỆP / DỰ ÁN (PROJECT MANAGEMENT MATRIX - COMPREHENSIVE EDITION)
## 🏨 ĐỀ TÀI: XÂY DỰNG HỆ THỐNG WEBSITE ĐẶT PHÒNG KHÁCH SẠN VÀ RESORT TRỰC TUYẾN TOÀN QUỐC (VNSTAY.VN)

---

## 📋 MỤC LỤC TÀI LIỆU QUẢN LÝ DỰ ÁN CHUYÊN SÂU
1. **TAB 1:** TỔNG QUAN ĐỀ TÀI & BÁO CÁO CÔNG NGHỆ CHUYÊN SÂU (PROJECT OVERVIEW & TECH SPECIFICATIONS)
2. **TAB 2:** MA TRẬN PHÂN CÔNG NHIỆM VỤ & TIẾN ĐỘ THI CÔNG CHI TIẾT (GRANULAR WBS & PROGRESS TRACKER)
3. **TAB 3:** MA TRẬN YÊU CẦU CHỨC NĂNG & PHI CHỨC NĂNG (FUNCTIONAL & NON-FUNCTIONAL REQUIREMENTS MATRIX)
4. **TAB 4:** BẢNG THIẾT KẾ CƠ SỞ DỮ LIỆU CHI TIẾT & API DOCUMENTATION (FULL DB SCHEMA & RESTFUL API SPECIFICATIONS)
5. **TAB 5:** MA TRẬN KỊCH BẢN KIỂM THỬ HỆ THỐNG CHI TIẾT (COMPREHENSIVE TEST CASE MATRIX)

---

## 📌 TAB 1: TỔNG QUAN ĐỀ TÀI & BÁO CÁO CÔNG NGHỆ CHUYÊN SÂU (PROJECT OVERVIEW)

### 1.1 Thông Tin Chung Về Đồ Án
* **Tên đề tài:** Xây dựng Hệ thống Website Đặt Phòng Khách Sạn & Resort Trực Tuyến Toàn Quốc (`VnStay.vn`)
* **Mã học phần / Lĩnh vực:** Đồ án Tốt nghiệp / Chuyên ngành Công nghệ Thông tin (Phát triển Ứng dụng Web Fullstack)
* **Mô hình kiến trúc:** Client - Server RESTful Architecture (Tách biệt hoàn toàn Giao diện Frontend và Máy chủ Backend)
* **Định hướng thiết kế (UI/UX Strategy):** Phong cách Trắng & Xanh Đại Dương (`#0284c7` / `#003580`) lấy cảm hứng từ các sàn thương mại du lịch hàng đầu Việt Nam (Traveloka, Agoda, Booking.com, Vntrip).

### 1.2 Đặt Vấn Đề & Mục Tiêu Dự Án
* **Tính cấp thiết:** Nhu cầu du lịch nội địa gia tăng mạnh mẽ đòi hỏi các nền tảng đặt phòng trực tuyến phải có giao diện thân thiện, minh bạch chi phí (đã gồm Thuế & Phí), xác nhận phòng tức thì trong 30 giây qua mã E-Voucher QR Code và tốc độ truy vấn mượt mà.
* **Mục tiêu sản phẩm:** 
  * Xây dựng giao diện Khách hàng đặt phòng tiện lợi với bộ lọc 63 tỉnh thành Việt Nam, cổng thanh toán mô phỏng QR (VNPay/MoMo/Visa), tra cứu E-Voucher QR Code và gửi đánh giá thực tế.
  * Xây dựng Dashboard Quản trị viên (Admin) mạnh mẽ hỗ trợ thống kê doanh thu theo kênh, tạo đơn đặt phòng tại quầy (Walk-in), theo dõi trạng thái 🟢 Phòng Trống / 🔴 Đã Thuê, quản lý Mã KH (`usr_...`) và xuất báo cáo CSV/Excel.
  * Đảm bảo tính an toàn dữ liệu bằng bảo mật đa lớp (Bcrypt băm mật khẩu, JWT 256-bit, Helmet HTTP headers, Rate-limit chống Brute-force, DB-backed RBAC).

### 1.3 Cấu Hình Công Nghệ Chi Tiết (Tech Stack Specifications)

#### A. Frontend Technology Stack (Giao Diện Người Dùng & Admin)
* **Core Library:** `React 19.2.8` (Thư viện UI dựng ứng dụng Single Page Application - SPA).
* **Routing:** `React Router DOM v7.18.4` (Điều hướng trang mượt mà không cần nạp lại trang).
* **Styling Framework:** `Tailwind CSS v4.3.3` + `@tailwindcss/vite` (Hệ thống CSS tiện ích tùy biến màu sắc Trắng - Xanh chuẩn du lịch).
* **Icon Set:** `Lucide React v1.48.0` (Bộ biểu tượng trực quan: Search, Calendar, Star, Building, ShieldCheck, Users,...).
* **HTTP Client:** `Axios v1.20.0` (Thư viện xử lý yêu cầu HTTP API tới Backend).
* **Build Tool:** `Vite v8.3.0` (Công cụ đóng gói module tốc độ cao).

#### B. Backend Technology Stack (Máy Chủ API & Xử Lý Nghiệp Vụ)
* **Runtime Environment:** `Node.js` (Môi trường thực thi JavaScript phía Server).
* **Web Framework:** `Express.js v5.2.1` (Framework xây dựng các đường dẫn RESTful API).
* **Database Engine:** `SQLite3 v6.0.1` (Hệ quản trị cơ sở dữ liệu quan hệ nhúng độc lập, lưu tại `backend/hotel.db`).
* **Authentication & Authorization:** `JsonWebToken (JWT) v9.0.3` (Mã định danh xác thực phiên làm việc 24h với khóa Secret 256-bit).
* **Password Hashing:** `Bcrypt.js v3.0.3` (Mã hóa băm mật khẩu chuẩn Salt round 10).
* **Security Headers:** `Helmet v8.3.0` (Bảo vệ HTTP Security Headers chống XSS, Clickjacking, MIME-Sniffing).
* **Rate Limiting:** `Express-Rate-Limit v8.7.0` (Giới hạn 5 lần thử đăng nhập/15 phút chống tấn công Brute-force).
* **CORS:** `Cors v2.8.6` (Cấu hình truy cập chéo tên miền cho phép Frontend kết nối API).

---

## 📅 TAB 2: MA TRẬN PHÂN CÔNG NHIỆM VỤ & TIẾN ĐỘ THI CÔNG CHI TIẾT (GRANULAR WBS)

| Mã WBS | Giai Đoạn (Phase) | Hạng Mục Công Việc Chi Tiết (Task Description) | Người Thực Hiện | Ngày Bắt Đầu | Ngày Hoàn Thành | Sản Phẩm Đầu Ra (Deliverables) | Trạng Thái | Mức Ưu Tiên |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- | :---: | :---: |
| **P1** | **KHẢO SÁT & THIẾT KẾ** | | | | | | | |
| WBS 1.1 | Nghiên cứu OTA | Khảo sát UX/UI & tính năng từ Traveloka, Agoda, Booking.com, Vntrip | PM / UI Lead | 01/08/2026 | 05/08/2026 | Tài liệu Phân tích Yêu cầu | 🟢 100% | High |
| WBS 1.2 | Thiết kế CSDL | Định nghĩa 6 bảng dữ liệu SQLite (`users`, `room_types`, `rooms`, `bookings`, `payments`, `reviews`) | DB Dev | 06/08/2026 | 10/08/2026 | File `backend/database.js` | 🟢 100% | High |
| WBS 1.3 | Vẽ sơ đồ ERD | Xây dựng sơ đồ DBML & ERD trực quan đưa lên `dbdiagram.io` | DB Dev | 11/08/2026 | 14/08/2026 | Sơ đồ ERD & Mã DBML | 🟢 100% | High |
| **P2** | **PHÁT TRIỂN BACKEND** | | | | | | | |
| WBS 2.1 | Khởi tạo Server | Dựng cấu trúc Node.js/Express Server Cổng 5000 kết nối SQLite `hotel.db` | Backend Dev | 15/08/2026 | 18/08/2026 | Server cơ sở (`server.js`) | 🟢 100% | High |
| WBS 2.2 | API Đăng ký/Đăng nhập | Viết API `/api/auth/register` và `/api/auth/login` với Bcrypt & JWT | Backend Dev | 19/08/2026 | 22/08/2026 | Auth Router | 🟢 100% | High |
| WBS 2.3 | API Khách sạn & Bộ lọc | Viết API `/api/rooms` hỗ trợ tìm kiếm 63 tỉnh thành, sắp xếp & chi tiết phòng | Backend Dev | 23/08/2026 | 26/08/2026 | Rooms Router | 🟢 100% | High |
| WBS 2.4 | API Đặt phòng & QR | Viết API `/api/bookings`, tạo giao dịch mô phỏng QR & API hủy phòng | Backend Dev | 27/08/2026 | 30/08/2026 | Bookings & Payments Router | 🟢 100% | High |
| WBS 2.5 | API Admin Dashboard | Viết các API `/api/admin/*` (Stats, Rooms, Customers, Bookings, Walk-in, Toggle) | Backend Dev | 31/08/2026 | 04/09/2026 | Admin Router | 🟢 100% | High |
| WBS 2.6 | Bảo mật đa lớp | Cấu hình Helmet, Rate-Limit 5 lần/15p & Middleware RBAC `requireAdmin` | Security Dev | 05/09/2026 | 08/09/2026 | Security Middlewares | 🟢 100% | High |
| **P3** | **PHÁT TRIỂN FRONTEND** | | | | | | | |
| WBS 3.1 | Setup UI Framework | Cấu hình React 19 + Tailwind CSS Trắng - Xanh & Auth Context | Frontend Dev | 09/09/2026 | 12/09/2026 | Base Frontend Scaffold | 🟢 100% | High |
| WBS 3.2 | Dựng Trang Chủ | Dựng Hero Search 63 tỉnh thành, Promo Vouchers, Reviews Carousel, Trust Badges | Frontend Dev | 13/09/2026 | 16/09/2026 | Page `HomePage.jsx` | 🟢 100% | High |
| WBS 3.3 | Dựng Trang Danh Sách | Dựng Sidebar bộ lọc (Địa điểm, giá, hạng phòng) & RoomCard với tag du lịch | Frontend Dev | 17/09/2026 | 20/09/2026 | Page `RoomsPage.jsx` | 🟢 100% | High |
| WBS 3.4 | Dựng Trang Chi Tiết | Dựng Gallery ảnh carousel, thông số phòng, tiện nghi, chính sách & Review Form | Frontend Dev | 21/09/2026 | 23/09/2026 | Page `RoomDetailPage.jsx` | 🟢 100% | High |
| WBS 3.5 | Dựng Trang Checkout | Dựng Form giữ phòng & Modal quét mã QR VNPay/MoMo/Visa mô phỏng | Frontend Dev | 24/09/2026 | 26/09/2026 | Page `CheckoutPage.jsx` & `PaymentModal.jsx` | 🟢 100% | High |
| WBS 3.6 | Dựng Trang Đơn Của Tôi | Dựng danh sách đơn hàng, xem mã E-Voucher QR Code & nút Hủy phòng | Frontend Dev | 27/09/2026 | 28/09/2026 | Page `MyBookingsPage.jsx` | 🟢 100% | High |
| WBS 3.7 | Dựng Dashboard Admin | Dựng 5 Tab Admin: Doanh thu, Walk-in booking, Trạng thái phòng, KH, CSV export | Frontend Dev | 29/09/2026 | 30/09/2026 | Page `AdminDashboardPage.jsx` | 🟢 100% | High |
| **P4** | **TỐI ƯU, TEST & BÁO CÁO**| | | | | | | |
| WBS 4.1 | Tối ưu UI/UX | Tối ưu ngữ liệu tiếng Việt du lịch thực tế, loại bỏ cảm giác AI | UI Lead | 01/10/2026 | 01/10/2026 | Polish UI Components | 🟢 100% | Medium |
| WBS 4.2 | Test bảo mật & API | Kiểm thử Brute-force login, test phân quyền Admin & Walk-in booking | Tester | 01/10/2026 | 01/10/2026 | Test Case Execution Report | 🟢 100% | High |
| WBS 4.3 | Đẩy GitHub & Viết Doc | Đẩy mã nguồn lên GitHub Repo & lập Bảng Quản lý Dự án DATN | DevOps / PM | 01/10/2026 | 01/10/2026 | GitHub Repository & Doc | 🟢 100% | High |

---

## 🎯 TAB 3: MA TRẬN YÊU CẦU CHỨC NĂNG & PHI CHỨC NĂNG (REQUIREMENTS MATRIX)

### 3.1 Ma Trận Yêu Cầu Chức Năng Phía Khách Hàng (Customer Requirements)

| Mã Yêu Cầu | Tên Chức Năng | Mô Tả Chi Tiết Kỹ Thuật | Tiêu Chí Nghiệm Thu (Acceptance Criteria) |
| :---: | :--- | :--- | :--- |
| **F-C01** | Tìm kiếm địa điểm toàn quốc | Cho phép tìm kiếm phòng theo 63 tỉnh thành Việt Nam (Đà Nẵng, Phú Quốc, Đà Lạt, Nha Trang, Sapa, Vũng Tàu, Hà Nội, TP.HCM), ngày nhận/trả và số khách. | Trả về đúng danh sách phòng theo địa điểm được chọn. |
| **F-C02** | Bộ lọc phòng đa tiêu chí | Lọc phòng theo hạng phòng (Standard, Deluxe, Suite, Villa), khoảng giá tiền và sắp xếp giá tăng/giảm. | Danh sách tự động cập nhật ngay khi thay đổi điều kiện lọc. |
| **F-C03** | Thẻ phòng chuẩn du lịch | Hiển thị điểm số 10 (VD: 9.4/10), giá cũ bị gạch, giá giảm, tag *"Miễn phí hủy phòng"*, *"Bao gồm ăn sáng"*, *"🔥 Còn 2 phòng"*. | Đầy đủ các huy hiệu thương mại du lịch thực tế. |
| **F-C04** | Chi tiết phòng & Gallery | Xem thư viện ảnh carousel, diện tích $m^2$, số giường, vị trí bãi biển & quy định nhận/trả phòng. | Hiển thị ảnh sắc nét, cho phép chuyển đổi ảnh mượt mà. |
| **F-C05** | Đánh giá & Bình luận | Đọc đánh giá từ khách thực tế và gửi nhận xét kèm chấm điểm sao ($1 \rightarrow 5$ sao). | Đánh giá mới lập tức cập nhật vào danh sách và tính lại trung bình sao. |
| **F-C06** | Giữ phòng & Áp mã giảm giá | Tính tổng số đêm, tổng tiền phòng tự động, nhập mã giảm giá (`VNSTAY2026`, `SUMMERFUN`). | Trừ đúng số tiền chiết khấu của voucher vào hóa đơn. |
| **F-C07** | Cổng thanh toán QR mô phỏng | Hiển thị mã QR VNPay / MoMo / Thẻ Visa / Tiền mặt kèm đồng hồ đếm ngược 15 phút. | Mã QR sinh động, đếm ngược chính xác. |
| **F-C08** | Vé điện tử E-Voucher QR | Tạo mã E-Voucher dạng mã QR duy nhất cho từng đơn hàng thành công. | Khách xem được mã QR vé điện tử tại trang *Đơn Của Tôi*. |
| **F-C09** | Hủy đơn trực tuyến | Cho phép khách hàng thực hiện hủy đơn đặt phòng trong trang cá nhân. | Trạng thái đơn cập nhật thành `CANCELLED`. |
| **F-C10** | Đăng ký / Đăng nhập | Tạo tài khoản khách mới hoặc đăng nhập tài khoản hiện có với JWT Token. | Đăng nhập thành công lưu phiên 24h. |

### 3.2 Ma Trận Yêu Cầu Chức Năng Phía Quản Trị Viên (Admin Requirements)

| Mã Yêu Cầu | Tên Chức Năng | Mô Tả Chi Tiết Kỹ Thuật | Tiêu Chí Nghiệm Thu (Acceptance Criteria) |
| :---: | :--- | :--- | :--- |
| **F-A01** | Thống kê doanh thu Real-time | Báo cáo tổng doanh thu thực tế, doanh thu chờ duyệt, tỷ lệ lấp đầy phòng (%) & phân tích theo kênh thanh toán. | Thống kê chính xác từ CSDL SQLite. |
| **F-A02** | Đặt phòng tại quầy Walk-in | Cho phép lễ tân tạo đơn trực tiếp cho khách vãng lai nhận phòng ngay mà không cần tài khoản trực tuyến. | Đơn tạo thành công với trạng thái `CONFIRMED` & phương thức thanh toán. |
| **F-A03** | Theo dõi trạng thái phòng | Phân loại trực quan 🟢 Phòng Trống vs 🔴 Đã Thuê (Hiển thị Tên khách, SĐT và khoảng thời gian lưu trú). | Cập nhật chính xác theo các đơn hàng active. |
| **F-A04** | Bật/Tắt bảo trì phòng | Nút chuyển đổi nhanh trạng thái phòng giữa *Sẵn sàng đón khách* và *Đang bảo trì*. | Cập nhật giá trị `is_available` trong CSDL. |
| **F-A05** | Quản lý Mã Khách Hàng | Tra cứu Mã KH (`usr_...`), tổng tiền chi tiêu tích lũy và danh sách các phòng từng khách đã thuê. | Hiển thị bảng khách hàng kèm modal xem chi tiết. |
| **F-A06** | Quản lý đơn đặt phòng | Xem toàn bộ danh sách đơn đặt, chuyển trạng thái duyệt đơn (`CONFIRMED`) hoặc hủy đơn (`CANCELLED`). | Cập nhật trạng thái tức thì. |
| **F-A07** | Xuất báo cáo CSV/Excel | Tải toàn bộ dữ liệu đơn hàng và doanh số ra file `.csv` lưu trữ trên máy tính. | Tải file `VnStay_BaoCaoDoanhThu.csv` mở được bằng Excel. |
| **F-A08** | Thêm phòng mới (CRUD) | Form tạo phòng mới: số phòng, hạng phòng, tên phòng, giá/đêm, tiện nghi, hình ảnh. | Kiểm tra trùng số phòng và lưu vào CSDL. |
| **F-A09** | Xóa phòng khỏi hệ thống | Loại bỏ phòng không còn kinh doanh khỏi CSDL. | Xóa phòng khỏi CSDL thành công. |
| **F-A10** | Tìm kiếm toàn cục Admin | Ô tìm kiếm nhanh theo số phòng (`101`), Mã KH (`usr_...`), SĐT, Tên khách hoặc Mã đơn. | Kết quả lọc mượt mà theo từ khóa. |

### 3.3 Yêu Cầu Phi Chức Năng (Non-Functional Requirements - NFR)

1. **Bảo Mật (Security):**
   * Mật khẩu băm `bcrypt` salt round 10. Token xác thực JWT 256-bit hết hạn sau 24h.
   * `express-rate-limit` giới hạn tối đa 5 lần thử đăng nhập/15 phút trên mỗi IP để ngăn chặn dò mật khẩu.
   * `requireAdmin` kiểm tra trực tiếp quyền Admin từ SQLite DB (chống giả mạo role phía Client).
   * HTTP Security Headers chuẩn hóa bởi `Helmet.js`.
2. **Hiệu Năng (Performance):**
   * Thời gian phản hồi API Backend $< 200ms$.
   * Đóng gói Frontend gọn nhẹ với Vite ($< 500KB$ gzipped).
3. **Tính Tương Thích & Giao Diện (Usability & Compatibility):**
   * Giao diện Responsive 100% hiển thị tốt trên Điện thoại (Mobile), Máy tính bảng (Tablet) và Máy tính (Desktop).
   * Hỗ trợ tốt trên các trình duyệt hiện đại: Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari.

---

## 💾 TAB 4: BẢNG THIẾT KẾ CƠ SỞ DỮ LIỆU CHI TIẾT & API SPECIFICATIONS

### 4.1 Bảng Thiết Kế CSDL SQLite (6 Bảng Thực Thể)

#### 1. Bảng `users` (Quản Lý Tài Khoản)
| Tên Trường (Field) | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Mã định danh người dùng (`usr_admin`, `usr_cust_01`) |
| `name` | TEXT | NOT NULL | Họ và tên |
| `email` | TEXT | UNIQUE, NOT NULL | Địa chỉ email đăng nhập |
| `password` | TEXT | NOT NULL | Mật khẩu băm Bcrypt salt 10 |
| `role` | TEXT | NOT NULL DEFAULT 'CUSTOMER' | Vai trò (`ADMIN` hoặc `CUSTOMER`) |
| `phone` | TEXT | NULLABLE | Số điện thoại |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Ngày giờ tạo tài khoản |

#### 2. Bảng `room_types` (Phân Loại Hạng Phòng)
| Tên Trường (Field) | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Mã loại phòng (`rt_standard`, `rt_deluxe`, `rt_suite`, `rt_villa`) |
| `name` | TEXT | NOT NULL | Tên loại phòng |
| `description` | TEXT | NULLABLE | Mô tả đặc điểm loại phòng |

#### 3. Bảng `rooms` (Quản Lý Phòng & Khách Sạn)
| Tên Trường (Field) | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Mã phòng (`rm_101`, `rm_201`) |
| `room_number` | TEXT | UNIQUE, NOT NULL | Số phòng thực tế (`101`, `102`, `201`) |
| `room_type_id` | TEXT | FK -> `room_types(id)` | Khóa ngoại trỏ tới bảng hạng phòng |
| `name` | TEXT | NOT NULL | Tên phòng đầy đủ |
| `hotel_name` | TEXT | NOT NULL | Tên Khách sạn / Resort chủ quản |
| `location` | TEXT | NOT NULL DEFAULT 'Phú Quốc' | Tỉnh thành du lịch (Đà Nẵng, Phú Quốc,...) |
| `description` | TEXT | NOT NULL | Mô tả chi tiết không gian phòng |
| `price_per_night` | REAL | NOT NULL | Giá thuê 1 đêm (VNĐ) |
| `capacity` | INTEGER | NOT NULL | Số lượng khách tối đa |
| `bed_count` | INTEGER | NOT NULL | Số lượng giường |
| `size_sqm` | INTEGER | NOT NULL | Diện tích phòng ($m^2$) |
| `images` | TEXT | NOT NULL | Chuỗi JSON chứa danh sách URL ảnh |
| `amenities` | TEXT | NOT NULL | Chuỗi JSON chứa danh sách tiện nghi |
| `is_available` | BOOLEAN | DEFAULT 1 | Trạng thái (1 = Cho thuê, 0 = Bảo trì) |
| `rating` | REAL | DEFAULT 4.8 | Điểm trung bình đánh giá ($1.0 \rightarrow 5.0$) |
| `review_count` | INTEGER | DEFAULT 0 | Tổng số lượt đánh giá |

#### 4. Bảng `bookings` (Quản Lý Đơn Đặt Phòng)
| Tên Trường (Field) | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Mã đơn đặt phòng (`bk_...`, `bk_walkin_...`) |
| `user_id` | TEXT | FK -> `users(id)` | Khóa ngoại trỏ tới khách đặt |
| `room_id` | TEXT | FK -> `rooms(id)` | Khóa ngoại trỏ tới phòng được đặt |
| `check_in` | TEXT | NOT NULL | Ngày nhận phòng (`YYYY-MM-DD`) |
| `check_out` | TEXT | NOT NULL | Ngày trả phòng (`YYYY-MM-DD`) |
| `guest_count` | INTEGER | NOT NULL | Số lượng khách ở |
| `total_price` | REAL | NOT NULL | Tổng giá tiền đơn hàng (VNĐ) |
| `status` | TEXT | NOT NULL DEFAULT 'PENDING' | Trạng thái (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`) |
| `guest_name` | TEXT | NOT NULL | Tên người ở thực tế |
| `guest_email` | TEXT | NOT NULL | Email người ở |
| `guest_phone` | TEXT | NOT NULL | Số điện thoại người ở |
| `special_requests` | TEXT | NULLABLE | Yêu cầu đặc biệt |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Ngày giờ tạo đơn |

#### 5. Bảng `payments` (Quản Lý Giao Dịch Thanh Toán)
| Tên Trường (Field) | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Mã giao dịch (`pay_...`) |
| `booking_id` | TEXT | FK -> `bookings(id)` | Khóa ngoại trỏ tới đơn đặt phòng |
| `method` | TEXT | NOT NULL | Phương thức (`VNPAY`, `MOMO`, `CARD`, `CASH`) |
| `transaction_id` | TEXT | NULLABLE | Mã giao dịch ngân hàng / cổng thanh toán |
| `amount` | REAL | NOT NULL | Số tiền thanh toán |
| `status` | TEXT | NOT NULL DEFAULT 'PENDING' | Trạng thái (`PENDING`, `SUCCESS`, `FAILED`) |
| `paid_at` | DATETIME | NULLABLE | Ngày giờ thanh toán thành công |

#### 6. Bảng `reviews` (Đánh Giá & Phản Hồi)
| Tên Trường (Field) | Kiểu Dữ Liệu | Ràng Buộc (Constraints) | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Mã bình luận đánh giá (`rev_...`) |
| `user_id` | TEXT | FK -> `users(id)` | Khóa ngoại trỏ tới người viết |
| `room_id` | TEXT | FK -> `rooms(id)` | Khóa ngoại trỏ tới phòng |
| `user_name` | TEXT | NOT NULL | Tên hiển thị người đánh giá |
| `rating` | INTEGER | NOT NULL | Điểm sao ($1 \rightarrow 5$) |
| `comment` | TEXT | NOT NULL | Nội dung bình luận |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Ngày giờ viết đánh giá |

---

### 4.2 Danh Sách Chi Tiết 16 RESTful API Endpoints

| Phương Thức | Đường Dẫn API | Phân Quyền | Request Body / Query | Output Mã Lỗi & Trạng Thái | Mô Tả Chức Năng |
| :---: | :--- | :---: | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `{ name, email, password, phone }` | 201 Created, 400 Bad Request | Đăng ký tài khoản khách hàng mới |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | 200 OK, 400 Bad Request, 429 Too Many | Đăng nhập (Bảo vệ bởi Rate Limiter 5 lần/15p) |
| `GET` | `/api/rooms` | Public | Query: `location, capacity, minPrice, maxPrice` | 200 OK, 500 Server Error | Lấy danh sách tất cả phòng & lọc theo điều kiện |
| `GET` | `/api/rooms/:id` | Public | URL Param: `id` | 200 OK, 404 Not Found | Lấy thông tin chi tiết 1 phòng kèm đánh giá |
| `POST` | `/api/bookings` | Customer | `{ roomId, checkIn, checkOut, guestCount, totalPrice, guestName,... }` | 201 Created, 401 Unauthorized | Tạo đơn đặt phòng mới |
| `GET` | `/api/bookings/my-bookings` | Customer | Header: `Authorization Bearer <token>` | 200 OK, 401 Unauthorized | Lấy danh sách đơn hàng cá nhân & xem QR E-Voucher |
| `PUT` | `/api/bookings/:id/cancel` | Customer | URL Param: `id` | 200 OK, 400 Bad Request | Hủy đơn đặt phòng cá nhân |
| `POST` | `/api/reviews` | Customer | `{ roomId, rating, comment }` | 201 Created, 400 Bad Request | Gửi đánh giá sao & bình luận cho phòng |
| `GET` | `/api/admin/stats` | **Admin Only** | Header: `Authorization Bearer <token>` | 200 OK, 403 Forbidden | Lấy thống kê tổng quan doanh thu & tỷ lệ lấp đầy |
| `GET` | `/api/admin/rooms` | **Admin Only** | Header: `Authorization Bearer <token>` | 200 OK, 403 Forbidden | Lấy danh sách phòng kèm trạng thái 🟢 Trống / 🔴 Thuê |
| `GET` | `/api/admin/customers` | **Admin Only** | Header: `Authorization Bearer <token>` | 200 OK, 403 Forbidden | Lấy danh sách Mã KH (`usr_...`), chi tiêu & phòng đã ở |
| `POST` | `/api/admin/bookings/walk-in` | **Admin Only** | `{ room_id, guest_name, guest_phone, check_in, check_out, total_price,... }` | 201 Created, 400 Bad Request | Tạo đơn đặt phòng trực tiếp tại quầy cho khách vãng lai |
| `PUT` | `/api/admin/rooms/:id/toggle-maintenance` | **Admin Only** | URL Param: `id` | 200 OK, 404 Not Found | Bật/Tắt trạng thái bảo trì phòng |
| `PUT` | `/api/admin/bookings/:id/status` | **Admin Only** | `{ status: 'CONFIRMED' \| 'CANCELLED' }` | 200 OK, 500 Server Error | Duyệt đơn hoặc hủy đơn hàng Admin |
| `POST` | `/api/admin/rooms` | **Admin Only** | `{ room_number, name, price_per_night,... }` | 201 Created, 400 Bad Request | Thêm phòng mới vào hệ thống |
| `DELETE` | `/api/admin/rooms/:id` | **Admin Only** | URL Param: `id` | 200 OK, 500 Server Error | Xóa phòng khỏi cơ sở dữ liệu |

---

## 🧪 TAB 5: MA TRẬN KỊCH BẢN KIỂM THỬ HỆ THỐNG CHI TIẾT (COMPREHENSIVE TEST CASES)

| Mã TC | Tên Kịch Bản Kiểm Thử | Điều Kiện Tiền Đề (Pre-conditions) | Dữ Liệu Đầu Vào (Input Data) | Các Bước Thực Hiện (Test Steps) | Kết Quả Kỳ Vọng (Expected Result) | Kết Quả Thực Tế (Actual Result) | Mức Độ | Trạng Thái |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-01** | Kiểm thử đăng nhập sai quá 5 lần (Brute-Force Limit) | Máy chủ Backend đang bật `loginLimiter` | Email: `admin@grandhorizon.com`<br>Pass sai: `123456` | 1. Mở trang Đăng nhập<br>2. Nhập email & pass sai 5 lần liên tiếp | Hệ thống trả về lỗi HTTP 429 và thông báo khóa IP tạm thời 15 phút. | Hệ thống hiển thị thông báo khóa IP 15 phút đúng như kỳ vọng. | Critical | 🟢 PASS |
| **TC-02** | Kiểm thử phân quyền truy cập Admin (RBAC Check) | Đăng nhập với tài khoản Khách hàng (`khachhang@gmail.com`) | Token JWT của Customer | 1. Mở đường dẫn `http://localhost:3000/admin`<br>2. Gọi API `/api/admin/stats` | Trả về màn hình *Từ Chối Truy Cập* (403 Forbidden). | Màn hình hiển thị "Truy cập bị từ chối - Yêu cầu quyền Admin". | High | 🟢 PASS |
| **TC-03** | Kiểm thử tìm kiếm phòng theo 63 tỉnh thành | Khách hàng truy cập Trang chủ | Chọn điểm đến: `📍 Đà Nẵng` | 1. Chọn địa điểm Đà Nẵng tại ô tìm kiếm<br>2. Nhấn nút *Tìm Kiếm Khách Sạn* | Chuyển hướng sang `/rooms?location=Đà Nẵng` và hiển thị các phòng tại Đà Nẵng. | Chuyển trang mượt mà, bộ lọc trả về đúng phòng tại Đà Nẵng. | High | 🟢 PASS |
| **TC-04** | Kiểm thử Đặt phòng & Sinh mã QR E-Voucher | Đã đăng nhập tài khoản Khách hàng | Chọn phòng `rm_101`<br>Thanh toán: `VNPay QR` | 1. Chọn ngày Check-in/out<br>2. Nhấn *Đặt Phòng* ➔ Quét mã QR VNPay<br>3. Hoàn tất | Đơn đặt thành công, hiển thị mã E-Voucher QR Code tại trang *Đơn Của Tôi*. | Đơn hàng tạo thành công, mã E-Voucher QR Code hiển thị chính xác. | Critical | 🟢 PASS |
| **TC-05** | Kiểm thử Đặt phòng tại quầy (Walk-in Booking) | Đăng nhập tài khoản Admin | Phòng: `101`<br>Khách: `Nguyễn Văn A`<br>SĐT: `0912345678` | 1. Vào Dashboard Admin<br>2. Nhấn `➕ Đặt Phòng Tại Quầy`<br>3. Điền thông tin & xác nhận | Đơn hàng được tạo thành công với trạng thái `CONFIRMED` mà không cần khách có tài khoản. | Đơn hàng cập nhật vào CSDL, trạng thái phòng chuyển thành 🔴 Đã Thuê. | Critical | 🟢 PASS |
| **TC-06** | Kiểm thử Xuất Báo Cáo Doanh Thu CSV | Đăng nhập tài khoản Admin | Nhấn nút `📥 Xuất Báo Cáo CSV` | 1. Vào Tab Doanh Thu Admin<br>2. Nhấn nút *Xuất Báo Cáo CSV* | Trình duyệt tự động tải xuống file `VnStay_BaoCaoDoanhThu.csv`. | Tải file `.csv` về máy, định dạng UTF-8 mở tốt trên Excel. | High | 🟢 PASS |
| **TC-07** | Kiểm thử Bật/Tắt bảo trì phòng | Đăng nhập tài khoản Admin | Chọn phòng `rm_101` | 1. Vào Tab Quản Lý Phòng<br>2. Nhấn nút chuyển đổi trạng thái | Phòng chuyển trạng thái giữa 🟢 Sẵn sàng và 🔴 Đang bảo trì. | CSDL cập nhật `is_available`, giao diện phản hồi tức thì. | Medium | 🟢 PASS |
| **TC-08** | Kiểm thử Áp dụng Mã Giảm Giá (Voucher) | Khách hàng ở bước Thanh toán | Nhập mã: `VNSTAY2026` | 1. Nhập mã `VNSTAY2026` vào ô Voucher<br>2. Nhấn Áp Dụng | Tổng tiền giảm trực tiếp 200.000 VNĐ vào hóa đơn thanh toán. | Hóa đơn hiển thị đúng tiền được trừ 200.000 VNĐ. | High | 🟢 PASS |
| **TC-09** | Kiểm thử Hủy đơn đặt phòng | Khách hàng có đơn trạng thái `PENDING`/`CONFIRMED` | Đơn hàng `#bk_123` | 1. Vào trang *Đơn Của Tôi*<br>2. Nhấn nút *Hủy Đơn Hàng* | Trạng thái đơn đổi thành `CANCELLED`. | Đơn hàng cập nhật trạng thái bị hủy trong CSDL. | High | 🟢 PASS |
| **TC-10** | Kiểm thử Gửi Đánh Giá Sao & Bình Luận | Khách hàng ở trang Chi tiết phòng | Rating: `5 Sao`<br>Comment: *"Phòng tuyệt vời"* | 1. Nhập bình luận & chọn 5 sao<br>2. Nhấn *Gửi Đánh Giá* | Bình luận mới hiển thị trong danh sách và tính lại điểm sao trung bình. | Đánh giá lưu vào CSDL, hiển thị ngay trên giao diện. | Medium | 🟢 PASS |
