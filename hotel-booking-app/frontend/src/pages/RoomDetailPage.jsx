import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star, Users, Bed, Maximize2, CheckCircle2, Calendar, ShieldCheck, MessageSquare, ArrowLeft, Send, Sparkles } from 'lucide-react';

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
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-xs font-semibold">Đang tải thông tin phòng cao cấp...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-bold">Phòng Không Tồn Tại</h2>
          <Link to="/rooms" className="text-blue-600 hover:underline text-xs font-semibold">← Quay lại danh sách phòng</Link>
        </div>
      </div>
    );
  }

  // Calculate nights
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const totalPrice = nights * room.price_per_night;

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      alert('Vui lòng chọn ngày nhận và trả phòng');
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
        <Link to="/rooms" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 text-xs font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách phòng</span>
        </Link>

        {/* Gallery Section */}
        <div className="space-y-3">
          <div className="relative h-[420px] sm:h-[480px] rounded-2xl overflow-hidden bg-slate-200 border border-slate-200 shadow-sm">
            <img
              src={room.images?.[activeImage] || room.images?.[0]}
              alt={room.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-lg border border-slate-200 text-blue-700 text-xs font-bold shadow-sm">
              {room.room_type_name}
            </div>
          </div>

          {/* Thumbnails */}
          {room.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {room.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === idx ? 'border-blue-600 scale-105 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
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
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 px-2.5 py-0.5 rounded-md text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{room.rating} / 5.0</span>
                </div>
                <span className="text-slate-500 text-xs">({room.review_count} đánh giá khách hàng)</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
                {room.name}
              </h1>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-slate-200 text-xs shadow-sm">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-500 block">Sức chứa</span>
                    <span className="font-bold text-slate-900">{room.capacity} Khách</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Bed className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-500 block">Giường ngủ</span>
                    <span className="font-bold text-slate-900">{room.bed_count} Giường lớn</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Maximize2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-500 block">Diện tích</span>
                    <span className="font-bold text-slate-900">{room.size_sqm} m²</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2.5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Mô Tả Chi Tiết Phòng</h3>
              <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">
                {room.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Tiện Nghi Dịch Vụ Đi Kèm</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {room.amenities?.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Đánh Giá Từ Khách Trải Nghiệm ({room.reviews?.length || 0})</span>
                </h3>
              </div>

              {/* Add review form if logged in */}
              {user ? (
                <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Viết Đánh Giá Của Bạn</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium">Chọn số sao:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-0.5 text-amber-400 focus:outline-none"
                      >
                        <Star className={`w-4 h-4 ${star <= newRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ nhận xét thực tế của bạn về không gian phòng, dịch vụ..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 rounded-lg font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Đánh Giá</span>
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  Vui lòng <Link to="/login" className="text-blue-600 underline font-bold">Đăng nhập</Link> để viết đánh giá cho phòng này.
                </p>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {room.reviews?.map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{rev.user_name}</span>
                      <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block font-medium">{new Date(rev.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl sticky top-24 space-y-5 shadow-sm">
              
              {/* Price header */}
              <div className="pb-3 border-b border-slate-100">
                <span className="text-xs text-slate-500 block font-medium">Giá phòng niêm yết</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-blue-600">{formatVND(room.price_per_night)}</span>
                  <span className="text-xs text-slate-500">/ đêm</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs">
                
                {/* Dates */}
                <div className="space-y-2.5">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[11px] text-slate-500 font-bold block mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Ngày Nhận Phòng (Check-in)
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="bg-transparent text-slate-800 font-bold text-xs w-full outline-none"
                      required
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[11px] text-slate-500 font-bold block mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Ngày Trả Phòng (Check-out)
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="bg-transparent text-slate-800 font-bold text-xs w-full outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Guest Count */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <label className="text-[11px] text-slate-500 font-bold block mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Số Lượng Khách Lưu Trú
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="bg-transparent text-slate-800 font-bold text-xs w-full outline-none cursor-pointer"
                  >
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Khách
                      </option>
                    ))}
                  </select>
                </div>

                {/* Special Request */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[11px] text-slate-500 font-bold block">Yêu Cầu Đặc Biệt (Tùy chọn)</label>
                  <textarea
                    rows="2"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="VD: Phòng tầng cao, chuẩn bị hoa sinh nhật..."
                    className="w-full bg-transparent text-xs text-slate-800 outline-none resize-none font-medium"
                  />
                </div>

                {/* Realtime Price Calculation breakdown */}
                <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>{formatVND(room.price_per_night)} x {nights} đêm</span>
                    <span>{formatVND(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Thuế & Phí dịch vụ resort</span>
                    <span className="text-emerald-600 font-bold">Đã bao gồm (0đ)</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200/80 flex justify-between items-baseline font-bold text-slate-900 text-sm">
                    <span>Tổng Tiền:</span>
                    <span className="text-blue-700 text-lg">{formatVND(totalPrice)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tiến Hành Đặt Phòng Ngay</span>
                </button>
              </form>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Miễn phí hủy phòng trước 48h</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
