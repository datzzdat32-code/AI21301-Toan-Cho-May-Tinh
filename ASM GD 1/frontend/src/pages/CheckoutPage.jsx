import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import { ShieldCheck, Calendar, Users, QrCode, CreditCard, Building2, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const state = location.state;

  if (!state || !state.room) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-bold">Không Tìm Thấy Đơn Đặt Phòng</h2>
          <Link to="/rooms" className="text-blue-600 hover:underline text-xs font-semibold">Quay lại danh sách phòng</Link>
        </div>
      </div>
    );
  }

  const { room, checkIn, checkOut, nights, totalPrice, guestCount, specialRequests: initialRequests } = state;

  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '0901234567');
  const [specialRequests, setSpecialRequests] = useState(initialRequests || '');
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');

  const [createdBooking, setCreatedBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      alert('Vui lòng điền đầy đủ họ tên, email và số điện thoại liên hệ');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/api/bookings', {
        roomId: room.id,
        checkIn,
        checkOut,
        guestCount,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        userId: user?.id
      });

      setCreatedBooking(res.data.booking);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Booking creation error:', error);
      alert(error.response?.data?.error || 'Không thể khởi tạo đơn đặt phòng. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    navigate('/my-bookings');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div>
          <Link to={`/rooms/${room.id}`} className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 text-xs font-semibold mb-3">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang chi tiết phòng</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Xác Nhận & Thanh Toán Đặt Phòng</h1>
          <p className="text-slate-500 text-xs">Vui lòng kiểm tra thông tin lưu trú và chọn phương thức thanh toán an toàn.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Customer Info & Payment Selector */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Customer details */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>Thông Tin Khách Lưu Trú</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-bold">Họ và Tên (*)</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-bold">Số Điện Thoại (*)</label>
                  <input
                    type="text"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-bold">Địa Chỉ Email Nhận Mã Vé (*)</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="khachhang@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-bold">Ghi Chú Yêu Cầu Cho Lễ Tân</label>
                <textarea
                  rows="2"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="VD: Nhận phòng sớm, chuẩn bị nôi em bé..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Step 2: Payment method selector */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Phương Thức Thanh Toán</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* VNPAY */}
                <label
                  onClick={() => setPaymentMethod('VNPAY')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'VNPAY'
                      ? 'bg-blue-50/80 border-blue-600 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <QrCode className="w-6 h-6 text-blue-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">VNPay QR Code</h4>
                    <p className="text-[11px] text-slate-500">Quét mã Banking tự động</p>
                  </div>
                </label>

                {/* MOMO */}
                <label
                  onClick={() => setPaymentMethod('MOMO_QR')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'MOMO_QR'
                      ? 'bg-blue-50/80 border-blue-600 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <QrCode className="w-6 h-6 text-pink-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Ví ĐT MoMo QR</h4>
                    <p className="text-[11px] text-slate-500">Thanh toán app MoMo nhanh</p>
                  </div>
                </label>

                {/* CREDIT CARD */}
                <label
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'bg-blue-50/80 border-blue-600 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-sky-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Thẻ Tín Dụng Quốc Tế</h4>
                    <p className="text-[11px] text-slate-500">Visa, Mastercard, JCB</p>
                  </div>
                </label>

                {/* PAY AT HOTEL */}
                <label
                  onClick={() => setPaymentMethod('PAY_AT_HOTEL')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'PAY_AT_HOTEL'
                      ? 'bg-blue-50/80 border-blue-600 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Building2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Thanh Toán Tại Quầy</h4>
                    <p className="text-[11px] text-slate-500">Trả tiền mặt khi Check-in</p>
                  </div>
                </label>

              </div>
            </div>

          </div>

          {/* Right: Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl sticky top-24 space-y-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Tóm Tắt Đặt Phòng
              </h3>

              {/* Room preview */}
              <div className="flex gap-3.5 items-center">
                <img
                  src={room.images?.[0]}
                  alt={room.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{room.name}</h4>
                  <span className="text-[11px] text-blue-600 font-bold">{room.room_type_name}</span>
                </div>
              </div>

              {/* Stay details */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Nhận phòng:
                  </span>
                  <span className="font-bold text-slate-900">{checkIn}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Trả phòng:
                  </span>
                  <span className="font-bold text-slate-900">{checkOut}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Số lượng khách:
                  </span>
                  <span className="font-bold text-slate-900">{guestCount} Khách</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Tổng số đêm:</span>
                  <span className="font-bold text-blue-600">{nights} Đêm</span>
                </div>
              </div>

              {/* Price total */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>Tổng Chi Phí:</span>
                  <span className="text-xl text-blue-700 font-extrabold">{formatVND(totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{submitting ? 'Đang Khởi Tạo...' : 'Xác Nhận & Thanh Toán'}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Bảo mật dữ liệu 256-bit SSL</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Payment Modal */}
      {showPaymentModal && createdBooking && (
        <PaymentModal
          booking={createdBooking}
          method={paymentMethod}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
