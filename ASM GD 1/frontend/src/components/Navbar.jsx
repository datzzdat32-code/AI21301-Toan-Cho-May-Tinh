import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, User, LogOut, ShieldAlert, CalendarCheck, Menu, X, Building2, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      
      {/* Top Bar - Real Travel Site Header */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-sky-400" />
              Hotline hỗ trợ 24/7: <strong className="text-white">1900 6868</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">Nền tảng đặt phòng khách sạn & resort uy tín toàn quốc</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 font-medium">
            <span className="flex items-center gap-1 text-white">🇻🇳 VND</span>
            <span className="text-slate-600">|</span>
            <Link to="/rooms" className="hover:text-white transition-colors">Khuyến mãi mới</Link>
            <span className="text-slate-600">|</span>
            <Link to="/my-bookings" className="hover:text-white transition-colors">Tra cứu đơn hàng</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
              Vn
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-none">
                VnStay<span className="text-blue-600">.vn</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5 tracking-tight">
                Đặt phòng khách sạn giá tốt nhất
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Trang Chủ
            </Link>
            
            <Link
              to="/rooms"
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                isActive('/rooms') ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Khách Sạn & Resort
            </Link>

            {user && (
              <Link
                to="/my-bookings"
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/my-bookings') ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-blue-600" />
                Đơn Đặt Của Tôi
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/admin') 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Quản Trị Admin
              </Link>
            )}
          </nav>

          {/* Right Action / Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 hover:border-blue-400 px-3 py-1.5 rounded-xl transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="pr-1">
                    <span className="text-xs font-bold text-slate-800 block leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-medium">
                      {user.role === 'ADMIN' ? 'Quản Trị Viên' : 'Tài Khoản Khách'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs font-medium">
                    <div className="px-3.5 py-2.5 border-b border-slate-100">
                      <p className="text-[11px] text-slate-400">Đăng nhập tài khoản</p>
                      <p className="font-bold text-slate-800 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-semibold"
                    >
                      <CalendarCheck className="w-4 h-4 text-blue-600" />
                      Lịch sử đơn hàng
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-blue-700 hover:bg-blue-50 font-bold"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Trang Dashboard Admin
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/login?tab=register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-all"
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
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-2 text-xs font-bold">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Trang Chủ
          </Link>
          <Link
            to="/rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Khách Sạn & Resort
          </Link>
          {user && (
            <Link
              to="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50"
            >
              Đơn Đặt Của Tôi
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-blue-700 bg-blue-50 border border-blue-200"
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
              className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50"
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
