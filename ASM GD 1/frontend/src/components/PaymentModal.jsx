import React, { useState, useEffect } from 'react';
import { 
  X, QrCode, CheckCircle2, ShieldCheck, Loader2, Building2, 
  Copy, Check, Smartphone, XCircle, AlertTriangle
} from 'lucide-react';
import axios from 'axios';

export default function PaymentModal({ booking, method: initialMethod = 'VNPAY', onClose, onSuccess }) {
  // Normalize method
  const getInitialTab = () => {
    if (initialMethod === 'PAY_AT_HOTEL') return 'PAY_AT_HOTEL';
    return 'VNPAY';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const [copiedKey, setCopiedKey] = useState(null);

  // Payment receiver settings (Real bank VietQR)
  const [config, setConfig] = useState({
    bankId: 'MB',
    bankName: 'MBBank - Ngân hàng Quân Đội',
    accountNo: '0355133380',
    accountName: 'DANG QUOC TOAN'
  });

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Fetch saved payment configuration from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('/api/payment-config');
        if (res.data) {
          setConfig(res.data);
        }
      } catch (err) {
        console.warn('Using default payment config:', err);
      }
    };
    fetchConfig();
  }, []);

  // 15-minute countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tự động báo thanh toán thất bại nếu hết thời gian 15 phút
  useEffect(() => {
    if (timeLeft === 0 && !completed && activeTab !== 'PAY_AT_HOTEL') {
      axios.post(`/api/bookings/${booking.id}/payment-failed`, {
        reason: 'Hết thời gian chờ thanh toán (Timeout 15 phút)'
      }).catch(() => {});
    }
  }, [timeLeft, completed, activeTab, booking.id]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Copy to clipboard helper
  const handleCopy = (text, key) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Confirm payment in system
  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const paymentMethodName = activeTab === 'VNPAY' ? 'VNPAY_VIETQR' : 'PAY_AT_HOTEL';

      const res = await axios.post(`/api/bookings/${booking.id}/pay`, { 
        method: paymentMethodName,
        note: 'REAL_TRANSFER_CONFIRMED'
      });

      setLoading(false);
      setCompleted(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(res.data);
      }, 1500);
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
      alert('Có lỗi xảy ra trong quá trình xác nhận thanh toán. Vui lòng thử lại!');
    }
  };

  // Báo thanh toán thất bại về Admin
  const handleReportPaymentFailed = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn báo giao dịch thanh toán thất bại cho đơn này đến Quản Trị Viên / Lễ Tân?')) return;
    setLoading(true);
    try {
      await axios.post(`/api/bookings/${booking.id}/payment-failed`, {
        reason: 'Khách hàng gặp sự cố chuyển khoản / báo lỗi thanh toán'
      });
      alert('Hệ thống đã ghi nhận và gửi thông báo thanh toán thất bại tới Quản Trị Viên!');
      onClose();
    } catch (error) {
      console.error('Report payment failed error:', error);
      alert('Có lỗi xảy ra khi gửi báo cáo');
    } finally {
      setLoading(false);
    }
  };

  // Content for transfer
  const transferContent = `VnStay ${booking.id}`;

  // Real VietQR URL (supported natively by VNPay & all 54+ VN Banks)
  const vietQrUrl = `https://img.vietqr.io/image/${config.bankId}-${config.accountNo}-compact2.png?amount=${booking.total_price}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(config.accountName)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative text-slate-800 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white text-sm font-extrabold flex items-center gap-2">
                Cổng Thanh Toán Tiền Thật 100%
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  Trực Tuyến 24/7
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Giao dịch tức thì qua Ứng dụng Ngân Hàng hoặc VNPay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Methods Tab */}
        <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-bold gap-1">
          <button
            onClick={() => setActiveTab('VNPAY')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'VNPAY'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>VNPay & VietQR 24/7 (Quét Mọi Ngân Hàng)</span>
          </button>

          <button
            onClick={() => setActiveTab('PAY_AT_HOTEL')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'PAY_AT_HOTEL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Thanh Toán Tại Khách Sạn</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {completed ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-amber-50 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto text-amber-600 animate-pulse">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900">Đã Gửi Báo Cáo Chuyển Tiền!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Hệ thống đã gửi thông báo giao dịch đơn <span className="font-mono text-blue-600 font-bold">#{booking.id}</span> tới Admin Khách Sạn.
              </p>
              <div className="inline-block bg-amber-50 border border-amber-300 rounded-xl px-4 py-2 text-xs text-amber-900 font-bold">
                ⏳ Trạng thái: CHỜ ADMIN KIỂM TRA TIỀN & XÁC NHẬN
              </div>
              <p className="text-[11px] text-slate-500">
                Admin sẽ kiểm tra biến động số dư tài khoản ngân hàng và xác nhận duyệt đơn cho bạn. Đang chuyển tới danh sách đặt phòng...
              </p>
            </div>
          ) : (
            <>
              {/* Order Quick Summary */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Mã đơn đặt phòng:</span>
                  <span className="font-mono font-bold text-slate-900">#{booking.id}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Khách lưu trú:</span>
                  <span className="font-semibold text-slate-900">{booking.guest_name} ({booking.guest_phone})</span>
                </div>
                <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Tổng tiền cần thanh toán:</span>
                  <span className="text-lg font-black text-rose-600">
                    {formatVND(booking.total_price)}
                  </span>
                </div>
              </div>

              {/* TAB 1: VNPAY / VIETQR REAL BANKING */}
              {activeTab === 'VNPAY' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-blue-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                        VN
                      </div>
                      <div>
                        <h4 className="text-xs font-bold">VNPay & VietQR Napas 24/7</h4>
                        <p className="text-[11px] text-blue-700">Hỗ trợ app VNPay và tất cả 54+ ngân hàng Việt Nam</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-[10px] font-bold">
                      Tự động điền 100%
                    </span>
                  </div>

                  {/* VietQR Code */}
                  <div className="text-center bg-white p-3.5 rounded-xl border-2 border-blue-200 shadow-sm space-y-2">
                    <div className="inline-block p-1 bg-white rounded-lg border border-slate-200 shadow-xs">
                      <img
                        src={vietQrUrl}
                        alt="VietQR Standard Banking QR"
                        className="w-56 h-56 mx-auto object-contain"
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                      <span>Mở app <strong>VNPay</strong> hoặc <strong>App Ngân Hàng</strong> bất kỳ để quét mã</span>
                    </div>
                  </div>

                  {/* Banking Details with 1-click copy */}
                  <div className="space-y-2 text-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Thông tin tài khoản ngân hàng thụ hưởng</p>
                    
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Ngân hàng</span>
                        <span className="font-bold text-slate-900 text-xs">{config.bankName} ({config.bankId})</span>
                      </div>
                      <button
                        onClick={() => handleCopy(config.bankName, 'bankName')}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-bold text-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {copiedKey === 'bankName' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                        <span>{copiedKey === 'bankName' ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Số tài khoản</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{config.accountNo}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(config.accountNo, 'accountNo')}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-bold text-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {copiedKey === 'accountNo' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                        <span>{copiedKey === 'accountNo' ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Tên chủ tài khoản</span>
                        <span className="font-bold text-slate-900">{config.accountName}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(config.accountName, 'accountName')}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-bold text-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {copiedKey === 'accountName' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                        <span>{copiedKey === 'accountName' ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>

                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-amber-700 block font-bold">Nội dung chuyển khoản (bắt buộc)</span>
                        <span className="font-mono font-bold text-slate-900">{transferContent}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(transferContent, 'bankContent')}
                        className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-[11px] font-bold text-amber-800 flex items-center gap-1 transition-colors"
                      >
                        {copiedKey === 'bankContent' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-amber-700" />}
                        <span>{copiedKey === 'bankContent' ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PAY AT HOTEL */}
              {activeTab === 'PAY_AT_HOTEL' && (
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Thanh Toán Trực Tiếp Tại Lễ Tân</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                      Quý khách có thể lựa chọn thanh toán bằng tiền mặt hoặc quẹt thẻ khi đến nhận phòng tại quầy Lễ tân Resort.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs">
                    <span className="text-slate-500 block">Số tiền thanh toán khi nhận phòng:</span>
                    <strong className="text-base text-emerald-700">{formatVND(booking.total_price)}</strong>
                  </div>
                </div>
              )}

              {/* Countdown timer */}
              <div className="text-center text-xs text-slate-500">
                Giao dịch hết hạn sau: <span className="font-mono font-bold text-slate-900">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang Kiểm Tra & Xác Nhận Giao Dịch...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{activeTab === 'PAY_AT_HOTEL' ? 'Xác Nhận Đặt Phòng (Trả Sau)' : 'Tôi Đã Chuyển Khoản Thành Công'}</span>
                    </>
                  )}
                </button>

                {activeTab !== 'PAY_AT_HOTEL' && (
                  <button
                    onClick={handleReportPaymentFailed}
                    disabled={loading}
                    className="w-full py-2 rounded-xl font-bold text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Gặp Sự Cố / Báo Thanh Toán Thất Bại Cho Admin</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
