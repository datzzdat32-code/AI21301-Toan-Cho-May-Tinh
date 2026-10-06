import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Lock, Mail, User, Phone, LogIn, UserPlus, Sparkles, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(loginEmail, loginPassword);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(regName, regEmail, regPassword, regPhone);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký không thành công. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Demo autofill helpers
  const fillAdmin = () => {
    setActiveTab('login');
    setLoginEmail('admin@grandhorizon.com');
    setLoginPassword('admin123');
  };

  const fillCustomer = () => {
    setActiveTab('login');
    setLoginEmail('khachhang@gmail.com');
    setLoginPassword('user123');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white border border-slate-200 p-8 rounded-2xl shadow-xl relative">
        
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/20">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-wider">GRAND HORIZON</h2>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Tài Khoản & Đặt Phòng Cao Cấp</p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng Nhập</span>
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng Ký Mới</span>
          </button>
        </div>

        {/* Demo Accounts Quick Fill Buttons */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <p className="text-[11px] text-slate-500 text-center font-semibold">💡 Thử nghiệm nhanh với tài khoản mẫu:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={fillAdmin}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold text-center flex items-center justify-center gap-1 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Tài Khoản Admin
            </button>
            <button
              onClick={fillCustomer}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[11px] font-bold text-center flex items-center justify-center gap-1 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              Tài Khoản Khách
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Địa chỉ Email</label>
              <div className="flex items-center bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200">
                <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@grandhorizon.com"
                  className="bg-transparent text-xs text-slate-800 outline-none w-full font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Mật khẩu</label>
              <div className="flex items-center bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent text-xs text-slate-800 outline-none w-full font-semibold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Đang Đăng Nhập...' : 'Đăng Nhập Ngay'}
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Họ và Tên (*)</label>
              <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className="bg-transparent text-xs text-slate-800 outline-none w-full font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Địa chỉ Email (*)</label>
              <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="bg-transparent text-xs text-slate-800 outline-none w-full font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Số Điện Thoại</label>
              <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="0987654321"
                  className="bg-transparent text-xs text-slate-800 outline-none w-full font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Mật Khẩu (*)</label>
              <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="bg-transparent text-xs text-slate-800 outline-none w-full font-semibold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Đang Đăng Ký...' : 'Tạo Tài Khoản Mới'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
