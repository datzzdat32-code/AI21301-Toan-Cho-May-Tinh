import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, CreditCard, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-100 text-slate-700 border-t border-slate-200 text-xs">
      
      {/* Top Banner Feature Trust */}
      <div className="border-b border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Cam Kết Giá Tốt Nhất</h4>
              <p className="text-[11px] text-slate-500">Hoàn tiền nếu thấy giá rẻ hơn</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">5.000+ Khách Sạn Uy Tín</h4>
              <p className="text-[11px] text-slate-500">Đã xác minh chất lượng phòng</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Thanh Toán Đa Dạng</h4>
              <p className="text-[11px] text-slate-500">QR VNPay, MoMo, Visa/Mastercard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Hỗ Trợ 24/7 Hotline</h4>
              <p className="text-[11px] text-slate-500">Tổng đài 1900 6868 miễn phí</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: About */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
              Vn
            </div>
            <span className="text-base font-extrabold text-slate-900">VnStay.vn</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Công ty Cổ phần Du lịch & Công nghệ VnStay Việt Nam. Hệ thống kết nối & đặt phòng khách sạn, resort hàng đầu Việt Nam.
          </p>
        </div>

        {/* Col 2: Destinations */}
        <div>
          <h3 className="text-slate-900 font-bold uppercase tracking-wider mb-3">Điểm Đến Phổ Biến</h3>
          <ul className="space-y-2 text-slate-600 font-medium">
            <li><Link to="/rooms?location=Đà Nẵng" className="hover:text-blue-600">Khách sạn tại Đà Nẵng</Link></li>
            <li><Link to="/rooms?location=Phú Quốc" className="hover:text-blue-600">Resort tại Phú Quốc</Link></li>
            <li><Link to="/rooms?location=Đà Lạt" className="hover:text-blue-600">Khách sạn tại Đà Lạt</Link></li>
            <li><Link to="/rooms?location=TP. Hồ Chí Minh" className="hover:text-blue-600">Khách sạn tại TP.HCM</Link></li>
            <li><Link to="/rooms?location=Hà Nội" className="hover:text-blue-600">Khách sạn tại Hà Nội</Link></li>
          </ul>
        </div>

        {/* Col 3: Support */}
        <div>
          <h3 className="text-slate-900 font-bold uppercase tracking-wider mb-3">Chính Sách & Hỗ Trợ</h3>
          <ul className="space-y-2 text-slate-600 font-medium">
            <li><Link to="/my-bookings" className="hover:text-blue-600">Tra cứu & Quản lý đơn hàng</Link></li>
            <li>Chính sách hủy đổi phòng</li>
            <li>Chính sách bảo mật thông tin</li>
            <li>Quy chế hoạt động sàn giao dịch</li>
            <li>Giải quyết tranh chấp khiếu nại</li>
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div>
          <h3 className="text-slate-900 font-bold uppercase tracking-wider mb-3">Tổng Đài Liên Hệ</h3>
          <ul className="space-y-2.5 text-slate-600 font-medium">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>Tầng 8, Tòa nhà VNPT, 57 Huỳnh Thúc Kháng, Đống Đa, Hà Nội</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-900 font-bold">1900 6868 - (024) 7300 6868</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span>hotro@vnstay.vn</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4 bg-white text-center text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 VnStay.vn. Giấy phép kinh doanh lữ hành số 01-999/2025/TCDL-GP-LHQT.</p>
          <p className="text-slate-400">Thiết kế nền tảng đặt phòng trực tuyến Việt Nam</p>
        </div>
      </div>
    </footer>
  );
}
