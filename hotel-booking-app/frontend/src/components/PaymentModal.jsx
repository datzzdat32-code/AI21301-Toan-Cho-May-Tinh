import React, { useState, useEffect } from 'react';
import { X, QrCode, CheckCircle2, ShieldCheck, Loader2, CreditCard, Building2, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function PaymentModal({ booking, method, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/bookings/${booking.id}/pay`, { method });
      setLoading(false);
      setCompleted(true);
      setTimeout(() => {
        onSuccess(res.data);
      }, 1500);
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
      alert('Có lỗi xảy ra trong quá trình xử lý thanh toán. Vui lòng thử lại!');
    }
  };

  const getMethodTitle = () => {
    if (method === 'VNPAY') return 'Cổng Thanh Toán VNPay QR';
    if (method === 'MOMO_QR') return 'Ví Điện Tử MoMo QR';
    if (method === 'CREDIT_CARD') return 'Thẻ Tín Dụng Quốc Tế (Visa/Mastercard)';
    return 'Thanh Toán Tại Khách Sạn';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative text-slate-800">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2 text-blue-600 font-bold">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-slate-900 text-sm font-bold">{getMethodTitle()}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {completed ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Thanh Toán Thành Công!</h4>
              <p className="text-xs text-slate-600">
                Đơn đặt phòng <span className="font-mono text-blue-600 font-bold">#{booking.id}</span> đã được xác nhận.
              </p>
              <p className="text-[11px] text-slate-400">Đang chuyển tới trang chi tiết lịch sử...</p>
            </div>
          ) : (
            <>
              {/* Order Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Mã đơn đặt:</span>
                  <span className="font-mono font-bold text-slate-900">#{booking.id}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Khách hàng:</span>
                  <span className="font-semibold text-slate-800">{booking.guest_name}</span>
                </div>
                <div className="flex justify-between text-slate-500 items-baseline pt-1">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-base font-extrabold text-blue-700">
                    {formatVND(booking.total_price)}
                  </span>
                </div>
              </div>

              {/* QR Code / Form depending on method */}
              {method === 'VNPAY' || method === 'MOMO_QR' ? (
                <div className="text-center space-y-3">
                  <div className="bg-white p-3 rounded-xl inline-block shadow-md border-2 border-blue-200">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GRAND_HORIZON_BOOKING_${booking.id}_AMOUNT_${booking.total_price}`}
                      alt="Payment QR Code"
                      className="w-44 h-44 mx-auto"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-500">Quét mã QR bằng ứng dụng Ngân hàng hoặc {method === 'MOMO_QR' ? 'MoMo' : 'VNPay'}</p>
                    <p className="text-xs text-blue-600 font-medium">
                      Thời gian còn lại: <span className="font-mono font-bold text-slate-900">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                    </p>
                  </div>
                </div>
              ) : method === 'CREDIT_CARD' ? (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <label className="text-[11px] text-slate-500 font-bold">Số thẻ Visa / Mastercard (Demo)</label>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <input
                        type="text"
                        defaultValue="4111 2222 3333 4444"
                        readOnly
                        className="bg-transparent text-slate-800 font-mono text-xs w-full outline-none font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <label className="text-[10px] text-slate-500 block font-bold">Hạn thẻ</label>
                      <p className="font-mono text-slate-800 text-xs font-bold">12/28</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <label className="text-[10px] text-slate-500 block font-bold">CVV</label>
                      <p className="font-mono text-slate-800 text-xs font-bold">***</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center space-y-1.5">
                  <Building2 className="w-7 h-7 text-blue-600 mx-auto" />
                  <p className="text-xs text-slate-700 font-medium">
                    Bạn sẽ thanh toán số tiền <strong className="text-blue-700">{formatVND(booking.total_price)}</strong> trực tiếp tại quầy Lễ tân Resort khi nhận phòng.
                  </p>
                </div>
              )}

              {/* Trigger Button */}
              <button
                onClick={handleSimulatePayment}
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang Xử Lý Giao Dịch...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{method === 'PAY_AT_HOTEL' ? 'Xác Nhận Đặt Phòng Phục Vụ' : 'Giả Lập Quét Mã & Thanh Toán Ngay'}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
