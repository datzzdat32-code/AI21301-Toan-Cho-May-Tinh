import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import RoomCard from '../components/RoomCard';
import { Search, Calendar, Users, MapPin, ArrowRight, ShieldCheck, Building2, Phone, Compass, Award, Tag, Sparkles, Star, CheckCircle2, HeartHandshake, Zap, Shield, Gift, Copy } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [allRooms, setAllRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomStatusFilter, setRoomStatusFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'OCCUPIED'
  const [copiedCode, setCopiedCode] = useState('');

  // Quick Search state
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const [checkOut, setCheckOut] = useState(tomorrow.toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, catRes] = await Promise.all([
          axios.get('/api/rooms'),
          axios.get('/api/categories')
        ]);
        setAllRooms(roomsRes.data || []);
        setCategories(catRes.data || []);
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams({
      capacity,
      checkIn,
      checkOut,
      ...(location && { location })
    }).toString();
    navigate(`/rooms?${query}`);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const topDestinations = [
    { city: 'Đà Nẵng', count: '1.250+ Khách sạn', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', tag: 'Biển Mỹ Khê & Cầu Rồng' },
    { city: 'Phú Quốc', count: '890+ Resort & Villa', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80', tag: 'Đảo Ngọc Ngắm Hoàng Hôn' },
    { city: 'Đà Lạt', count: '960+ Khách Sạn & Villa', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80', tag: 'Thành Phố Ngàn Hoa' },
    { city: 'TP. Hồ Chí Minh', count: '2.400+ Khách Sạn', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', tag: 'Trung Tâm Sầm Uất' },
    { city: 'Hà Nội', count: '1.850+ Khách Sạn', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', tag: 'Phố Cổ Nét Hoài Cổ' },
    { city: 'Nha Trang', count: '780+ Resort & Hotel', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', tag: 'Vịnh Biển Xanh Trong' }
  ];

  const availableCount = allRooms.filter(r => r.occupancy_status === 'AVAILABLE' || (!r.is_occupied && r.is_available !== 0)).length;
  const occupiedCount = allRooms.filter(r => r.occupancy_status === 'OCCUPIED' || r.is_occupied || r.is_available === 0).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* ── HERO SECTION: LUXURY TRAVEL WITH AMBIENT GLOW ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 py-16 sm:py-24 text-white px-4 sm:px-6 lg:px-8">
        
        {/* Ambient Blur Lighting Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          
          {/* Header Title & Floating Trust Badges */}
          <div className="text-center space-y-3.5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sky-300 text-xs font-extrabold uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>Nền Tảng Đặt Phòng Khách Sạn & Resort Hàng Đầu Việt Nam</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Khám Phá & Đặt Phòng <br />
              <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-200 bg-clip-text text-transparent">
                Giá Tốt Nhất Toàn Quốc
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl mx-auto leading-relaxed">
              Hơn 5.000+ khách sạn, resort & villa cao cấp từ Đà Nẵng, Phú Quốc, Đà Lạt đến Hà Nội & TP.HCM. Xác nhận tức thì, miễn phí hủy phòng và cam kết giá tốt nhất.
            </p>

            {/* Quick Floating Highlights */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-bold text-slate-200">
              <span className="bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.9/5 Hài Lòng (120k+ Khách)</span>
              </span>
              <span className="bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Nhận Phòng Qua Mã QR Tức Thì</span>
              </span>
              <span className="bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đảm Bảo Hoàn Tiền 100%</span>
              </span>
            </div>
          </div>

          {/* ── FLOATING SEARCH CARD ── */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-800 border border-white/80 ring-1 ring-black/5">
            
            {/* Tabs */}
            <div className="flex border-b border-slate-200 pb-3 mb-5 gap-6 text-xs font-bold overflow-x-auto">
              <span className="text-blue-700 border-b-2 border-blue-600 pb-3 -mb-3 flex items-center gap-2 cursor-pointer shrink-0 font-extrabold">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>🏨 Khách Sạn & Resort</span>
              </span>
              <span className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                <span>🏝️ Biệt Thự & Villa Sát Biển</span>
              </span>
              <span className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                <span>🏢 Căn Hộ Dịch Vụ</span>
              </span>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              
              {/* Row 1: 4 Equal Input Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* 1. Location Selector */}
                <div className="bg-slate-50/90 hover:bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Bạn muốn đi đâu?</span>
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-transparent text-slate-900 font-bold text-xs w-full outline-none cursor-pointer"
                  >
                    <option value="">Tất cả địa điểm Việt Nam</option>
                    <option value="Đà Nẵng">📍 Đà Nẵng</option>
                    <option value="Phú Quốc">📍 Phú Quốc</option>
                    <option value="Đà Lạt">📍 Đà Lạt</option>
                    <option value="TP. Hồ Chí Minh">📍 TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">📍 Hà Nội</option>
                    <option value="Nha Trang">📍 Nha Trang</option>
                    <option value="Sapa">📍 Sapa</option>
                    <option value="Vũng Tàu">📍 Vũng Tàu</option>
                  </select>
                </div>

                {/* 2. Check in */}
                <div className="bg-slate-50/90 hover:bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Ngày Nhận Phòng</span>
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="bg-transparent text-slate-900 font-bold text-xs w-full outline-none cursor-pointer"
                  />
                </div>

                {/* 3. Check out */}
                <div className="bg-slate-50/90 hover:bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Ngày Trả Phòng</span>
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="bg-transparent text-slate-900 font-bold text-xs w-full outline-none cursor-pointer"
                  />
                </div>

                {/* 4. Guests */}
                <div className="bg-slate-50/90 hover:bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Số Khách & Phòng</span>
                  </label>
                  <select
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="bg-transparent text-slate-900 font-bold text-xs w-full outline-none cursor-pointer"
                  >
                    <option value="1">1 Khách (Phòng đơn)</option>
                    <option value="2">2 Khách (1 Phòng đôi)</option>
                    <option value="4">4 Khách (Gia đình)</option>
                    <option value="6">6+ Khách (Nhóm/Villa)</option>
                  </select>
                </div>

              </div>

              {/* Row 2: Search Submit CTA Button */}
              <button
                type="submit"
                className="w-full h-13 rounded-2xl font-black text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.99] text-white shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Tìm Kiếm Khách Sạn Giá Tốt Nhất</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── POPULAR DESTINATIONS IN VIETNAM ── */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-blue-600 text-xs font-extrabold uppercase tracking-wider block mb-1">
                Điểm Đến Yêu Thích Hàng Đầu
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Các Thành Phố Du Lịch Nổi Tiếng Tại Việt Nam
              </h2>
            </div>
            <Link
              to="/rooms"
              className="mt-2 md:mt-0 inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs hover:text-blue-700 transition-colors"
            >
              <span>Xem tất cả điểm đến toàn quốc</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {topDestinations.map((dest, idx) => (
              <Link
                key={idx}
                to={`/rooms?location=${encodeURIComponent(dest.city)}`}
                className="group relative h-48 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-200 hover:-translate-y-1"
              >
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-black text-sm leading-tight group-hover:text-sky-300 transition-colors">
                    {dest.city}
                  </h3>
                  <span className="text-[10px] text-slate-200 font-medium block mt-0.5">
                    {dest.count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROOM STATUS & REAL-TIME AVAILABILITY SECTION ── */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-blue-600 text-xs font-extrabold uppercase tracking-wider block mb-1">
                Tình Trạng Phòng Thực Tế
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Xem Phòng Còn Trống & Phòng Đã Kín Khách
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Theo dõi tình trạng sẵn sàng đón khách hoặc đã có người đặt theo thời gian thực để chọn phòng phù hợp nhất.
              </p>
            </div>
            <Link
              to="/rooms"
              className="text-blue-600 font-bold text-xs hover:text-blue-700 hidden sm:inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Xem toàn bộ {allRooms.length} phòng</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Interactive Room Availability Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Xem trạng thái:</span>
              </span>

              <button
                onClick={() => setRoomStatusFilter('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  roomStatusFilter === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🏢 Tất Cả Phòng ({allRooms.length})
              </button>

              <button
                onClick={() => setRoomStatusFilter('AVAILABLE')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                  roomStatusFilter === 'AVAILABLE'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>🟢 Phòng Đang Còn Trống ({availableCount})</span>
              </button>

              <button
                onClick={() => setRoomStatusFilter('OCCUPIED')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                  roomStatusFilter === 'OCCUPIED'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>🔴 Phòng Đã Kín Khách ({occupiedCount})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Trực tiếp: <strong className="text-emerald-700">{availableCount}</strong> phòng sẵn sàng nhận khách</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white h-96 rounded-2xl animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : (
            <>
              {allRooms.filter(r => {
                const isOcc = r.occupancy_status === 'OCCUPIED' || r.is_occupied || r.is_available === 0;
                if (roomStatusFilter === 'AVAILABLE') return !isOcc;
                if (roomStatusFilter === 'OCCUPIED') return isOcc;
                return true;
              }).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Không có phòng nào phù hợp với bộ lọc này</p>
                  <button
                    onClick={() => setRoomStatusFilter('ALL')}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Xem tất cả phòng
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {allRooms
                    .filter(r => {
                      const isOcc = r.occupancy_status === 'OCCUPIED' || r.is_occupied || r.is_available === 0;
                      if (roomStatusFilter === 'AVAILABLE') return !isOcc;
                      if (roomStatusFilter === 'OCCUPIED') return isOcc;
                      return true;
                    })
                    .slice(0, 9)
                    .map((room) => (
                      <RoomCard key={room.id} room={room} />
                    ))}
                </div>
              )}
            </>
          )}

          <div className="text-center mt-10">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold bg-white border border-slate-200 text-slate-800 hover:border-blue-500 hover:text-blue-600 transition-all text-xs shadow-xs hover:shadow-md"
            >
              <span>Xem Toàn Bộ Danh Sách Phòng ({allRooms.length} phòng)</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROMO CODE VOUCHERS BANNER ── */}
      <section className="py-12 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                <Gift className="w-3 h-3" />
                Mã Giảm Giá Độc Quyền
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Ưu Đãi Đặt Phòng Giờ Vàng Tuần Này
              </h3>
              <p className="text-xs text-slate-300">
                Nhập mã ưu đãi tại bước thanh toán để nhận ngay chiết khấu trực tiếp vào hóa đơn phòng.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full md:w-auto">
              {[
                { label: 'Giảm 200.000 ₫', code: 'VNSTAY2026', sub: 'Đơn từ 1.500.000 ₫' },
                { label: 'Giảm 15% Resort', code: 'SUMMERFUN', sub: 'Phú Quốc & Đà Nẵng' },
                { label: 'Khách Hàng Mới', code: 'FIRSTSTAY', sub: 'Giảm ngay 100.000 ₫' }
              ].map((v, i) => (
                <div key={i} className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl text-center transition-all group relative">
                  <span className="text-[10px] text-sky-200 font-sans font-bold block">{v.label}</span>
                  <div className="flex items-center justify-center gap-1.5 my-1">
                    <span className="text-base font-black text-amber-300 font-mono tracking-wider">{v.code}</span>
                    <button
                      onClick={() => handleCopyCode(v.code)}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
                      title="Sao chép mã"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[9px] text-slate-300 font-sans block">{v.sub}</span>
                  {copiedCode === v.code && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                      Đã chép!
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE VNSTAY ── */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-blue-600 text-xs font-extrabold uppercase tracking-wider block mb-1">
              Dịch Vụ Uy Tín
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tại Sao Hơn 2.500.000 Khách Hàng Tin Chọn VnStay.vn?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 text-center space-y-2.5 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white mx-auto flex items-center justify-center font-black text-2xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                ⚡
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Xác Nhận Đơn Tức Thì</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Nhận E-Voucher QR Code qua tin nhắn SMS & Email ngay sau khi hoàn tất thanh toán trong 30 giây.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 text-center space-y-2.5 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white mx-auto flex items-center justify-center font-black text-2xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                🛡️
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Cam Kết Giá Rẻ Nhất</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Hoàn tiền chênh lệch 100% nếu bạn tìm thấy giá phòng tương đương thấp hơn trên bất kỳ sàn nào.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 text-center space-y-2.5 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white mx-auto flex items-center justify-center font-black text-2xl shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                ☕
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Không Chi Phí Ẩn</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Giá niêm yết là giá cuối cùng đã bao gồm đầy đủ Thuế VAT & Phí dịch vụ khách sạn.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300 text-center space-y-2.5 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white mx-auto flex items-center justify-center font-black text-2xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                📞
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Hỗ Trợ 24/7 Chu Đáo</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Đội ngũ tư vấn viên am hiểu du lịch Việt Nam sẵn sàng giải đáp thắc mắc qua tổng đài 1900 6868.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VERIFIED GUEST REVIEWS ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-blue-600 text-xs font-extrabold uppercase tracking-wider block mb-1">
              Đánh Giá Thực Tế Từ Khách Hàng
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trải Nghiệm Từ Khách Đã Lưu Trú
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3.5">
              <div className="flex items-center gap-1 text-amber-400">
                {'★★★★★'.split('').map((s, i) => <span key={i} className="text-sm">{s}</span>)}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic font-medium">
                "Gia đình mình vừa có chuyến nghỉ dưỡng 3 ngày 2 đêm tại Grand Horizon Phú Quốc. Phòng ốc cực kỳ sạch sẽ, nhân viên lễ tân hỗ trợ nhiệt tình. Quy trình nhận phòng qua QR voucher của VnStay rất nhanh gọn!"
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Chị Nguyễn Thị Hoàng Anh</h4>
                  <span className="text-[10px] text-slate-400">Du lịch cùng gia đình • Tháng 9/2026</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">✓ Khách thực tế</span>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3.5">
              <div className="flex items-center gap-1 text-amber-400">
                {'★★★★★'.split('').map((s, i) => <span key={i} className="text-sm">{s}</span>)}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic font-medium">
                "Khách sạn sát bãi biển Mỹ Khê Đà Nẵng view ngắm trọn biển rấtchill. Giá trên VnStay tốt hơn các bên khác lại được bao gồm cả bữa sáng buffet. Lần sau sẽ tiếp tục ủng hộ."
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Anh Trần Quốc Huy</h4>
                  <span className="text-[10px] text-slate-400">Chuyến công tác & nghỉ dưỡng • Tháng 8/2026</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">✓ Khách thực tế</span>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3.5">
              <div className="flex items-center gap-1 text-amber-400">
                {'★★★★★'.split('').map((s, i) => <span key={i} className="text-sm">{s}</span>)}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic font-medium">
                "Resort tại Đà Lạt cảnh đẹp mê hồn, phòng có ban công hướng đồi thông rất lãng mạn. Đặt phòng xong được tổng đài hỗ trợ tư vấn cả lịch trình vui chơi rất chu đáo."
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Chị Lê Phương Thảo</h4>
                  <span className="text-[10px] text-slate-400">Kỳ nghỉ lãng mạn • Tháng 9/2026</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">✓ Khách thực tế</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
