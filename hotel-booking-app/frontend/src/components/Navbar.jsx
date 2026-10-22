import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, User, LogOut, ShieldAlert, CalendarCheck, Menu, X, Building2, ChevronDown, CheckCircle2, Sparkles, Compass } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // DÀNH RIÊNG CHO TRANG QUẢN TRỊ ADMIN: Giữ nguyên trong Admin, không nhảy sang trang khác
  if (location.pathname === '/admin') {
    return (
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md text-white border-b border-slate-800 shadow-lg notranslate" translate="no">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Admin Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 ring-1 ring-white/20">
                Vn
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black tracking-tight text-white block leading-none">
                    VnStay<span className="text-sky-400">.vn</span>
                  </span>
                  <span className="text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Hệ Thống Quản Trị
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                  Bảng Điều Khiển Khách Sạn & Đặt Phòng Trực Tuyến
                </span>
              </div>
            </div>

            {/* Right Admin Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer shadow-xs"
                title="Mở giao diện khách hàng đặt phòng ở thẻ mới mà không rời trang Admin"
              >
                <span>🌐 Xem Web Khách Hàng</span>
                <span className="text-[10px] text-sky-400 font-mono">(Tab Mới)</span>
              </a>

              {user && (
                <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs ring-1 ring-white/10">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-xs font-bold text-white leading-tight">{user.name || 'Quản Trị Viên'}</p>
                      <p className="text-[10px] text-sky-400 font-medium leading-tight">Admin Thụ Hưởng</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-600/15 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-all border border-rose-500/30 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Đăng xuất khỏi tài khoản Quản trị"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đăng Xuất</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs notranslate transition-all" translate="no">
      
      {/* Admin Alert Bar when on Client Pages */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs py-2 px-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Bạn đang đăng nhập tài khoản Quản Trị Viên (Admin).</span>
            </div>
            <Link
              to="/admin"
              className="bg-white text-blue-800 hover:bg-blue-50 px-3.5 py-1 rounded-lg text-xs font-extrabold shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Vào Trang Quản Trị Ngay</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}

      {/* Top Bar - Travel Site Header */}
      <div className="bg-slate-950 text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-900 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3 h-3 text-sky-400" />
              Hotline 24/7: <strong className="text-white font-mono">1900 6868</strong>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Nền tảng đặt phòng khách sạn & resort uy tín hàng đầu Việt Nam</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-white font-semibold">🇻🇳 VND (₫)</span>
            <span className="text-slate-700">|</span>
            <Link to="/rooms" className="hover:text-white transition-colors">Ưu Đãi Hôm Nay</Link>
            <span className="text-slate-700">|</span>
            <Link to="/my-bookings" className="hover:text-white transition-colors">Tra Cứu Vé Đặt</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/25 ring-2 ring-blue-100 group-hover:scale-105 transition-all">
              Vn
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 block leading-none">
                VnStay<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">.vn</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold block mt-1 tracking-tight">
                Đặt phòng khách sạn & resort giá tốt nhất
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1.5">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive('/') 
                  ? 'text-blue-700 bg-blue-50/80 shadow-xs ring-1 ring-blue-200' 
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/70'
              }`}
            >
              Trang Chủ
            </Link>
            
            <Link
              to="/rooms"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive('/rooms') 
                  ? 'text-blue-700 bg-blue-50/80 shadow-xs ring-1 ring-blue-200' 
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/70'
              }`}
            >
              Khách Sạn & Resort
            </Link>

            {user && (
              <Link
                to="/my-bookings"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/my-bookings') 
                    ? 'text-blue-700 bg-blue-50/80 shadow-xs ring-1 ring-blue-200' 
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/70'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-blue-600" />
                <span>Đơn Đặt Của Tôi</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/admin') 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 shadow-xs'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Quản Trị Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Action / Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-300 px-3.5 py-2 rounded-xl transition-all text-left shadow-xs cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="pr-1">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-blue-600 block font-semibold">
                      {user.role === 'ADMIN' ? '👑 Quản Trị Viên' : '⭐ Khách Hàng Thân Thiết'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tài khoản</p>
                      <p className="font-bold text-slate-900 truncate mt-0.5">{user.name}</p>
                      <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-blue-50/70 hover:text-blue-700 transition-colors font-semibold"
                    >
                      <CalendarCheck className="w-4 h-4 text-blue-600" />
                      <span>Đơn đặt phòng & Lịch sử</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-blue-700 hover:bg-blue-50 font-bold"
                      >
                        <ShieldAlert className="w-4 h-4 text-blue-600" />
                        <span>Trang Bảng Điều Khiển Admin</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 font-semibold border-t border-slate-100 mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/login?tab=register"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 text-xs font-bold shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50"
          >
            Trang Chủ
          </Link>
          <Link
            to="/rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50"
          >
            Khách Sạn & Resort
          </Link>
          {user && (
            <Link
              to="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-blue-600 hover:bg-blue-50"
            >
              Đơn Đặt Của Tôi
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-blue-700 bg-blue-50 border border-blue-200"
            >
              👑 Quản Trị Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
                navigate('/');
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50"
            >
              Đăng xuất ({user.name})
            </button>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl font-bold bg-slate-100 text-slate-800"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/login?tab=register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl font-bold bg-blue-600 text-white"
              >
                Đăng Ký
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
