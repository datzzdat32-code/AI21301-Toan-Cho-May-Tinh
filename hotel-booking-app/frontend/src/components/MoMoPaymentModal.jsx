import React, { useState, useEffect } from 'react';
import { X, ExternalLink, CheckCircle2, ShieldCheck, Loader2, QrCode, Smartphone } from 'lucide-react';
import axios from 'axios';

export default function MoMoPaymentModal({ booking, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút đếm ngược

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  useEffect(() => {
    // 1. Khởi tạo mã thanh toán MoMo qua API Gateway
    const initMoMoPayment = async () => {
      try {
        setLoading(true);
        const res = await axios.post('/api/payments/momo/create', { bookingId: booking.id });
        setPaymentData(res.data);
      } catch (err) {
        console.error('Error creating MoMo payment:', err);
      } finally {
        setLoading(false);
      }
    };

    if (booking?.id) {
      initMoMoPayment();
    }
  }, [booking]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleConfirmPaid = async () => {
    setConfirming(true);
    try {
      await axios.post(`/api/bookings/${booking.id}/pay`, { method: 'MOMO_QR' });
      onSuccess();
    } catch (error) {
      alert('Có lỗi khi kiểm tra giao dịch MoMo. Vui lòng thử lại!');
      setConfirming(false);
    }
  };

  const [qrMode, setQrMode] = useState('vietqr'); // 'vietqr' | 'gateway'

  // QR Code URL hiển thị:
  // 1. VietQR liên thông Ví MoMo: App MoMo cá nhân quét nhận diện chuyển khoản ngay
  // 2. Cổng MoMo Gateway QR: camera quét mở cổng thanh toán MoMo Developer
  const vietQrUrl = paymentData?.vietQrUrl || 
    `https://img.vietqr.io/image/970422-0901234567-compact2.png?amount=${booking.total_price}&addInfo=${encodeURIComponent(booking.booking_code || ('BK' + booking.id))}&accountName=VNSTAY%20RESORT`;

  const gatewayQrUrl = paymentData?.payUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentData.payUrl)}`
    : vietQrUrl;

  const currentQrUrl = qrMode === 'vietqr' ? vietQrUrl : gatewayQrUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* MoMo Header */}
        <div className="bg-[#A50064] text-white px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-sm">
              M
            </div>
            <div>
              <h3 className="text-sm font-extrabold leading-none">Thanh Toán Qua Ví MoMo</h3>
              <span className="text-[10px] text-pink-200 font-medium">MoMo Wallet Official Gateway</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-pink-200 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Order Summary */}
          <div className="bg-pink-50/70 border border-pink-200/60 p-4 rounded-2xl space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Mã đơn đặt phòng:</span>
              <span className="font-mono font-bold text-slate-900">#{booking.booking_code || booking.id}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Khách lưu trú:</span>
              <span className="font-bold text-slate-800">{booking.guest_name}</span>
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-pink-200/40">
              <span className="font-semibold text-slate-700">Số tiền cần thanh toán:</span>
              <span className="text-lg font-black text-[#A50064]">
                {formatVND(booking.total_price)}
              </span>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setQrMode('vietqr')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                qrMode === 'vietqr'
                  ? 'bg-white text-[#A50064] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Quét App MoMo / Banking
            </button>
            <button
              onClick={() => setQrMode('gateway')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                qrMode === 'gateway'
                  ? 'bg-white text-[#A50064] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cổng MoMo Gateway QR
            </button>
          </div>

          {/* QR Code Container */}
          <div className="text-center space-y-3 pt-1">
            <div className="relative inline-block bg-white p-3.5 rounded-2xl border-2 border-pink-500 shadow-md">
              {loading ? (
                <div className="w-48 h-48 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#A50064]" />
                </div>
              ) : (
                <img
                  src={currentQrUrl}
                  alt="MoMo Payment QR Code"
                  className="w-48 h-48 mx-auto object-contain rounded-xl"
                />
              )}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#A50064] text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                {qrMode === 'vietqr' ? 'Mở App MoMo Quét Mã' : 'MoMo Gateway URL'}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] text-slate-600 font-medium flex items-center justify-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-[#A50064]" />
                {qrMode === 'vietqr'
                  ? <>Mở ứng dụng <strong>Ví MoMo</strong> trên điện thoại để quét mã chuyển tiền</>
                  : <>Quét mã để truy cập trực tiếp <strong>Cổng thanh toán MoMo Sandbox</strong></>}
              </p>
              <p className="text-xs text-[#A50064] font-medium">
                Mã hết hạn trong: <span className="font-mono font-bold text-slate-900">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2 pt-2">
            {paymentData?.payUrl && (
              <a
                href={paymentData.payUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-1.5 transition-all border border-slate-200"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#A50064]" />
                <span>Mở Cổng Thanh Toán MoMo Gateway</span>
              </a>
            )}

            <button
              onClick={handleConfirmPaid}
              disabled={confirming}
              className="w-full py-3.5 rounded-xl font-bold text-xs bg-[#A50064] hover:bg-[#880052] text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {confirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Xác Nhận Giao Dịch...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tôi Đã Hoàn Tất Chuyển Khoản / Quét Mã</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Thanh toán bảo mật trực tiếp qua MoMo Payment Gateway</span>
          </div>

        </div>

      </div>
    </div>
  );
}
