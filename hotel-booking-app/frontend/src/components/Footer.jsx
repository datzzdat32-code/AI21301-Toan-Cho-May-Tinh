import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, CreditCard, Building2, ShieldAlert, Award, Clock, HeartHandshake } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();

  if (location.pathname === '/admin') {
    return (
      <footer className="bg-slate-950 border-t border-slate-800 py-6 text-center text-xs text-slate-400 notranslate" translate="no">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-slate-200 font-bold">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[11px] font-black">Vn</div>
            <span>Hệ Thống Quản Trị Khách Sạn & Resort VnStay.vn</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Phiên bản Quản Trị Viên 2.0 • Tài khoản thụ hưởng: <strong className="text-sky-400 font-mono">DANG QUOC TOAN (MBBank - 0988888888)</strong>
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-xs">
      
      {/* ── TOP TRUST PROMISES ── */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-xs">Cam Kết Giá Tốt Nhất</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Hoàn tiền chênh lệch 100%</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-xs">5.000+ Khách Sạn Uy Tín</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Đã xác minh chất lượng thực tế</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-purple-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-xs">Thanh Toán An Toàn 24/7</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">VietQR Napas, MBBank, VNPay</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-amber-500/20">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-xs">Hỗ Trợ Khách Hàng 24/7</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Tổng đài 1900 6868 miễn phí</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER COLUMNS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Col 1: About Brand */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-base shadow-sm">
              Vn
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              VnStay<span className="text-sky-400">.vn</span>
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            Công ty Cổ phần Công nghệ & Du lịch VnStay Việt Nam. Hệ thống kết nối và đặt phòng khách sạn, resort nghỉ dưỡng hàng đầu toàn quốc.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              ✓ Đã Đăng Ký Bộ Công Thương
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
              ✓ Bảo Mật SSL 256-Bit
            </span>
          </div>
        </div>

        {/* Col 2: Destinations */}
        <div>
          <h3 className="text-white font-extrabold uppercase tracking-wider mb-3.5 text-xs">Điểm Đến Hàng Đầu</h3>
          <ul className="space-y-2.5 text-slate-400 font-medium text-xs">
            <li><Link to="/rooms?location=Đà Nẵng" className="hover:text-white transition-colors">Khách sạn & Resort Đà Nẵng</Link></li>
            <li><Link to="/rooms?location=Phú Quốc" className="hover:text-white transition-colors">Resort & Villa Phú Quốc</Link></li>
            <li><Link to="/rooms?location=Đà Lạt" className="hover:text-white transition-colors">Khách sạn view đẹp Đà Lạt</Link></li>
            <li><Link to="/rooms?location=TP. Hồ Chí Minh" className="hover:text-white transition-colors">Khách sạn trung tâm TP.HCM</Link></li>
            <li><Link to="/rooms?location=Hà Nội" className="hover:text-white transition-colors">Khách sạn phố cổ Hà Nội</Link></li>
            <li><Link to="/rooms?location=Nha Trang" className="hover:text-white transition-colors">Resort sát biển Nha Trang</Link></li>
          </ul>
        </div>

        {/* Col 3: Support */}
        <div>
          <h3 className="text-white font-extrabold uppercase tracking-wider mb-3.5 text-xs">Chính Sách & Hỗ Trợ</h3>
          <ul className="space-y-2.5 text-slate-400 font-medium text-xs">
            <li><Link to="/my-bookings" className="hover:text-white transition-colors font-bold text-sky-400">Tra cứu & Xem vé đặt phòng</Link></li>
            <li className="hover:text-white transition-colors cursor-pointer">Chính sách hoàn tiền & Hủy phòng</li>
            <li className="hover:text-white transition-colors cursor-pointer">Quy chế hoạt động sàn VnStay</li>
            <li className="hover:text-white transition-colors cursor-pointer">Chính sách bảo mật thông tin khách</li>
            <li className="hover:text-white transition-colors cursor-pointer">Giải quyết khiếu nại & Bồi thường</li>
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div>
          <h3 className="text-white font-extrabold uppercase tracking-wider mb-3.5 text-xs">Tổng Đài & Trụ Sở</h3>
          <ul className="space-y-3 text-slate-400 font-medium text-xs">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>Tòa nhà VNPT Tower, 57 Huỳnh Thúc Kháng, Đống Đa, Hà Nội</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="text-white font-black text-sm block">1900 6868</span>
                <span className="text-[10px] text-slate-400">(Miễn cước cuộc gọi 24/7)</span>
              </div>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-sky-400 shrink-0" />
              <span>hotro@vnstay.vn</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── PAYMENT METHODS STRIP ── */}
      <div className="border-t border-slate-900 bg-slate-950 py-4 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-bold text-slate-300">Đối tác thanh toán:</span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-white">VietQR Napas</span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-blue-400">MBBank</span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-rose-400">VNPay QR</span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-pink-400">MoMo</span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-amber-400">Visa / Mastercard</span>
          </div>

          <p className="text-slate-400">
            © 2026 VnStay.vn • Giấy phép lữ hành số 01-999/2025/TCDL-GP-LHQT.
          </p>
        </div>
      </div>
    </footer>
  );
}
