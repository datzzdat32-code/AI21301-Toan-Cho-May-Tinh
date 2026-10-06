import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import RoomCard from '../components/RoomCard';
import { Search, Calendar, Users, MapPin, ArrowRight, ShieldCheck, Building2, Phone, Compass, Award, Tag, Sparkles } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setFeaturedRooms(roomsRes.data.slice(0, 6));
        setCategories(catRes.data);
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

  const topDestinations = [
    { city: 'Đà Nẵng', count: '1.250+ Khách sạn', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', tag: 'Biển Mỹ Khê & Cầu Rồng' },
    { city: 'Phú Quốc', count: '890+ Resort & Villa', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80', tag: 'Đảo Ngọc Ngắm Hoàng Hôn' },
    { city: 'Đà Lạt', count: '960+ Khách Sạn & Villa', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80', tag: 'Thành Phố Ngàn Hoa' },
    { city: 'TP. Hồ Chí Minh', count: '2.400+ Khách Sạn', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', tag: 'Trung Tâm Sầm Uất' },
    { city: 'Hà Nội', count: '1.850+ Khách Sạn', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', tag: 'Phố Cổ Nét Hoài Cổ' },
    { city: 'Nha Trang', count: '780+ Resort & Hotel', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', tag: 'Vịnh Biển Xanh Trong' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* HERO SECTION - REAL TRAVELOKA / AGODA STYLE SEARCH BANNER */}
      <section className="relative bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 py-12 sm:py-16 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-700/80 border border-blue-500 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              Nền Tảng Đặt Phòng Trực Tuyến Hàng Đầu Việt Nam
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Tìm Khách Sạn Giá Tốt Nhất Toàn Quốc
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm font-medium max-w-xl mx-auto">
              So sánh giá & đặt phòng hơn 5.000+ khách sạn, resort uy tín từ Đà Nẵng, Phú Quốc, Đà Lạt đến Hà Nội & TP.HCM.
            </p>
          </div>

          {/* REAL TRAVEL TABBED SEARCH CARD */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl text-slate-800 border border-slate-200">
            
            {/* Tabs */}
            <div className="flex border-b border-slate-200 pb-3 mb-4 gap-4 text-xs font-bold">
              <span className="text-blue-600 border-b-2 border-blue-600 pb-3 -mb-3 flex items-center gap-1.5 cursor-pointer">
                🏨 Khách Sạn & Resort
              </span>
              <span className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer">
                🏝️ Biệt Thự & Villa Sát Biển
              </span>
              <span className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer">
                🏢 Căn Hộ Dịch Vụ
              </span>
            </div>

            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              
              {/* Location Selector */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 lg:col-span-1 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Bạn muốn đi đâu?
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

              {/* Check in */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Ngày Nhận Phòng
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="bg-transparent text-slate-900 font-bold text-xs w-full outline-none"
                />
              </div>

              {/* Check out */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Ngày Trả Phòng
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="bg-transparent text-slate-900 font-bold text-xs w-full outline-none"
                />
              </div>

              {/* Guests */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Số Khách & Phòng
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

              {/* Search Submit CTA */}
              <div className="flex items-end sm:col-span-2 lg:col-span-5">
                <button
                  type="submit"
                  className="w-full h-12 rounded-xl font-extrabold bg-blue-600 text-white hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Tìm Kiếm Khách Sạn Giá Tốt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FEATURED DESTINATIONS IN VIETNAM */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-0.5">
                Điểm Đến Yêu Thích
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Các Thành Phố Du Lịch Nổi Tiếng Tại Việt Nam
              </h2>
            </div>
            <Link
              to="/rooms"
              className="mt-2 md:mt-0 inline-flex items-center gap-1 text-blue-600 font-bold text-xs hover:underline"
            >
              <span>Xem tất cả 63 tỉnh thành</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {topDestinations.map((dest, idx) => (
              <Link
                key={idx}
                to={`/rooms?location=${encodeURIComponent(dest.city)}`}
                className="group relative h-44 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 border border-slate-200"
              >
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <h3 className="font-black text-sm leading-tight group-hover:text-blue-200 transition-colors">
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

      {/* FEATURED ROOMS & HOTELS SECTION */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-0.5">
                Gợi Ý Hôm Nay
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Khách Sạn & Resort Được Đánh Giá Cao Nhất
              </h2>
            </div>
            <Link
              to="/rooms"
              className="text-blue-600 font-bold text-xs hover:underline hidden sm:block"
            >
              Xem tất cả danh sách →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white h-96 rounded-xl animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold bg-white border border-slate-200 text-slate-800 hover:border-blue-500 hover:text-blue-600 transition-all text-xs shadow-xs"
            >
              <span>Xem Thêm Khách Sạn Khác</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PROMO CODE VOUCHERS BANNER */}
      <section className="py-10 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                🎁 Mã Giảm Giá Đặc Biệt
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Ưu Đãi Đặt Phòng Giờ Vàng Tuần Này
              </h3>
              <p className="text-xs text-blue-200">
                Nhập mã ưu đãi tại bước thanh toán để nhận ngay chiết khấu trực tiếp vào hóa đơn.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl text-center font-mono">
                <span className="text-[10px] text-blue-200 font-sans block">Giảm 200.000 ₫</span>
                <span className="text-base font-extrabold text-amber-300 block">VNSTAY2026</span>
                <span className="text-[9px] text-slate-300 font-sans block mt-1">Đơn từ 1.500.000 ₫</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl text-center font-mono">
                <span className="text-[10px] text-blue-200 font-sans block">Giảm 15% Resort</span>
                <span className="text-base font-extrabold text-amber-300 block">SUMMERFUN</span>
                <span className="text-[9px] text-slate-300 font-sans block mt-1">Phú Quốc & Đà Nẵng</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl text-center font-mono">
                <span className="text-[10px] text-blue-200 font-sans block">Khách Hàng Mới</span>
                <span className="text-base font-extrabold text-amber-300 block">FIRSTSTAY</span>
                <span className="text-[9px] text-slate-300 font-sans block mt-1">Giảm 100.000 ₫</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY DU LỊCH VIỆT NAM CHỌN VNSTAY */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-1">
              Dịch Vụ Uy Tín
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Tại Sao Hơn 2.500.000 Khách Hàng Tin Chọn VnStay.vn?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center font-black text-xl">
                ⚡
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Xác Nhận Đơn Tức Thì</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nhận E-Voucher QR Code qua tin nhắn SMS & Email ngay sau khi hoàn tất thanh toán trong 30 giây.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-black text-xl">
                🛡️
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Cam Kết Giá Rẻ Nhất</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hoàn tiền chênh lệch 100% nếu bạn tìm thấy giá phòng tương đương thấp hơn trên bất kỳ sàn nào.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 mx-auto flex items-center justify-center font-black text-xl">
                ☕
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Không Chi Phí Ẩn</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Giá niêm yết là giá cuối cùng đã bao gồm đầy đủ Thuế VAT & Phí dịch vụ khách sạn.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center font-black text-xl">
                📞
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Hỗ Trợ 24/7 Chu Đáo</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đội ngũ tư vấn viên am hiểu du lịch Việt Nam sẵn sàng giải đáp thắc mắc qua tổng đài 1900 6868.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VERIFIED GUEST REVIEWS SECTION */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-1">
              Đánh Giá Thực Tế
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Trải Nghiệm Từ Khách Hàng Đã Lưu Trú
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "Gia đình mình vừa có chuyến nghỉ dưỡng 3 ngày 2 đêm tại Grand Horizon Phú Quốc. Phòng ốc cực kỳ sạch sẽ, nhân viên lễ tân hỗ trợ nhiệt tình. Quy trình nhận phòng qua QR voucher của VnStay rất nhanh gọn!"
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Chị Nguyễn Thị Hoàng Anh</h4>
                  <span className="text-[10px] text-slate-400">Du lịch cùng gia đình • Tháng 9/2026</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">✓ Khách thực tế</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "Khách sạn sát bãi biển Mỹ Khê Đà Nẵng view ngắm trọn biển rấtchill. Giá trên VnStay tốt hơn các bên khác lại được bao gồm cả bữa sáng buffet. Lần sau sẽ tiếp tục ủng hộ."
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Anh Trần Quốc Huy</h4>
                  <span className="text-[10px] text-slate-400">Chuyến công tác & nghỉ dưỡng • Tháng 8/2026</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">✓ Khách thực tế</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "Resort tại Đà Lạt cảnh đẹp mê hồn, phòng có ban công hướng đồi thông rất lãng mạn. Đặt phòng xong được tổng đài hỗ trợ tư vấn cả lịch trình vui chơi rất chu đáo."
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Chị Lê Phương Thảo</h4>
                  <span className="text-[10px] text-slate-400">Kỳ nghỉ lãng mạn • Tháng 9/2026</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">✓ Khách thực tế</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
