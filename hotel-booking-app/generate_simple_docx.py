# -*- coding: utf-8 -*-
import os
import shutil
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def set_cell_background(cell, fill_hex):
    """Gán màu nền cho cell"""
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=80, bottom=80, left=100, right=100):
    """Gán padding cho cell"""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_simple_table_borders(table, color="D1D5DB", sz="4"):
    """Gán viền bảng đơn giản, sạch sẽ"""
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:right w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def format_cell(cell, text, bold=False, italic=False, font_size=10, align=WD_ALIGN_PARAGRAPH.LEFT):
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
    return p

def create_simple_document():
    doc = Document()
    
    # Page Setup - Standard A4 2cm margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(13)
    normal_style.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
    
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
        return p

    def add_p(text, bold_prefix="", italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.line_spacing = 1.25
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.font.name = 'Times New Roman'
            run_b.font.size = Pt(13)
            run_b.font.bold = True
        run_t = p.add_run(text)
        run_t.font.name = 'Times New Roman'
        run_t.font.size = Pt(13)
        run_t.font.italic = italic
        return p

    # ----------------------------------------------------
    # BÌA BÁO CÁO ĐƠN GIẢN
    # ----------------------------------------------------
    p_head = doc.add_paragraph()
    p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_head.paragraph_format.space_after = Pt(4)
    r1 = p_head.add_run("TRƯỜNG CAO ĐẲNG FPT POLYTECHNIC\nKHOA CÔNG NGHỆ THÔNG TIN")
    r1.font.name = 'Times New Roman'
    r1.font.size = Pt(13)
    r1.font.bold = True

    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_line.paragraph_format.space_after = Pt(50)
    r_line = p_line.add_run("----------------***----------------")
    r_line.font.name = 'Times New Roman'
    r_line.font.size = Pt(11)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(12)
    rt1 = p_title.add_run("BÁO CÁO DỰ ÁN MÔN HỌC\n")
    rt1.font.name = 'Times New Roman'
    rt1.font.size = Pt(14)
    rt1.font.bold = True

    rt2 = p_title.add_run("ĐỀ TÀI: XÂY DỰNG WEBSITE ĐẶT PHÒNG KHÁCH SẠN VNSTAY.VN")
    rt2.font.name = 'Times New Roman'
    rt2.font.size = Pt(16)
    rt2.font.bold = True

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(140)
    rsub = p_sub.add_run("Môn học: Quản lý Dự án (AI21301)")
    rsub.font.name = 'Times New Roman'
    rsub.font.size = Pt(12)
    rsub.font.italic = True

    # Info table
    tbl_info = doc.add_table(rows=4, cols=2)
    tbl_info.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_data = [
        ("Giảng viên hướng dẫn:", "ThS. Nguyễn Văn A"),
        ("Sinh viên thực hiện:", "Nguyễn Tiến Đạt"),
        ("Mã sinh viên:", "PH68961"),
        ("Lớp:", "AI21301")
    ]
    for idx, (lbl, val) in enumerate(info_data):
        c1 = tbl_info.cell(idx, 0)
        c2 = tbl_info.cell(idx, 1)
        format_cell(c1, lbl, bold=True, font_size=12)
        format_cell(c2, val, bold=False, font_size=12)
        set_cell_margins(c1, top=40, bottom=40, left=60, right=60)
        set_cell_margins(c2, top=40, bottom=40, left=60, right=60)

    p_foot = doc.add_paragraph()
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_foot.paragraph_format.space_before = Pt(100)
    rf = p_foot.add_run("HÀ NỘI - 2026")
    rf.font.name = 'Times New Roman'
    rf.font.size = Pt(12)
    rf.font.bold = True

    doc.add_page_break()

    # ----------------------------------------------------
    # PHẦN 1: GIỚI THIỆU TỔNG QUAN
    # ----------------------------------------------------
    add_h1("PHẦN 1: GIỚI THIỆU TỔNG QUAN DỰ ÁN")
    
    add_h2("1.1 Lý do chọn đề tài")
    add_p("Nhu cầu tìm kiếm và đặt phòng khách sạn trực tuyến ngày càng phổ biến đối với khách du lịch. Nhằm nâng cao trải nghiệm người dùng và cung cấp công cụ quản lý tiện lợi cho lễ tân khách sạn, dự án được triển khai để xây dựng hệ thống đặt phòng khách sạn VnStay.vn với giao diện đơn giản, trực quan và dễ sử dụng.")

    add_h2("1.2 Mục tiêu của dự án")
    add_p("Khách hàng có thể tìm kiếm phòng theo địa điểm (63 tỉnh thành), lọc giá, xem thông tin phòng, nhập mã giảm giá (Voucher) và nhận mã QR xác nhận đơn đặt.", "• Phía Khách hàng: ")
    add_p("Quản trị viên và lễ tân theo dõi được tổng doanh thu, tạo đơn trực tiếp tại quầy cho khách vãng lai (Walk-in), theo dõi trạng thái phòng trống/đã thuê và xuất báo cáo ra file Excel/CSV.", "• Phía Quản lý: ")

    add_h2("1.3 Công nghệ sử dụng")
    add_p("React (Single Page Application), Vite, Tailwind CSS, Axios.", "• Frontend: ")
    add_p("Node.js, Express.js (RESTful API), Bcrypt (mã hóa mật khẩu), JWT (xác thực đăng nhập), Helmet & Rate-Limit (bảo mật).", "• Backend: ")
    add_p("SQLite3 (lưu trữ 10 bảng dữ liệu quan hệ tại backend/hotel.db).", "• Cơ sở dữ liệu: ")

    # ----------------------------------------------------
    # PHẦN 2: PHÂN CÔNG NHIỆM VỤ VÀ TIẾN ĐỘ
    # ----------------------------------------------------
    add_h1("PHẦN 2: PHÂN CÔNG NHIỆM VỤ VÀ TIẾN ĐỘ THỰC HIỆN")
    add_p("Dưới đây là bảng tổng hợp các công việc đã hoàn thành trong dự án:")

    tbl_tasks = doc.add_table(rows=1, cols=5)
    tbl_tasks.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_simple_table_borders(tbl_tasks)

    headers = ["STT", "Hạng Mục Công Việc", "Người Thực Hiện", "Thời Gian", "Trạng Thái"]
    hdr_cells = tbl_tasks.rows[0].cells
    for i, h in enumerate(headers):
        set_cell_background(hdr_cells[i], "E5E7EB")
        set_cell_margins(hdr_cells[i], top=80, bottom=80, left=60, right=60)
        format_cell(hdr_cells[i], h, bold=True, font_size=10.5, align=WD_ALIGN_PARAGRAPH.CENTER)

    tasks_data = [
        ("1", "Khảo sát tính năng & Phân tích yêu cầu hệ thống", "PM", "01/08 - 05/08", "Hoàn thành"),
        ("2", "Thiết kế cơ sở dữ liệu SQLite 10 bảng", "DB Dev", "06/08 - 14/08", "Hoàn thành"),
        ("3", "Xây dựng máy chủ API Express (Auth, Rooms, Bookings, Vouchers)", "Backend Dev", "15/08 - 04/09", "Hoàn thành"),
        ("4", "Cấu hình bảo mật Bcrypt, JWT, Helmet & Rate-limit", "Backend Dev", "05/09 - 08/09", "Hoàn thành"),
        ("5", "Dựng giao diện Frontend React (Trang chủ, Tìm kiếm, Chi tiết)", "Frontend Dev", "09/09 - 23/09", "Hoàn thành"),
        ("6", "Dựng trang Thanh toán QR & Trang Đơn của tôi", "Frontend Dev", "24/09 - 28/09", "Hoàn thành"),
        ("7", "Dựng Dashboard Admin (Walk-in, Báo cáo doanh thu, Xuất CSV)", "Frontend Dev", "29/09 - 30/09", "Hoàn thành"),
        ("8", "Kiểm thử chức năng, đóng gói & Đẩy mã nguồn lên GitHub", "Tester / PM", "01/10 - 06/10", "Hoàn thành")
    ]

    for idx, row in enumerate(tasks_data):
        row_cells = tbl_tasks.add_row().cells
        bg_color = "F9FAFB" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate(row):
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i], top=60, bottom=60, left=60, right=60)
            align = WD_ALIGN_PARAGRAPH.CENTER if i in [0, 2, 3, 4] else WD_ALIGN_PARAGRAPH.LEFT
            format_cell(row_cells[i], val, font_size=10, align=align)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ----------------------------------------------------
    # PHẦN 3: YÊU CẦU VÀ THIẾT KẾ HỆ THỐNG
    # ----------------------------------------------------
    add_h1("PHẦN 3: YÊU CẦU VÀ THIẾT KẾ HỆ THỐNG")
    
    add_h2("3.1 Chức năng chính")
    add_p("Tìm kiếm phòng theo tỉnh thành, lọc theo giá/hạng phòng, xem chi tiết & tiện nghi, áp mã Voucher giảm giá, tạo đơn đặt & hiển thị mã QR xác nhận.", "• Khách hàng: ")
    add_p("Xem tổng doanh thu, tạo đơn trực tiếp tại quầy (Walk-in), bật/tắt bảo trì phòng, quản lý danh sách khách hàng và xuất file CSV doanh thu.", "• Lễ tân / Admin: ")

    add_h2("3.2 Cơ sở dữ liệu Chuẩn 16 Bảng (DBML / MySQL Architecture)")
    add_p("Hệ thống lưu trữ cơ sở dữ liệu quan hệ gồm 16 bảng thực thể chuẩn hóa:")
    add_p("1. users: Quản lý người dùng (id, full_name, email, password, phone, avatar, role, status).")
    add_p("2. hotels: Thông tin khách sạn (id, name, address, city, phone, email, star_rating, check_in_time, check_out_time, status).")
    add_p("3. hotel_images: Thư viện hình ảnh khách sạn (id, hotel_id, image_url, is_cover).")
    add_p("4. favorites: Danh sách khách sạn yêu thích của người dùng (id, user_id, hotel_id).")
    add_p("5. room_types: Phân loại hạng phòng (id, hotel_id, name, description, area_sqm, max_adults, max_children, bed_type, base_price, quantity, cancellation_policy, status).")
    add_p("6. rooms: Danh mục phòng vật lý (id, room_type_id, room_number, floor_number, status).")
    add_p("7. room_type_images: Hình ảnh chi tiết từng hạng phòng (id, room_type_id, image_url, is_cover).")
    add_p("8. amenities: Danh mục tiện ích (id, name, description, icon, status).")
    add_p("9. hotel_amenities: Tiện ích thuộc về khách sạn (id, hotel_id, amenity_id).")
    add_p("10. room_type_amenities: Tiện ích đi kèm theo từng hạng phòng (id, room_type_id, amenity_id).")
    add_p("11. promotions: Mã ưu đãi và khuyến mại (id, code, description, discount_type, discount_value, min_order_value, start_date, end_date, usage_limit, status).")
    add_p("12. bookings: Đơn đặt phòng (id, user_id, promotion_id, booking_code, check_in_date, check_out_date, total_guests, total_amount, discount_amount, final_amount, booking_status, contact_name, contact_phone, contact_email, special_request).")
    add_p("13. booking_details: Chi tiết phòng trong từng đơn đặt (id, booking_id, room_id, room_type_id, quantity, price_per_night, number_of_nights, subtotal).")
    add_p("14. payments: Giao dịch thanh toán (id, booking_id, amount, payment_method, transaction_code, payment_status, paid_at).")
    add_p("15. refunds: Yêu cầu và lịch sử hoàn tiền (id, payment_id, booking_id, refund_code, refund_amount, refund_type, refund_method, refund_status, transaction_code, reason).")
    add_p("16. reviews: Đánh giá và nhận xét lưu trú của khách hàng (id, user_id, hotel_id, booking_id, rating, comment, status).")

    add_h2("3.3 Danh sách API Endpoints")
    tbl_api = doc.add_table(rows=1, cols=3)
    tbl_api.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_simple_table_borders(tbl_api)

    a_hdr = tbl_api.rows[0].cells
    for i, h in enumerate(["Phương Thức", "Đường Dẫn API", "Chức Năng"]):
        set_cell_background(a_hdr[i], "E5E7EB")
        set_cell_margins(a_hdr[i], top=80, bottom=80, left=60, right=60)
        format_cell(a_hdr[i], h, bold=True, font_size=10.5, align=WD_ALIGN_PARAGRAPH.CENTER)

    api_list = [
        ("POST", "/api/auth/register & /api/auth/login", "Đăng ký & Đăng nhập tài khoản (Bcrypt + JWT)"),
        ("GET", "/api/rooms & /api/rooms/:id", "Lấy danh sách phòng, lọc phòng & xem chi tiết"),
        ("GET", "/api/locations & /api/vouchers", "Lấy danh mục tỉnh thành & Mã giảm giá"),
        ("POST", "/api/vouchers/apply", "Kiểm tra và áp dụng mã giảm giá"),
        ("POST", "/api/bookings", "Tạo đơn đặt phòng mới"),
        ("GET", "/api/bookings/my-bookings", "Lấy danh sách đơn đặt phòng cá nhân"),
        ("GET", "/api/admin/stats", "Thống kê doanh thu & tổng quan hệ thống"),
        ("POST", "/api/admin/walk-in", "Tạo đơn đặt phòng tại quầy cho lễ tân"),
        ("PATCH", "/api/admin/rooms/:id/toggle", "Bật/Tắt trạng thái bảo trì phòng"),
        ("GET", "/api/admin/export-csv", "Xuất file báo cáo doanh thu CSV")
    ]

    for idx, row in enumerate(api_list):
        r_cells = tbl_api.add_row().cells
        bg_color = "F9FAFB" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate(row):
            set_cell_background(r_cells[i], bg_color)
            set_cell_margins(r_cells[i], top=60, bottom=60, left=60, right=60)
            align = WD_ALIGN_PARAGRAPH.CENTER if i == 0 else WD_ALIGN_PARAGRAPH.LEFT
            format_cell(r_cells[i], val, font_size=10, align=align)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ----------------------------------------------------
    # PHẦN 4: KẾT QUẢ KIỂM THỬ
    # ----------------------------------------------------
    add_h1("PHẦN 4: KẾT QUẢ KIỂM THỬ HỆ THỐNG")
    add_p("Hệ thống đã trải qua kiểm thử thực tế với các kết quả đạt được như sau:")

    tbl_tc = doc.add_table(rows=1, cols=4)
    tbl_tc.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_simple_table_borders(tbl_tc)

    tc_hdr = tbl_tc.rows[0].cells
    for i, h in enumerate(["STT", "Nội Dung Kiểm Thử", "Kết Quả Mong Đợi", "Đánh Giá"]):
        set_cell_background(tc_hdr[i], "E5E7EB")
        set_cell_margins(tc_hdr[i], top=80, bottom=80, left=60, right=60)
        format_cell(tc_hdr[i], h, bold=True, font_size=10.5, align=WD_ALIGN_PARAGRAPH.CENTER)

    tc_list = [
        ("1", "Đăng ký & Đăng nhập tài khoản", "Lưu mật khẩu mã hóa Bcrypt, trả về token JWT 24h", "Đạt"),
        ("2", "Chống Brute-force đăng nhập", "Chặn IP khi nhập sai mật khẩu quá 5 lần/15 phút", "Đạt"),
        ("3", "Tìm kiếm & Lọc phòng", "Lọc chính xác theo tỉnh thành và khoảng giá", "Đạt"),
        ("4", "Áp dụng Voucher giảm giá", "Trừ đúng số tiền ưu đãi vào đơn đặt phòng", "Đạt"),
        ("5", "Tạo đơn phòng & Mã QR", "Tạo đơn thành công và hiển thị QR xác nhận", "Đạt"),
        ("6", "Phân quyền truy cập Admin", "Chặn tài khoản khách thường truy cập trang Admin", "Đạt"),
        ("7", "Đặt phòng tại quầy (Walk-in)", "Tạo đơn cho khách vãng lai trực tiếp tại quầy", "Đạt"),
        ("8", "Bật/Tắt bảo trì phòng", "Cập nhật ẩn/hiện phòng tức thì trên giao diện", "Đạt"),
        ("9", "Xuất báo cáo doanh thu CSV", "Tải file dữ liệu .csv về máy tính", "Đạt"),
        ("10", "Khách hàng hủy đơn phòng", "Chuyển trạng thái đơn thành CANCELLED", "Đạt")
    ]

    for idx, row in enumerate(tc_list):
        r_cells = tbl_tc.add_row().cells
        bg_color = "F9FAFB" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate(row):
            set_cell_background(r_cells[i], bg_color)
            set_cell_margins(r_cells[i], top=60, bottom=60, left=60, right=60)
            align = WD_ALIGN_PARAGRAPH.CENTER if i in [0, 3] else WD_ALIGN_PARAGRAPH.LEFT
            format_cell(r_cells[i], val, font_size=10, align=align)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ----------------------------------------------------
    # PHẦN 5: KẾT LUẬN
    # ----------------------------------------------------
    add_h1("PHẦN 5: KẾT LUẬN")
    add_p("Dự án đã xây dựng hoàn chỉnh hệ thống đặt phòng khách sạn trực tuyến VnStay.vn đáp ứng đầy đủ các yêu cầu từ tìm kiếm, đặt phòng, áp mã ưu đãi cho đến quản lý doanh thu và tạo đơn tại quầy cho lễ tân.")
    add_p("Mã nguồn được đóng gói sạch sẽ, bảo mật tốt và đã được đẩy đầy đủ lên repository GitHub.")

    # Save to path
    output_docx = r"c:\Users\PC\OneDrive\Desktop\AI21301 - Toán cho học máy\hotel-booking-app\DATN_VnStay_BaoCaoQuanLyDuAn.docx"
    output_doc = r"c:\Users\PC\OneDrive\Desktop\AI21301 - Toán cho học máy\hotel-booking-app\DATN_VnStay_BaoCaoQuanLyDuAn.doc"
    
    doc.save(output_docx)
    shutil.copyfile(output_docx, output_doc)
    print("SUCCESS: Generated simple docx and doc files")

if __name__ == "__main__":
    create_simple_document()
