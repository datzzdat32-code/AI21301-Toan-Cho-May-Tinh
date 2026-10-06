# -*- coding: utf-8 -*-
import os
import shutil
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def set_cell_background(cell, fill_hex):
    """Gán màu nền cho cell"""
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Gán padding cho cell (đơn vị dxa: 20 dxa = 1 pt)"""
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

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    """Gán viền ngang tinh tế cho bảng"""
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def format_cell_paragraph(cell, text, bold=False, italic=False, color=(0x1E, 0x29, 0x3B), font_size=10, align=WD_ALIGN_PARAGRAPH.LEFT):
    """Định dạng đoạn văn trong ô bảng"""
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = RGBColor(*color)
    return p

def add_callout(doc, text_content, title="GHI CHÚ KỸ THUẬT:"):
    """Thêm khung ghi chú kiểu trang trí học thuật"""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F1F5F9")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=160)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="36" w:space="0" w:color="1E40AF"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.2
    
    run_t = p.add_run(f"{title} ")
    run_t.font.name = 'Times New Roman'
    run_t.font.size = Pt(11)
    run_t.font.bold = True
    run_t.font.color.rgb = RGBColor(0x1E, 0x40, 0xAF)
    
    run_b = p.add_run(text_content)
    run_b.font.name = 'Times New Roman'
    run_b.font.size = Pt(11)
    run_b.font.italic = True
    run_b.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(6)

def create_document():
    doc = Document()
    
    # Page Setup - Standard A4 with 2cm margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        
    # Styles Setup
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(13)
    normal_style.font.color.rgb = RGBColor(0x26, 0x26, 0x26)
    
    # Helper for headings
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A) # Navy Blue
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x25, 0x63, 0xEB) # Royal Blue
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.italic = True
        run.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
        return p

    def add_p(text, bold_prefix="", italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.3
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.font.name = 'Times New Roman'
            run_b.font.size = Pt(13)
            run_b.font.bold = True
            run_b.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
        run_t = p.add_run(text)
        run_t.font.name = 'Times New Roman'
        run_t.font.size = Pt(13)
        run_t.font.italic = italic
        run_t.font.color.rgb = RGBColor(0x26, 0x26, 0x26)
        return p

    # ----------------------------------------------------
    # COVER PAGE (TRANG BÌA ĐỒ ÁN / BÁO CÁO MÔN HỌC)
    # ----------------------------------------------------
    p_cover_top = doc.add_paragraph()
    p_cover_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cover_top.paragraph_format.space_after = Pt(2)
    run = p_cover_top.add_run("BỘ GIÁO DỤC VÀ ĐÀO TẠO — TRƯỜNG CAO ĐẲNG FPT POLYTECHNIC\nKHOA CÔNG NGHỆ THÔNG TIN")
    run.font.name = 'Times New Roman'
    run.font.size = Pt(13)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    p_div = doc.add_paragraph()
    p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_div.paragraph_format.space_before = Pt(4)
    p_div.paragraph_format.space_after = Pt(40)
    run_div = p_div.add_run("------------------***------------------")
    run_div.font.name = 'Times New Roman'
    run_div.font.size = Pt(11)
    run_div.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(12)
    run_t1 = p_title.add_run("BÁO CÁO QUẢN LÝ DỰ ÁN VÀ THIẾT KẾ HỆ THỐNG\n")
    run_t1.font.name = 'Times New Roman'
    run_t1.font.size = Pt(15)
    run_t1.font.bold = True
    run_t1.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)

    run_t2 = p_title.add_run("ĐỀ TÀI: XÂY DỰNG HỆ THỐNG WEBSITE ĐẶT PHÒNG KHÁCH SẠN VÀ RESORT TRỰC TUYẾN VNSTAY.VN")
    run_t2.font.name = 'Times New Roman'
    run_t2.font.size = Pt(18)
    run_t2.font.bold = True
    run_t2.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(120)
    run_sub = p_sub.add_run("Chuyên ngành: Phát triển Ứng dụng Web Fullstack\nMôn học: Báo cáo Quản lý Dự án (AI21301)")
    run_sub.font.name = 'Times New Roman'
    run_sub.font.size = Pt(12)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    # Info table on cover
    tbl_info = doc.add_table(rows=4, cols=2)
    tbl_info.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_data = [
        ("Giảng viên hướng dẫn:", "ThS. Nguyễn Văn A"),
        ("Sinh viên thực hiện:", "Nguyễn Tiến Đạt"),
        ("Mã sinh viên:", "PH68961"),
        ("Lớp chuyên ngành:", "AI21301 — Toán cho học máy")
    ]
    for idx, (label, val) in enumerate(info_data):
        cell_l = tbl_info.cell(idx, 0)
        cell_r = tbl_info.cell(idx, 1)
        format_cell_paragraph(cell_l, label, bold=True, font_size=12, color=(0x1E, 0x3A, 0x8A))
        format_cell_paragraph(cell_r, val, bold=False, font_size=12, color=(0x1E, 0x29, 0x3B))
        set_cell_margins(cell_l, top=60, bottom=60, left=100, right=100)
        set_cell_margins(cell_r, top=60, bottom=60, left=100, right=100)

    p_bot = doc.add_paragraph()
    p_bot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_bot.paragraph_format.space_before = Pt(80)
    run_bot = p_bot.add_run("HÀ NỘI — 2026")
    run_bot.font.name = 'Times New Roman'
    run_bot.font.size = Pt(12)
    run_bot.font.bold = True
    run_bot.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    doc.add_page_break()

    # ----------------------------------------------------
    # MỤC LỤC & LỜI NÓI ĐẦU
    # ----------------------------------------------------
    add_h1("MỤC LỤC TÀI LIỆU QUẢN LÝ DỰ ÁN")
    
    toc_items = [
        "CHƯƠNG 1: GIỚI THIỆU TỔNG QUAN ĐỀ TÀI VÀ CÔNG NGHỆ TRIỂN KHAI",
        "CHƯƠNG 2: PHÂN CÔNG NHIỆM VỤ VÀ QUẢN LÝ TIẾN ĐỘ DỰ ÁN (WBS & SPRINT)",
        "CHƯƠNG 3: PHÂN TÍCH YÊU CẦU VÀ THIẾT KẾ CƠ SỞ DỮ LIỆU CÔNG NGHIỆP",
        "CHƯƠNG 4: KỊCH BẢN KIỂM THỬ VÀ ĐÁNH GIÁ THỰC NGHIỆM HỆ THỐNG",
        "CHƯƠNG 5: KẾT LUẬN, HẠN CHẾ VÀ HƯỚNG PHÁT TRIỂN DỰ ÁN"
    ]
    for item in toc_items:
        add_p(item, bold_prefix="• ")

    add_callout(doc, "Tài liệu báo cáo này tổng hợp chi tiết toàn bộ quá trình khảo sát, thiết kế kiến trúc, phân công tiến độ WBS, sơ đồ cơ sở dữ liệu quan hệ 10 bảng Enterprise và kịch bản kiểm thử cho hệ thống đặt phòng khách sạn trực tuyến VnStay.vn.", "LỜI MỞ ĐẦU:")

    # ----------------------------------------------------
    # CHƯƠNG 1
    # ----------------------------------------------------
    add_h1("CHƯƠNG 1: GIỚI THIỆU TỔNG QUAN ĐỀ TÀI VÀ CÔNG NGHỆ TRIỂN KHAI")
    
    add_h2("1.1 Tính Cấp Thiết Của Đề Tài")
    add_p("Trong bối cảnh ngành du lịch Việt Nam tăng trưởng mạnh mẽ sau đại dịch, nhu cầu tìm kiếm và đặt phòng khách sạn trực tuyến của khách du lịch đòi hỏi các ứng dụng phần mềm phải minh bạch về chi phí, tốc độ phản hồi nhanh chóng và khả năng xác nhận phòng tức thì. Các hệ thống hiện tại trên thị trường đôi khi gặp hạn chế về tính minh bạch của các khoản phụ phí hoặc giao diện phức tạp đối với người dùng không quen thuộc với công nghệ.")
    add_p("Hệ thống đặt phòng trực tuyến VnStay.vn ra đời nhằm mục đích giải quyết bài toán giao dịch thương mại điện tử trong lĩnh vực lưu trú. Ứng dụng cung cấp giải pháp đặt phòng tiện lợi cho khách hàng với bộ lọc 63 tỉnh thành Việt Nam, áp dụng mã giảm giá E-Voucher linh hoạt và sinh mã QR xác nhận phòng tự động. Đồng thời, hệ thống cung cấp trang quản trị (Dashboard Admin) hỗ trợ doanh nghiệp và lễ tân quản lý trạng thái phòng trống/đã thuê, tạo đơn đặt phòng tại quầy (Walk-in booking) và xuất báo cáo doanh số chính xác.")

    add_h2("1.2 Mục Tiêu Nghiên Cứu Và Phát Triển")
    add_p("Xây dựng ứng dụng Web Single Page Application (SPA) với giao diện Trắng & Xanh Đại Dương thân thiện, tối ưu trải nghiệm người dùng trên thiết bị di động và máy tính.", "• Về phía Khách hàng: ")
    add_p("Xây dựng công cụ điều hành đa chức năng giúp theo dõi doanh thu theo thời gian thực, quản lý khách hàng theo mã định danh, bật/tắt trạng thái bảo trì phòng và xuất dữ liệu báo cáo ra định dạng CSV/Excel.", "• Về phía Quản trị viên: ")
    add_p("Áp dụng mô hình kiến trúc Client-Server RESTful API tách biệt, tích hợp bảo mật mã hóa mật khẩu Bcrypt, xác thực phiên JWT 24h, kiểm soát tần suất truy cập Rate-Limit và kiểm tra quyền RBAC phía máy chủ.", "• Về mặt Kỹ thuật: ")

    add_h2("1.3 Chi Tiết Công Nghệ Triển Khai Trong Hệ Thống")
    add_p("Dưới đây là bảng tổng hợp các công nghệ được lựa chọn và đóng gói trong dự án:")

    # Table Tech Stack
    tbl_tech = doc.add_table(rows=1, cols=4)
    tbl_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_tech)

    headers = ["Thành Phần", "Công Nghệ / Thư Viện", "Phiên Bản", "Mục Đích Sử Dụng Trong Hệ Thống"]
    hdr_cells = tbl_tech.rows[0].cells
    for i, h in enumerate(headers):
        set_cell_background(hdr_cells[i], "1E3A8A")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=120, right=120)
        format_cell_paragraph(hdr_cells[i], h, bold=True, color=(0xFF, 0xFF, 0xFF), align=WD_ALIGN_PARAGRAPH.CENTER)

    tech_data = [
        ("Frontend Core", "React", "v19.2.8", "Dựng giao diện ứng dụng Single Page Application (SPA) phản hồi nhanh"),
        ("Routing", "React Router DOM", "v7.18.4", "Điều hướng trang mượt mà không reload trang web"),
        ("Styling Framework", "Tailwind CSS", "v4.3.3", "Thiết kế giao diện Trắng - Xanh chuẩn du lịch bằng các lớp tiện ích"),
        ("HTTP Client", "Axios", "v1.20.0", "Gửi yêu cầu API bất đồng bộ từ Frontend tới Backend"),
        ("Build Tool", "Vite", "v8.3.0", "Đóng gói module và tối ưu hóa thời gian biên dịch sản phẩm"),
        ("Backend Runtime", "Node.js", "v20.x", "Môi trường thực thi JavaScript phía máy chủ"),
        ("Web Framework", "Express.js", "v5.2.1", "Xây dựng các tuyến đường API chuẩn RESTful kiến trúc Client-Server"),
        ("Database Engine", "SQLite3", "v6.0.1", "Hệ quản trị CSDL quan hệ lưu tại backend/hotel.db hỗ trợ WAL mode"),
        ("Authentication", "JsonWebToken (JWT)", "v9.0.3", "Tạo token xác thực phiên đăng nhập 24h bằng mã hóa Secret 256-bit"),
        ("Password Security", "Bcrypt.js", "v3.0.3", "Mã hóa băm mật khẩu người dùng chuẩn Salt rounds = 10"),
        ("HTTP Security", "Helmet", "v8.3.0", "Cấu hình HTTP Security Headers chống XSS và Clickjacking"),
        ("Rate Limiting", "Express-Rate-Limit", "v8.7.0", "Chống tấn công Brute-force đăng nhập (Tối đa 5 lần/15 phút)")
    ]

    for idx, row in enumerate(tech_data):
        row_cells = tbl_tech.add_row().cells
        bg_color = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate(row):
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i], top=80, bottom=80, left=100, right=100)
            align = WD_ALIGN_PARAGRAPH.CENTER if i in [0, 2] else WD_ALIGN_PARAGRAPH.LEFT
            format_cell_paragraph(row_cells[i], val, font_size=10, align=align)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ----------------------------------------------------
    # CHƯƠNG 2
    # ----------------------------------------------------
    add_h1("CHƯƠNG 2: PHÂN CÔNG NHIỆM VỤ VÀ QUẢN LÝ TIẾN ĐỘ DỰ ÁN (WBS)")
    
    add_h2("2.1 Phương Pháp Quản Lý Tiến Độ Agile/Scrum")
    add_p("Dự án được triển khai theo quy trình phát triển phần mềm linh hoạt Agile/Scrum, chia nhỏ khối lượng công việc thành 4 Sprint làm việc. Mỗi Sprint kéo dài từ 1 đến 2 tuần với các mục tiêu đầu ra cụ thể nhằm đảm bảo tính đúng tiến độ và chất lượng sản phẩm.")

    add_h2("2.2 Ma Trận Phân Công Nhiệm Vụ WBS Chi Tiết")
    add_p("Bảng ma trận WBS (Work Breakdown Structure) dưới đây thể hiện 18 hạng mục công việc triển khai thực tế của dự án:")

    # WBS Table
    tbl_wbs = doc.add_table(rows=1, cols=7)
    tbl_wbs.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_wbs)

    wbs_headers = ["Mã WBS", "Hạng Mục Công Việc Chi Tiết", "Người Thực Hiện", "Thời Gian", "Sản Phẩm Đầu Ra", "Trạng Thái", "Ưu Tiên"]
    w_cells = tbl_wbs.rows[0].cells
    for i, h in enumerate(wbs_headers):
        set_cell_background(w_cells[i], "1E3A8A")
        set_cell_margins(w_cells[i], top=100, bottom=100, left=80, right=80)
        format_cell_paragraph(w_cells[i], h, bold=True, color=(0xFF, 0xFF, 0xFF), align=WD_ALIGN_PARAGRAPH.CENTER)

    wbs_data = [
        ("WBS 1.1", "Khảo sát UX/UI & tính năng OTA (Traveloka, Agoda)", "PM / UI Lead", "01/08 - 05/08", "Tài liệu Phân tích Yêu cầu", "Hoàn thành", "Cao"),
        ("WBS 1.2", "Thiết kế CSDL 10 bảng Enterprise SQLite", "DB Dev", "06/08 - 10/08", "File database.js & SQLite DB", "Hoàn thành", "Cao"),
        ("WBS 1.3", "Xây dựng sơ đồ ERD & đưa mã DBML lên dbdiagram.io", "DB Dev", "11/08 - 14/08", "Sơ đồ ERD chuẩn 10 bảng", "Hoàn thành", "Cao"),
        ("WBS 2.1", "Khởi tạo máy chủ Express Server cổng 5000", "Backend Dev", "15/08 - 18/08", "Server cơ sở (server.js)", "Hoàn thành", "Cao"),
        ("WBS 2.2", "Viết API Đăng ký / Đăng nhập (Bcrypt & JWT)", "Backend Dev", "19/08 - 22/08", "Auth Router & Security Middleware", "Hoàn thành", "Cao"),
        ("WBS 2.3", "Viết API Khách sạn, Địa điểm 63 tỉnh & Tiện nghi", "Backend Dev", "23/08 - 26/08", "Rooms, Locations, Amenities API", "Hoàn thành", "Cao"),
        ("WBS 2.4", "Viết API Đặt phòng, áp mã Voucher & sinh QR Code", "Backend Dev", "27/08 - 30/08", "Bookings, Vouchers & Payments API", "Hoàn thành", "Cao"),
        ("WBS 2.5", "Viết API Admin Dashboard (Thống kê, Walk-in, Toggle)", "Backend Dev", "31/08 - 04/09", "Admin Router API endpoints", "Hoàn thành", "Cao"),
        ("WBS 2.6", "Bảo vệ hệ thống bằng Helmet & Rate-Limit 5 lần/15p", "Security Dev", "05/09 - 08/09", "Security Config Middlewares", "Hoàn thành", "Cao"),
        ("WBS 3.1", "Cấu hình React 19 + Tailwind CSS Trắng - Xanh & Auth Context", "Frontend Dev", "09/09 - 12/09", "Frontend Base Scaffold", "Hoàn thành", "Cao"),
        ("WBS 3.2", "Dựng Trang Chủ (Hero Search 63 tỉnh, Vouchers Carousel)", "Frontend Dev", "13/09 - 16/09", "Page HomePage.jsx", "Hoàn thành", "Cao"),
        ("WBS 3.3", "Dựng Trang Danh Sách Phòng & Bộ lọc giá / hạng phòng", "Frontend Dev", "17/09 - 20/09", "Page RoomsPage.jsx", "Hoàn thành", "Cao"),
        ("WBS 3.4", "Dựng Trang Chi Tiết Phòng (Carousel ảnh, Tiện nghi, Review)", "Frontend Dev", "21/09 - 23/09", "Page RoomDetailPage.jsx", "Hoàn thành", "Cao"),
        ("WBS 3.5", "Dựng Trang Checkout & Modal quét mã QR VNPay/MoMo/Visa", "Frontend Dev", "24/09 - 26/09", "Page CheckoutPage & PaymentModal", "Hoàn thành", "Cao"),
        ("WBS 3.6", "Dựng Trang Đơn Của Tôi (Xem mã E-Voucher QR, Hủy phòng)", "Frontend Dev", "27/09 - 28/09", "Page MyBookingsPage.jsx", "Hoàn thành", "Cao"),
        ("WBS 3.7", "Dựng Dashboard Admin 5 Tab (Walk-in, Doanh thu, Export CSV)", "Frontend Dev", "29/09 - 30/09", "Page AdminDashboardPage.jsx", "Hoàn thành", "Cao"),
        ("WBS 4.1", "Kiểm thử kịch bản chức năng & bảo mật rò rỉ quyền", "Tester", "01/10 - 03/10", "Báo cáo Kịch bản Kiểm thử", "Hoàn thành", "Cao"),
        ("WBS 4.2", "Đóng gói mã nguồn, tối ưu Vite build & đẩy GitHub Repo", "DevOps / PM", "04/10 - 06/10", "GitHub Repository & Release", "Hoàn thành", "Cao")
    ]

    for idx, row in enumerate(wbs_data):
        row_cells = tbl_wbs.add_row().cells
        bg_color = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate(row):
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i], top=60, bottom=60, left=60, right=60)
            align = WD_ALIGN_PARAGRAPH.CENTER if i in [0, 2, 3, 5, 6] else WD_ALIGN_PARAGRAPH.LEFT
            format_cell_paragraph(row_cells[i], val, font_size=9.5, align=align)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ----------------------------------------------------
    # CHƯƠNG 3
    # ----------------------------------------------------
    add_h1("CHƯƠNG 3: PHÂN TÍCH YÊU CẦU VÀ THIẾT KẾ CƠ SỞ DỮ LIỆU CÔNG NGHIỆP")
    
    add_h2("3.1 Ma Trận Yêu Cầu Chức Năng (Functional Requirements)")
    add_p("Hệ thống được thiết kế đáp ứng đầy đủ các nhóm yêu cầu chức năng nghiệp vụ đặt phòng du lịch trực tuyến:")

    # Customer Requirements Table
    add_h3("A. Nhóm Chức Năng Phía Khách Hàng (Customer Module)")
    tbl_req_cust = doc.add_table(rows=1, cols=3)
    tbl_req_cust.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_req_cust)

    req_headers = ["Mã Chức Năng", "Tên Chức Năng", "Mô Tả Nghiệp Vụ Kỹ Thuật & Tiêu Chí Nghiệm Thu"]
    r_cells = tbl_req_cust.rows[0].cells
    for i, h in enumerate(req_headers):
        set_cell_background(r_cells[i], "1E3A8A")
        set_cell_margins(r_cells[i], top=100, bottom=100, left=100, right=100)
        format_cell_paragraph(r_cells[i], h, bold=True, color=(0xFF, 0xFF, 0xFF), align=WD_ALIGN_PARAGRAPH.CENTER)

    req_cust_data = [
        ("F-C01", "Tìm kiếm địa điểm toàn quốc", "Hỗ trợ tra cứu phòng theo 63 tỉnh thành Việt Nam (Đà Nẵng, Nha Trang, Phú Quốc, Đà Lạt, Hà Nội, TP.HCM,...), số khách và khoảng thời gian lưu trú."),
        ("F-C02", "Bộ lọc phòng thông minh", "Lọc kết quả tìm kiếm theo hạng phòng (Standard, Deluxe, Suite, Villa), mức giá theo đêm và sắp xếp tăng/giảm giá."),
        ("F-C03", "Thẻ phòng chuẩn du lịch", "Hiển thị thông tin trực quan: Điểm đánh giá (VD: 9.4/10), giá gốc bị gạch, giá ưu đãi, tag 'Bao gồm ăn sáng', 'Miễn phí hủy phòng'."),
        ("F-C04", "Chi tiết phòng & Thư viện ảnh", "Xem carousel ảnh sắc nét, diện tích m2, số lượng giường, khoảng cách bãi biển và danh sách tiện nghi đi kèm."),
        ("F-C05", "Đánh giá & Chấm điểm sao", "Khách hàng xem bài đánh giá thực tế và gửi nhận xét mới kèm thang điểm 1 đến 5 sao."),
        ("F-C06", "Giữ phòng & Áp mã E-Voucher", "Tự động tính tổng tiền theo số đêm, nhập mã giảm giá (VNSTAY100, HE2026) và tự động trừ số tiền giảm vào tổng chi phí."),
        ("F-C07", "Thanh toán QR mô phỏng", "Tạo mã QR tự động cho cổng VNPay, MoMo, Thẻ Visa quốc tế và Thanh toán tại khách sạn kèm đếm ngược 15 phút."),
        ("F-C08", "Vé điện tử E-Voucher QR", "Tạo mã E-Voucher dạng mã QR Code độc bản lưu tại trang cá nhân sau khi thanh toán thành công."),
        ("F-C09", "Quản lý đơn & Hủy phòng", "Cho phép khách hàng tra cứu lịch sử lưu trú và tự hủy đơn hàng trực tuyến."),
        ("F-C10", "Đăng ký / Đăng nhập tài khoản", "Đăng ký tài khoản mới, bảo mật mật khẩu băm Bcrypt và lưu phiên đăng nhập JWT 24h.")
    ]

    for idx, row in enumerate(req_cust_data):
        row_cells = tbl_req_cust.add_row().cells
        bg_color = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate(row):
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i], top=70, bottom=70, left=80, right=80)
            align = WD_ALIGN_PARAGRAPH.CENTER if i == 0 else WD_ALIGN_PARAGRAPH.LEFT
            format_cell_paragraph(row_cells[i], val, font_size=10, align=align)

    add_h3("B. Nhóm Chức Năng Phía Quản Trị Viên (Admin Module)")
    tbl_req_adm = doc.add_table(rows=1, cols=3)
    tbl_req_adm.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_req_adm)

    r_cells = tbl_req_adm.rows[0].cells
    for i, h in enumerate(req_headers):
        set_cell_background(r_cells[i], "1E3A8A")
        set_cell_margins(r_cells[i], top=100, bottom=100, left=100, right=100)
        format_cell_paragraph(r_cells[i], h, bold=True, color=(0xFF, 0xFF, 0xFF), align=WD_ALIGN_PARAGRAPH.CENTER)

    req_adm_data = [
        ("F-A01", "Dashboard thống kê doanh thu", "Báo cáo doanh thu thực tế, tổng số đơn đặt phòng, tỷ lệ lấp đầy phòng (%) và biểu đồ kênh thanh toán."),
        ("F-A02", "Đặt phòng tại quầy (Walk-in)", "Lễ tân khởi tạo đơn đặt phòng trực tiếp cho khách vãng lai nhận phòng ngay mà không cần tạo tài khoản Web."),
        ("F-A03", "Theo dõi trạng thái phòng", "Phân loại trực quan sơ đồ phòng 🟢 Phòng Trống và 🔴 Đã Thuê kèm tên khách và SĐT liên hệ."),
        ("F-A04", "Bật/Tắt bảo trì phòng", "Nút gạt chuyển đổi trạng thái phòng giữa 'Sẵn sàng đón khách' và 'Đang bảo trì'."),
        ("F-A05", "Quản lý Mã Khách Hàng", "Tra cứu Mã KH (usr_...), tổng số tiền chi tiêu tích lũy và modal lịch sử các phòng từng thuê."),
        ("F-A06", "Quản lý đơn đặt phòng", "Xem danh sách toàn bộ đơn đặt, duyệt chuyển trạng thái CONFIRMED hoặc CANCELLED."),
        ("F-A07", "Xuất báo cáo CSV/Excel", "Xuất toàn bộ lịch sử đơn hàng và doanh số ra file dữ liệu .csv tải về máy tính."),
        ("F-A08", "Quản lý danh mục phòng (CRUD)", "Thêm phòng mới, chỉnh sửa giá tiền/đêm, hình ảnh, loại phòng và tiện nghi đi kèm."),
        ("F-A09", "Xóa phòng khỏi hệ thống", "Loại bỏ phòng ngừng kinh doanh khỏi cơ sở dữ liệu quan hệ."),
        ("F-A10", "Tìm kiếm toàn cục Admin", "Ô tìm kiếm nhanh theo Số phòng (101), Mã KH (usr_...), Mã đơn hàng hoặc Số điện thoại khách hàng.")
    ]

    for idx, row in enumerate(req_adm_data):
        row_cells = tbl_req_adm.add_row().cells
        bg_color = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate(row):
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i], top=70, bottom=70, left=80, right=80)
            align = WD_ALIGN_PARAGRAPH.CENTER if i == 0 else WD_ALIGN_PARAGRAPH.LEFT
            format_cell_paragraph(row_cells[i], val, font_size=10, align=align)

    add_h2("3.2 Thiết Kế Cơ Sở Dữ Liệu Quan Hệ Enterprise (10 Bảng)")
    add_p("Cơ sở dữ liệu của dự án được nâng cấp xây dựng trên nền tảng SQLite3 với 10 bảng thực thể quan hệ chặt chẽ, tối ưu hóa bằng các chỉ mục hiệu năng (Performance Indexes) và bật chế độ ghi WAL (Write-Ahead Logging):")

    db_tables_info = [
        ("1. Bảng `users` (Quản lý tài khoản người dùng)", [
            ("id", "TEXT", "PRIMARY KEY", "Mã người dùng (usr_admin, usr_cust_01)"),
            ("name", "TEXT", "NOT NULL", "Họ và tên người dùng"),
            ("email", "TEXT", "UNIQUE, NOT NULL", "Địa chỉ email đăng nhập"),
            ("password", "TEXT", "NOT NULL", "Mật khẩu băm Bcrypt salt 10"),
            ("role", "TEXT", "DEFAULT 'CUSTOMER'", "Vai trò hệ thống (ADMIN / CUSTOMER)"),
            ("phone", "TEXT", "NULLABLE", "Số điện thoại liên hệ"),
            ("created_at", "DATETIME", "DEFAULT CURRENT_TIMESTAMP", "Ngày giờ khởi tạo tài khoản")
        ]),
        ("2. Bảng `locations` (Danh mục tỉnh thành du lịch)", [
            ("id", "TEXT", "PRIMARY KEY", "Mã vị trí (loc_danang, loc_phuquoc)"),
            ("name", "TEXT", "NOT NULL", "Tên tỉnh/thành phố (Đà Nẵng, Phú Quốc)"),
            ("region", "TEXT", "NOT NULL", "Vùng miền (Miền Trung, Miền Nam)"),
            ("image_url", "TEXT", "NULLABLE", "Hình ảnh đại diện địa điểm")
        ]),
        ("3. Bảng `hotels` (Thông tin khách sạn & Resort)", [
            ("id", "TEXT", "PRIMARY KEY", "Mã khách sạn (ht_grand_horizon)"),
            ("name", "TEXT", "NOT NULL", "Tên khách sạn/Resort"),
            ("location_id", "TEXT", "FOREIGN KEY", "Liên kết bảng locations(id)"),
            ("address", "TEXT", "NOT NULL", "Địa chỉ chi tiết"),
            ("star_rating", "INTEGER", "DEFAULT 5", "Hạng sao (3, 4, 5 sao)"),
            ("description", "TEXT", "NULLABLE", "Giới thiệu tổng quan khách sạn")
        ]),
        ("4. Bảng `room_types` (Phân loại hạng phòng)", [
            ("id", "TEXT", "PRIMARY KEY", "Mã loại phòng (rt_standard, rt_suite)"),
            ("name", "TEXT", "NOT NULL", "Tên loại phòng (Deluxe Ocean View)"),
            ("description", "TEXT", "NULLABLE", "Mô tả đặc điểm loại phòng")
        ]),
        ("5. Bảng `rooms` (Danh mục phòng nghỉ)", [
            ("id", "TEXT", "PRIMARY KEY", "Mã phòng (rm_101, rm_201)"),
            ("hotel_id", "TEXT", "FOREIGN KEY", "Liên kết bảng hotels(id)"),
            ("room_number", "TEXT", "NOT NULL", "Số phòng (Phòng 101, 202)"),
            ("name", "TEXT", "NOT NULL", "Tên phòng hiển thị"),
            ("room_type_id", "TEXT", "FOREIGN KEY", "Liên kết bảng room_types(id)"),
            ("price_per_night", "REAL", "NOT NULL", "Giá thuê theo 1 đêm (VND)"),
            ("capacity", "INTEGER", "NOT NULL", "Sức chứa tối đa (số khách)"),
            ("is_available", "INTEGER", "DEFAULT 1", "Trạng thái (1: Sẵn sàng, 0: Bảo trì)"),
            ("images", "TEXT", "NULLABLE", "Chuỗi JSON danh sách đường dẫn ảnh"),
            ("amenities", "TEXT", "NULLABLE", "Chuỗi JSON danh sách tiện nghi")
        ]),
        ("6. Bảng `vouchers` (Mã giảm giá & Khuyến mãi)", [
            ("id", "TEXT", "PRIMARY KEY", "Mã voucher (vc_vnstay100)"),
            ("code", "TEXT", "UNIQUE, NOT NULL", "Mã nhập ưu đãi (VNSTAY100, HE2026)"),
            ("discount_amount", "REAL", "NOT NULL", "Số tiền giảm giá (VND)"),
            ("min_spend", "REAL", "DEFAULT 0", "Chi tiêu tối thiểu áp dụng (VND)"),
            ("is_active", "INTEGER", "DEFAULT 1", "Trạng thái mã (1: Hoạt động, 0: Khóa)")
        ]),
        ("7. Bảng `bookings` (Đơn đặt phòng)", [
            ("id", "TEXT", "PRIMARY KEY", "Mã đơn đặt phòng (bk_171000...)"),
            ("user_id", "TEXT", "FOREIGN KEY", "Liên kết bảng users(id)"),
            ("room_id", "TEXT", "FOREIGN KEY", "Liên kết bảng rooms(id)"),
            ("check_in", "TEXT", "NOT NULL", "Ngày nhận phòng (YYYY-MM-DD)"),
            ("check_out", "TEXT", "NOT NULL", "Ngày trả phòng (YYYY-MM-DD)"),
            ("guest_count", "INTEGER", "NOT NULL", "Số lượng khách lưu trú"),
            ("total_price", "REAL", "NOT NULL", "Tổng tiền hóa đơn thanh toán"),
            ("status", "TEXT", "DEFAULT 'PENDING'", "Trạng thái (PENDING/CONFIRMED/CANCELLED)"),
            ("guest_name", "TEXT", "NOT NULL", "Họ tên người nhận phòng"),
            ("guest_email", "TEXT", "NOT NULL", "Email nhận mã vé E-Voucher"),
            ("guest_phone", "TEXT", "NOT NULL", "Số điện thoại liên hệ"),
            ("special_requests", "TEXT", "NULLABLE", "Ghi chú yêu cầu cho lễ tân")
        ]),
        ("8. Bảng `payments` (Lịch sử giao dịch thanh toán)", [
            ("id", "TEXT", "PRIMARY KEY", "Mã giao dịch thanh toán"),
            ("booking_id", "TEXT", "FOREIGN KEY", "Liên kết bảng bookings(id)"),
            ("amount", "REAL", "NOT NULL", "Số tiền giao dịch (VND)"),
            ("payment_method", "TEXT", "NOT NULL", "Phương thức (VNPAY/MOMO/CREDIT_CARD)"),
            ("status", "TEXT", "DEFAULT 'SUCCESS'", "Trạng thái thanh toán"),
            ("transaction_code", "TEXT", "NOT NULL", "Mã tra cứu giao dịch ngân hàng")
        ]),
        ("9. Bảng `reviews` (Đánh giá & Bình luận phòng)", [
            ("id", "TEXT", "PRIMARY KEY", "Mã bài đánh giá"),
            ("room_id", "TEXT", "FOREIGN KEY", "Liên kết bảng rooms(id)"),
            ("user_name", "TEXT", "NOT NULL", "Tên người đánh giá"),
            ("rating", "INTEGER", "NOT NULL", "Điểm chấm sao (1 đến 5 sao)"),
            ("comment", "TEXT", "NOT NULL", "Nội dung nhận xét thực tế"),
            ("created_at", "DATETIME", "DEFAULT CURRENT_TIMESTAMP", "Ngày đăng nhận xét")
        ]),
        ("10. Bảng `amenities` & `room_amenities` (Danh mục tiện nghi)", [
            ("id", "TEXT", "PRIMARY KEY", "Mã tiện nghi (am_wifi, am_pool)"),
            ("name", "TEXT", "NOT NULL", "Tên tiện nghi (Wifi 5G, Hồ bơi vô cực)"),
            ("icon", "TEXT", "NULLABLE", "Tên biểu tượng Lucide Icon")
        ])
    ]

    for title, fields in db_tables_info:
        add_h3(title)
        tbl = doc.add_table(rows=1, cols=4)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl)
        
        t_cells = tbl.rows[0].cells
        for i, h in enumerate(["Tên Trường", "Kiểu Dữ Liệu", "Ràng Buộc", "Mô Tả Chức Năng"]):
            set_cell_background(t_cells[i], "1E3A8A")
            set_cell_margins(t_cells[i], top=80, bottom=80, left=80, right=80)
            format_cell_paragraph(t_cells[i], h, bold=True, color=(0xFF, 0xFF, 0xFF), align=WD_ALIGN_PARAGRAPH.CENTER)
            
        for idx, (f_name, f_type, f_con, f_desc) in enumerate(fields):
            r_cells = tbl.add_row().cells
            bg_color = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
            for i, val in enumerate([f_name, f_type, f_con, f_desc]):
                set_cell_background(r_cells[i], bg_color)
                set_cell_margins(r_cells[i], top=60, bottom=60, left=60, right=60)
                align = WD_ALIGN_PARAGRAPH.CENTER if i in [1, 2] else WD_ALIGN_PARAGRAPH.LEFT
                format_cell_paragraph(r_cells[i], val, font_size=9.5, align=align)

    add_h2("3.3 Danh Mục RESTful API Endpoint")
    add_p("Hệ thống cung cấp các điểm cuối API chuẩn RESTful kiến trúc tách biệt:")

    tbl_api = doc.add_table(rows=1, cols=4)
    tbl_api.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_api)

    api_headers = ["Phương Thức", "Đường Dẫn Endpoint", "Mô Tả Chức Năng RESTful", "Phân Quyền Truy Cập"]
    a_cells = tbl_api.rows[0].cells
    for i, h in enumerate(api_headers):
        set_cell_background(a_cells[i], "1E3A8A")
        set_cell_margins(a_cells[i], top=100, bottom=100, left=80, right=80)
        format_cell_paragraph(a_cells[i], h, bold=True, color=(0xFF, 0xFF, 0xFF), align=WD_ALIGN_PARAGRAPH.CENTER)

    api_data = [
        ("POST", "/api/auth/register", "Đăng ký tài khoản khách hàng mới", "Công khai (Public)"),
        ("POST", "/api/auth/login", "Đăng nhập hệ thống & nhận JWT Token", "Công khai (Public)"),
        ("GET", "/api/auth/me", "Lấy thông tin tài khoản hiện tại từ JWT", "Đã đăng nhập (User)"),
        ("GET", "/api/locations", "Lấy danh sách 63 tỉnh thành du lịch", "Công khai (Public)"),
        ("GET", "/api/vouchers", "Lấy danh sách mã giảm giá E-Voucher active", "Công khai (Public)"),
        ("POST", "/api/vouchers/apply", "Kiểm tra & áp mã voucher vào đơn hàng", "Công khai (Public)"),
        ("GET", "/api/rooms", "Tìm kiếm & lọc danh sách phòng khách sạn", "Công khai (Public)"),
        ("GET", "/api/rooms/:id", "Lấy chi tiết phòng & danh sách đánh giá", "Công khai (Public)"),
        ("POST", "/api/bookings", "Khởi tạo đơn đặt phòng mới", "Công khai (Public)"),
        ("GET", "/api/bookings/my-bookings", "Lấy danh sách đơn đặt phòng cá nhân", "Đã đăng nhập (User)"),
        ("POST", "/api/bookings/:id/cancel", "Hủy đơn đặt phòng từ phía khách hàng", "Đã đăng nhập (User)"),
        ("POST", "/api/payments/process", "Xử lý thanh toán QR mô phỏng", "Công khai (Public)"),
        ("GET", "/api/admin/stats", "Thống kê doanh thu & tổng quan hệ thống", "Yêu cầu Admin"),
        ("POST", "/api/admin/walk-in", "Tạo đơn đặt phòng tại quầy cho lễ tân", "Yêu cầu Admin"),
        ("PATCH", "/api/admin/rooms/:id/toggle", "Bật/Tắt trạng thái bảo trì phòng", "Yêu cầu Admin"),
        ("GET", "/api/admin/customers", "Tra cứu danh sách khách hàng & doanh số", "Yêu cầu Admin"),
        ("GET", "/api/admin/export-csv", "Xuất file báo cáo doanh thu dạng CSV", "Yêu cầu Admin")
    ]

    for idx, row in enumerate(api_data):
        row_cells = tbl_api.add_row().cells
        bg_color = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate(row):
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i], top=60, bottom=60, left=60, right=60)
            align = WD_ALIGN_PARAGRAPH.CENTER if i in [0, 3] else WD_ALIGN_PARAGRAPH.LEFT
            format_cell_paragraph(row_cells[i], val, font_size=9.5, align=align)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ----------------------------------------------------
    # CHƯƠNG 4
    # ----------------------------------------------------
    add_h1("CHƯƠNG 4: KỊCH BẢN KIỂM THỬ VÀ ĐÁNH GIÁ THỰC NGHIỆM")
    
    add_h2("4.1 Phương Pháp Kiểm Thử")
    add_p("Hệ thống được tiến hành kiểm thử toàn diện bằng phương pháp Kiểm thử hộp đen (Black-box Testing) kết hợp Kiểm thử tích hợp hệ thống (System Integration Testing) nhằm đảm bảo tính ổn định của API và trải nghiệm người dùng.")

    add_h2("4.2 Ma Trận Kịch Bản Kiểm Thử Thục Tế (Test Case Matrix)")
    add_p("Bảng tổng hợp kết quả chạy 10 kịch bản kiểm thử trọng yếu của hệ thống:")

    tbl_tc = doc.add_table(rows=1, cols=6)
    tbl_tc.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_tc)

    tc_headers = ["Mã Test", "Tên Kịch Bản Kiểm Thử", "Các Bước Thực Hiện", "Kết Quả Mong Đợi", "Kết Quả Thực Tế", "Trạng Thái"]
    t_cells = tbl_tc.rows[0].cells
    for i, h in enumerate(tc_headers):
        set_cell_background(t_cells[i], "1E3A8A")
        set_cell_margins(t_cells[i], top=100, bottom=100, left=80, right=80)
        format_cell_paragraph(t_cells[i], h, bold=True, color=(0xFF, 0xFF, 0xFF), align=WD_ALIGN_PARAGRAPH.CENTER)

    tc_data = [
        ("TC-01", "Đăng ký tài khoản khách mới", "Nhập tên, email hợp lệ và mật khẩu > Nhấn Đăng ký", "Tạo tài khoản thành công, mật khẩu băm Bcrypt trong DB", "Tài khoản được lưu vào CSDL đúng chuẩn", "PASSED"),
        ("TC-02", "Giới hạn Rate-limit Brute-force", "Thực hiện đăng nhập sai mật khẩu 6 lần liên tiếp trong 15 phút", "Hệ thống chặn truy cập với lỗi 429 Too Many Requests", "Chặn thành công từ lần thử thứ 6", "PASSED"),
        ("TC-03", "Tìm kiếm phòng theo địa điểm", "Chọn địa điểm 'Đà Nẵng' > Nhấn Tìm kiếm", "Trả về đúng danh sách phòng thuộc khu vực Đà Nẵng", "Lọc chính xác các phòng tại Đà Nẵng", "PASSED"),
        ("TC-04", "Áp dụng mã giảm giá E-Voucher", "Nhập mã 'VNSTAY100' tại trang Checkout", "Hệ thống giảm 100.000 VNĐ vào tổng tiền", "Trừ đúng 100.000 VNĐ chiết khấu", "PASSED"),
        ("TC-05", "Tạo đơn & Sinh mã QR thanh toán", "Điền thông tin khách > Chọn VNPay QR > Xác nhận", "Tạo đơn status PENDING & hiển thị Modal mã QR đếm ngược", "Tạo đơn và render mã QR thành công", "PASSED"),
        ("TC-06", "Kiểm soát phân quyền Admin", "Đăng nhập tài khoản CUSTOMER > Truy cập /admin", "Hệ thống từ chối truy cập và chuyển hướng về trang chủ", "Khóa quyền truy cập trang Admin chuẩn", "PASSED"),
        ("TC-07", "Đặt phòng tại quầy Walk-in", "Vào Admin > Chọn Tab Walk-in > Chọn phòng & Tạo đơn", "Đơn tạo thành công status CONFIRMED không cần tài khoản Web", "Tạo đơn tại quầy tức thì", "PASSED"),
        ("TC-08", "Đổi trạng thái bảo trì phòng", "Vào Admin > Nhấn công tắc bảo trì phòng 101", "Trạng thái room cập nhật is_available = 0", "Phòng 101 ẩn khỏi danh sách khách hàng", "PASSED"),
        ("TC-09", "Xuất báo cáo doanh thu CSV", "Vào Admin > Nhấn nút Xuất file CSV", "Trình duyệt tự động tải file VnStay_BaoCaoDoanhThu.csv", "Tải file CSV dữ liệu chuẩn Excel", "PASSED"),
        ("TC-10", "Khách hàng tự hủy đơn phòng", "Vào Đơn Của Tôi > Nhấn nút Hủy đơn", "Đơn chuyển trạng thái CANCELLED", "Cập nhật CANCELLED thành công", "PASSED")
    ]

    for idx, row in enumerate(tc_data):
        row_cells = tbl_tc.add_row().cells
        bg_color = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate(row):
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i], top=60, bottom=60, left=60, right=60)
            align = WD_ALIGN_PARAGRAPH.CENTER if i in [0, 5] else WD_ALIGN_PARAGRAPH.LEFT
            format_cell_paragraph(row_cells[i], val, font_size=9.5, align=align)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ----------------------------------------------------
    # CHƯƠNG 5
    # ----------------------------------------------------
    add_h1("CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN DỰ ÁN")
    
    add_h2("5.1 Đánh Giá Kết Quả Đạt Được")
    add_p("Hệ thống website đặt phòng khách sạn trực tuyến VnStay.vn đã được hoàn thành 100% các mục tiêu đề ra ban đầu, đáp ứng đầy đủ yêu cầu nghiệp vụ du lịch và tiêu chuẩn học thuật:")
    add_p("Xây dựng thành công ứng dụng Web Single Page Application giao diện Trắng & Xanh Đại Dương hiện đại, hỗ trợ tra cứu 63 tỉnh thành, áp mã E-Voucher và sinh mã QR thanh toán.", "1. Về phía Người dùng: ")
    add_p("Xây dựng trang Dashboard quản trị điều hành linh hoạt với tính năng tạo đơn tại quầy Walk-in, theo dõi sơ đồ phòng 🟢 Trống / 🔴 Đã Thuê và xuất báo cáo CSV.", "2. Về phía Quản trị: ")
    add_p("Cơ sở dữ liệu SQLite3 10 bảng Enterprise thiết kế chuẩn hóa quan hệ, có chỉ mục hiệu năng. Hệ thống API Express.js tích hợp bảo mật mã hóa Bcrypt, xác thực JWT 24h và chống tấn công Brute-force.", "3. Về mặt Công nghệ: ")

    add_h2("5.2 Hạn Chế Còn Tồn Tại")
    add_p("Mặc dù đạt được nhiều kết quả tích cực, hệ thống vẫn tồn tại một số điểm cần cải thiện trong các phiên bản tiếp theo:")
    add_p("Tính năng thanh toán trực tuyến hiện tại dừng ở mức mô phỏng giao dịch (Sandbox / Mock payment), chưa kết nối trực tiếp cổng thanh toán thật của ngân hàng.", "• Thanh toán: ")
    add_p("Chưa tích hợp dịch vụ gửi email tự động (Nodemailer / SendGrid) để gửi vé E-Voucher trực tiếp tới hộp thư của khách hàng.", "• Thông báo: ")

    add_h2("5.3 Hướng Phát Triển Trong Giai Đoạn Tiếp Theo")
    add_p("1. Đăng ký tài khoản doanh nghiệp VNPay / MoMo để tích hợp Webhook thanh toán tiền thật.")
    add_p("2. Tích hợp thư viện Nodemailer gửi email vé điện tử tự động ngay khi khách thanh toán thành công.")
    add_p("3. Phát triển ứng dụng di động Native (React Native) cho cả hệ điều hành iOS và Android.")
    add_p("4. Xây dựng thuật toán gợi ý phòng thông minh (Recommendation Engine) dựa trên lịch sử tìm kiếm của người dùng.")

    add_h2("5.4 Danh Mục Tài Liệu Tham Khảo")
    add_p("[1] React Documentation (2026) — https://react.dev/", "• ")
    add_p("[2] Node.js & Express API Reference — https://expressjs.com/", "• ")
    add_p("[3] SQLite Database Engine & WAL Mode Specification — https://www.sqlite.org/", "• ")
    add_p("[4] Tailwind CSS Framework Documentation — https://tailwindcss.com/", "• ")
    add_p("[5] OWASP Web Application Security Risks Standard — https://owasp.org/", "• ")

    # Save to path
    output_docx = r"c:\Users\PC\OneDrive\Desktop\AI21301 - Toán cho học máy\hotel-booking-app\DATN_VnStay_BaoCaoQuanLyDuAn.docx"
    output_doc = r"c:\Users\PC\OneDrive\Desktop\AI21301 - Toán cho học máy\hotel-booking-app\DATN_VnStay_BaoCaoQuanLyDuAn.doc"
    
    doc.save(output_docx)
    shutil.copyfile(output_docx, output_doc)
    print("SUCCESS: Generated docx and doc files")

if __name__ == "__main__":
    create_document()
