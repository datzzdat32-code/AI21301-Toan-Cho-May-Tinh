import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star, Users, Bed, Maximize2, CheckCircle2, Calendar, ShieldCheck, MessageSquare, ArrowLeft, Send, Sparkles, MapPin, Coffee, Wifi, Tv, Wind, Check } from 'lucide-react';

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const [checkOut, setCheckOut] = useState(tomorrow.toISOString().split('T')[0]);
  const [guestCount, setGuestCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');

  // Review Form State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchRoomDetail = async () => {
    try {
      const res = await axios.get(`/api/rooms/${id}`);
      setRoom(res.data);
    } catch (error) {
      console.error('Error fetching room detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-xs font-bold">Đang tải thông tin phòng cao cấp...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="text-center space-y-3.5 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-sm">
          <h2 className="text-xl font-bold text-slate-900">Phòng Không Tồn Tại</h2>
          <p className="text-slate-500 text-xs">Phòng bạn đang tìm kiếm có thể đã được thay đổi hoặc xóa khỏi hệ thống.</p>
          <Link to="/rooms" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm">
            ← Quay lại danh sách phòng
          </Link>
        </div>
      </div>
    );
  }

  // Calculate nights
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const totalPrice = nights * room.price_per_night;

  // Kiểm tra xung đột ngày đặt phòng theo từng khoảng thời gian
  const bookedRanges = room.booked_ranges || [];
  const conflictingBooking = bookedRanges.find(b => {
    return checkIn < b.check_out && checkOut > b.check_in;
  });
  const isDateConflicted = !!conflictingBooking;
  const isMaintenance = room.is_available === 0;
  const isOccupiedToday = room.occupancy_status === 'OCCUPIED' || room.is_occupied;

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (isMaintenance) {
      alert('Phòng này hiện đang tạm ngưng bảo trì, vui lòng chọn phòng khác!');
      return;
    }
    if (!checkIn || !checkOut) {
      alert('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }
    if (checkOut <= checkIn) {
      alert('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm!');
      return;
    }
    if (isDateConflicted) {
      alert(`Khoảng ngày bạn chọn bị trùng với lịch đã có khách đặt (${conflictingBooking.check_in} → ${conflictingBooking.check_out}). Vui lòng chọn các ngày khác còn trống!`);
      return;
    }
    navigate('/checkout', {
      state: {
        room,
        checkIn,
        checkOut,
        nights,
        totalPrice,
        guestCount,
        specialRequests
      }
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      await axios.post('/api/reviews', {
        roomId: room.id,
        rating: newRating,
        comment: newComment
      });
      setNewComment('');
      fetchRoomDetail();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <Link to="/rooms" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 text-xs font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách phòng</span>
        </Link>

        {/* Gallery Section */}
        <div className="space-y-3.5">
          <div className="relative h-[420px] sm:h-[500px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
            <img
              src={room.images?.[activeImage] || room.images?.[0]}
              alt={room.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            
            {/* Top dark gradient vignette */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/40 text-blue-800 text-xs font-black shadow-sm flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{room.location || 'Phú Quốc'}</span>
              <span className="text-slate-300">|</span>
              <span>{room.room_type_name}</span>
            </div>
            
            {/* Real-time Status Badge */}
            <div className="absolute top-4 right-4">
              {isMaintenance ? (
                <span className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600/95 text-white shadow-lg flex items-center gap-2 border border-rose-300 backdrop-blur-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span>ĐANG BẢO TRÌ</span>
                </span>
              ) : isOccupiedToday ? (
                <span className="px-4 py-2 rounded-xl text-xs font-black bg-amber-600/95 text-white shadow-lg flex items-center gap-2 border border-amber-300 backdrop-blur-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  <span>HÔM NAY CÓ KHÁCH (VẪN NHẬN ĐẶT CÁC NGÀY KHÁC)</span>
                </span>
              ) : (
                <span className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600/95 text-white shadow-lg flex items-center gap-2 border border-emerald-300 backdrop-blur-md animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>CÒN PHÒNG TRỐNG</span>
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {room.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {room.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-16 sm:w-28 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImage === idx ? 'border-blue-600 scale-105 shadow-md ring-2 ring-blue-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Details & Booking Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Specs & Description & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-extrabold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                  {room.hotel_name || 'VnStay Resort & Hotel'}
                </span>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 px-2.5 py-0.5 rounded-lg text-xs font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{room.rating} / 5.0</span>
                </div>
                <span className="text-slate-500 text-xs font-semibold">({room.review_count || 128} đánh giá thực tế)</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">
                {room.name}
              </h1>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-3.5 p-5 bg-white rounded-2xl border border-slate-200 text-xs shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Sức chứa</span>
                    <span className="font-extrabold text-slate-900 text-sm">{room.capacity} Khách</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Giường ngủ</span>
                    <span className="font-extrabold text-slate-900 text-sm">{room.bed_count} Giường lớn</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Diện tích</span>
                    <span className="font-extrabold text-slate-900 text-sm">{room.size_sqm} m²</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-3xl space-y-3 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900">Mô Tả Chi Tiết Không Gian</h3>
              <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line font-medium">
                {room.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-3xl space-y-4 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900">Tiện Nghi & Dịch Vụ Nghỉ Dưỡng</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities?.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-3xl space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Đánh Giá Từ Khách Hàng ({room.reviews?.length || 0})</span>
                </h3>
              </div>

              {/* Add review form if logged in */}
              {user ? (
                <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3.5">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Viết Đánh Giá Của Bạn</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-bold">Chọn số sao:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 text-amber-400 focus:outline-none cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ nhận xét thực tế của bạn về không gian phòng, dịch vụ..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Đánh Giá Ngay</span>
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  Vui lòng <Link to="/login" className="text-blue-600 underline font-extrabold">Đăng nhập</Link> để viết đánh giá trải nghiệm cho phòng này.
                </p>
              )}

              {/* Reviews List */}
              <div className="space-y-3.5">
                {room.reviews?.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                          {rev.user_name ? rev.user_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-extrabold text-slate-900 text-xs">{rev.user_name}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed font-medium pl-9">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block font-semibold pl-9">{new Date(rev.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-3xl sticky top-24 space-y-5 shadow-xl ring-1 ring-black/5">
              
              {/* Price header */}
              <div className="pb-4 border-b border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">Giá niêm yết</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-blue-700">{formatVND(room.price_per_night)}</span>
                    <span className="text-xs text-slate-500 font-semibold">/ đêm</span>
                  </div>
                </div>
                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg text-[10px] font-black">
                  -20% HÔM NAY
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                
                {/* Dates */}
                <div className="space-y-2.5">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                    <label className="text-[11px] text-slate-500 font-extrabold block mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ngày Nhận Phòng (Check-in)</span>
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="bg-transparent text-slate-900 font-bold text-xs w-full outline-none cursor-pointer"
                      required
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                    <label className="text-[11px] text-slate-500 font-extrabold block mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ngày Trả Phòng (Check-out)</span>
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="bg-transparent text-slate-900 font-bold text-xs w-full outline-none cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* Guest Count */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <label className="text-[11px] text-slate-500 font-extrabold block mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Số Lượng Khách Lưu Trú</span>
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="bg-transparent text-slate-900 font-bold text-xs w-full outline-none cursor-pointer"
                  >
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Khách
                      </option>
                    ))}
                  </select>
                </div>

                {/* Special Request */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                  <label className="text-[11px] text-slate-500 font-extrabold block">Yêu Cầu Đặc Biệt (Tùy chọn)</label>
                  <textarea
                    rows="2"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="VD: Phòng tầng cao, chuẩn bị hoa sinh nhật..."
                    className="w-full bg-transparent text-xs text-slate-800 outline-none resize-none font-medium"
                  />
                </div>

                {/* Realtime Price Calculation breakdown */}
                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>{formatVND(room.price_per_night)} x {nights} đêm</span>
                    <span>{formatVND(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Thuế & Phí dịch vụ resort</span>
                    <span className="text-emerald-600 font-bold">Đã bao gồm (0đ)</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200/80 flex justify-between items-baseline font-black text-slate-900 text-sm">
                    <span>Tổng Tiền:</span>
                    <span className="text-blue-700 text-xl font-black">{formatVND(totalPrice)}</span>
                  </div>
                </div>

                {/* Occupied Today Notice */}
                {isOccupiedToday && room.current_stay && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-1">
                    <div className="font-extrabold flex items-center gap-1.5 text-xs text-amber-800">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Hôm Nay Phòng Đang Có Khách Ở</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                      Khách hiện tại sẽ trả phòng vào ngày <strong>{room.current_stay.check_out}</strong>. Quý khách có thể đặt các ngày sau ngày này hoặc các ngày chưa có lịch!
                    </p>
                  </div>
                )}

                {/* Booked Schedule Box */}
                {bookedRanges.length > 0 && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Các đợt phòng đã có lịch đặt ({bookedRanges.length}):</span>
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {bookedRanges.map((rng, i) => (
                        <div key={i} className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] flex items-center justify-between font-mono">
                          <span className="text-rose-600 font-bold">⛔ {rng.check_in} → {rng.check_out}</span>
                          <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Đã đặt</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 italic">
                      💡 Bạn có thể đặt bất kỳ ngày nào khác ngoài các khoảng thời gian trên!
                    </p>
                  </div>
                )}

                {/* Live Overlap Check Status Notice */}
                {checkIn && checkOut && (
                  <div>
                    {checkOut <= checkIn ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-1.5">
                        <span>⚠️ Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm!</span>
                      </div>
                    ) : isDateConflicted ? (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs space-y-1">
                        <div className="font-extrabold flex items-center gap-1.5 text-rose-700">
                          <span className="w-2 h-2 rounded-full bg-rose-600" />
                          <span>Trùng Lịch Đã Có Khách Đặt</span>
                        </div>
                        <p className="text-[11px] text-rose-600 leading-relaxed font-medium">
                          Khoảng ngày bạn chọn bị trùng với lịch đặt từ <strong>{conflictingBooking.check_in}</strong> đến <strong>{conflictingBooking.check_out}</strong>. Quý khách vui lòng chọn khoảng ngày khác còn trống!
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-[11px]">
                          Khoảng ngày {checkIn} → {checkOut} hoàn toàn còn trống! Bạn có thể đặt ngay.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit button */}
                {isMaintenance ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      className="w-full py-3.5 rounded-2xl font-bold text-xs bg-slate-200 text-slate-500 cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <span>Phòng Đang Tạm Dừng Bảo Trì</span>
                    </button>
                    <Link
                      to="/rooms"
                      className="block text-center text-xs font-bold text-blue-600 hover:underline pt-1"
                    >
                      Tìm phòng còn trống khác →
                    </Link>
                  </div>
                ) : isDateConflicted || (checkOut <= checkIn) ? (
                  <button
                    type="submit"
                    disabled
                    className="w-full py-3.5 rounded-2xl font-bold text-xs bg-slate-300 text-slate-600 cursor-not-allowed flex items-center justify-center gap-1.5 shadow-none"
                  >
                    <span>{checkOut <= checkIn ? 'Chọn Ngày Nhận / Trả Hợp Lệ' : 'Trùng Lịch - Vui Lòng Chọn Ngày Khác'}</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Tiến Hành Đặt Phòng Ngay</span>
                  </button>
                )}
              </form>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Miễn phí hủy phòng trước 48h • Xác nhận tức thì</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
