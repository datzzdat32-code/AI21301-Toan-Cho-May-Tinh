import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, QrCode, Clock, CheckCircle2, XCircle, AlertCircle, Sparkles, Building2, ShieldCheck, CreditCard, RotateCcw, X } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

const POPULAR_BANKS = [
  { id: 'MB', name: 'MBBank - Ngân hàng Quân Đội' },
  { id: 'VCB', name: 'Vietcombank - Ngoại Thương Việt Nam' },
  { id: 'TCB', name: 'Techcombank - Kỹ Thương' },
  { id: 'ICB', name: 'VietinBank - Công Thương' },
  { id: 'BIDV', name: 'BIDV - Đầu Tư & Phát Triển' },
  { id: 'ACB', name: 'ACB - Á Châu' },
  { id: 'VPB', name: 'VPBank - Việt Nam Thịnh Vượng' },
  { id: 'TPB', name: 'TPBank - Tiên Phong' },
  { id: 'STB', name: 'Sacombank - Sài Gòn Thương Tín' },
  { id: 'VBA', name: 'Agribank - Nông Nghiệp & PTNT' },
  { id: 'VIB', name: 'VIB - Quốc Tế' },
  { id: 'MSB', name: 'MSB - Hàng Hải' }
];

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [paymentBooking, setPaymentBooking] = useState(null);

  // Refund request state
  const [refundBooking, setRefundBooking] = useState(null);
  const [refundForm, setRefundForm] = useState({
    refund_bank: 'MB',
    refund_account_no: '',
    refund_account_name: '',
    refund_reason: 'Thay đổi kế hoạch cá nhân'
  });
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const fetchMyBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/my-bookings');
      setBookings(res.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt phòng này?')) return;
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`);
      alert('Đã hủy đơn đặt phòng thành công');
      fetchMyBookings();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi hủy đơn');
    }
  };

  const handleOpenRefundModal = (booking) => {
    setRefundBooking(booking);
    setRefundForm({
      refund_bank: 'MB',
      refund_account_no: '',
      refund_account_name: (booking.guest_name || user?.name || '').toUpperCase(),
      refund_reason: 'Thay đổi kế hoạch công tác / cá nhân'
    });
  };

  const handleSubmitRefund = async (e) => {
    e.preventDefault();
    if (!refundForm.refund_account_no.trim() || !refundForm.refund_account_name.trim()) {
      alert('Vui lòng nhập đầy đủ Số tài khoản và Tên chủ tài khoản nhận tiền hoàn!');
      return;
    }
    setSubmittingRefund(true);
    try {
      const res = await axios.post(`/api/bookings/${refundBooking.id}/request-refund`, refundForm);
      alert(res.data.message);
      setRefundBooking(null);
      fetchMyBookings();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi gửi yêu cầu hoàn tiền');
    } finally {
      setSubmittingRefund(false);
    }
  };

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã Được Admin Xác Nhận & Thanh Toán
          </span>
        );
      case 'AWAITING_PAYMENT_CONFIRMATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
            Chờ Admin Kiểm Tra Tiền & Duyệt
          </span>
        );
      case 'PAYMENT_FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Chưa Nhận Được Tiền (Thanh Toán Lại)
          </span>
        );
      case 'REFUND_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Chờ Admin Chuyển Tiền Hoàn Trả
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            Đã Chuyển Tiền Hoàn Trả (Đã Hủy)
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Chờ Thanh Toán / Nhận Phòng
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Đã Hủy Đơn
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            Đã Hoàn Thành Nghỉ Dưỡng
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Lịch Sử Đặt Phòng Của Tôi</h1>
            <p className="text-slate-500 text-xs mt-1">Quản lý trạng thái vé nhận phòng, e-voucher và chi tiết giao dịch.</p>
          </div>
          <Link
            to="/rooms"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors self-start"
          >
            + Đặt Thêm Phòng Mới
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white h-44 rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <AlertCircle className="w-14 h-14 text-blue-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Chưa Có Đơn Đặt Phòng Nào</h3>
            <p className="text-xs text-slate-500">Bạn chưa thực hiện bất kỳ giao dịch đặt phòng nào tại Grand Horizon Resort.</p>
            <Link
              to="/rooms"
              className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm"
            >
              Khám Phá Danh Sách Phòng Ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-300 transition-all space-y-5"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-blue-700 text-xs font-bold bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                      #{booking.id}
                    </span>
                    <span className="text-slate-400 text-xs font-medium">
                      Ngày tạo: {new Date(booking.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div>{getStatusBadge(booking.status)}</div>
                </div>

                {/* Body details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-center">
                  
                  {/* Image */}
                  <div className="md:col-span-1">
                    <img
                      src={booking.room_images?.[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=400&q=80'}
                      alt={booking.room_name}
                      className="w-full h-28 rounded-xl object-cover border border-slate-200"
                    />
                  </div>

                  {/* Info */}
                  <div className="md:col-span-2 space-y-1.5 text-xs">
                    <h3 className="text-base font-bold text-slate-900">{booking.room_name}</h3>
                    <p className="text-slate-500 font-medium">Loại phòng: <span className="text-blue-700 font-bold">{booking.room_type_name}</span></p>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700 font-medium">
                      <div>Nhận phòng: <strong className="text-slate-900 block">{booking.check_in}</strong></div>
                      <div>Trả phòng: <strong className="text-slate-900 block">{booking.check_out}</strong></div>
                    </div>

                    <div className="text-slate-500 pt-0.5">
                      Khách đăng ký: <strong className="text-slate-800">{booking.guest_name}</strong> ({booking.guest_phone})
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="md:col-span-1 text-left md:text-right space-y-2.5">
                    <div>
                      <span className="text-[11px] text-slate-500 block font-medium">Tổng thanh toán</span>
                      <span className="text-lg font-extrabold text-blue-700">{formatVND(booking.total_price)}</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {booking.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setPaymentBooking(booking)}
                            className="w-full py-1.5 px-3 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Thanh Toán Ngay (VNPay/VietQR)</span>
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="w-full py-1.5 px-3 rounded-lg font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                          >
                            Hủy Đơn Đặt
                          </button>
                        </>
                      )}

                      {booking.status === 'AWAITING_PAYMENT_CONFIRMATION' && (
                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-300 text-xs text-amber-900 space-y-1">
                          <p className="font-bold flex items-center gap-1 text-[11px] text-amber-950">
                            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0 animate-spin" />
                            <span>Đã Báo Chuyển Khoản - Chờ Admin Duyệt</span>
                          </p>
                          <p className="text-[10px] text-amber-800 leading-tight">
                            Admin đang kiểm tra tài khoản ngân hàng để xác nhận số tiền <strong className="text-amber-950">{formatVND(booking.total_price)}</strong>. Vé nhận phòng sẽ tự động kích hoạt ngay khi Admin duyệt tiền.
                          </p>
                        </div>
                      )}

                      {booking.status === 'PAYMENT_FAILED' && (
                        <div className="space-y-1.5">
                          <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-300 text-xs text-rose-900 space-y-1">
                            <p className="font-bold flex items-center gap-1 text-[11px] text-rose-950">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>Admin Chưa Nhận Được Tiền</span>
                            </p>
                            <p className="text-[10px] text-rose-700 leading-tight">
                              Admin kiểm tra chưa thấy giao dịch vào tài khoản. Quý khách vui lòng quét lại mã VietQR để thanh toán lại.
                            </p>
                          </div>
                          <button
                            onClick={() => setPaymentBooking(booking)}
                            className="w-full py-1.5 px-3 rounded-lg font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Quét Lại Mã VietQR</span>
                          </button>
                        </div>
                      )}

                      {booking.status === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => setSelectedVoucher(booking)}
                            className="w-full py-1.5 px-3 rounded-lg font-bold text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-blue-600" />
                            <span>Mã Vé E-Voucher</span>
                          </button>
                          <button
                            onClick={() => handleOpenRefundModal(booking)}
                            className="w-full py-1.5 px-3 rounded-lg font-bold text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Đã chuyển khoản nhưng muốn hủy phòng và nhận lại tiền"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                            <span>Yêu Cầu Hủy & Hoàn Tiền</span>
                          </button>
                        </>
                      )}

                      {booking.status === 'REFUND_REQUESTED' && (
                        <div className="bg-amber-50/90 p-2.5 rounded-xl border border-amber-300 text-xs text-amber-900 space-y-1">
                          <p className="font-bold flex items-center gap-1 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-spin" />
                            <span>Đã Gửi Yêu Cầu Hoàn Tiền</span>
                          </p>
                          <p className="text-[10px] text-amber-700 leading-tight">
                            Admin đang xử lý chuyển trả <strong className="text-amber-900">{formatVND(booking.total_price)}</strong> về STK: <span className="font-mono font-bold text-blue-700">{booking.refund_account_no}</span> ({booking.refund_bank}).
                          </p>
                        </div>
                      )}

                      {booking.status === 'REFUNDED' && (
                        <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
                          <p className="font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>Đã Nhận Lại Tiền Thành Công</span>
                          </p>
                          <p className="text-[10px] text-purple-700 leading-tight">
                            Admin đã hoàn tất chuyển trả <strong className="text-purple-900">{formatVND(booking.total_price)}</strong> về tài khoản của bạn.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* E-Voucher Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Vé Nhận Phòng E-Voucher</h3>
            <p className="text-xs text-slate-500">Xuất trình mã QR này tại quầy Lễ tân Resort khi làm thủ tục Check-in</p>

            <div className="bg-white p-3 rounded-xl inline-block border-2 border-blue-600 shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GRAND_HORIZON_VOUCHER_${selectedVoucher.id}`}
                alt="E-Voucher QR"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-left border border-slate-200">
              <p className="text-slate-600 font-medium">Mã booking: <strong className="text-slate-900 font-mono font-bold">{selectedVoucher.id}</strong></p>
              <p className="text-slate-600 font-medium">Phòng: <strong className="text-blue-700 font-bold">{selectedVoucher.room_name}</strong></p>
              <p className="text-slate-600 font-medium">Ngày Check-in: <strong className="text-slate-900 font-bold">{selectedVoucher.check_in}</strong></p>
            </div>

            <button
              onClick={() => setSelectedVoucher(null)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            >
              Đóng Vé
            </button>
          </div>
        </div>
      )}
      {/* Payment Modal */}
      {paymentBooking && (
        <PaymentModal
          booking={paymentBooking}
          method="VNPAY"
          onClose={() => setPaymentBooking(null)}
          onSuccess={() => {
            setPaymentBooking(null);
            fetchMyBookings();
          }}
        />
      )}

      {/* REFUND REQUEST MODAL (CHO KHÁCH HÀNG ĐÃ THANH TOÁN MUỐN HỦY VÀ NHẬN LẠI TIỀN) */}
      {refundBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Yêu Cầu Hủy Phòng & Hoàn Tiền</h3>
                  <span className="text-[10px] text-slate-400">Đơn đặt phòng #{refundBooking.id}</span>
                </div>
              </div>
              <button onClick={() => setRefundBooking(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Refund Info Notice */}
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs space-y-1 text-amber-900">
              <p className="font-bold">Chính Sách Hoàn Tiền 100%:</p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Đơn phòng này đã thanh toán số tiền <strong className="text-blue-700 font-extrabold">{formatVND(refundBooking.total_price)}</strong>. Vui lòng cung cấp chính xác Số tài khoản ngân hàng của bạn, Quản trị viên sẽ quét mã QR chuyển trả lại 100% số tiền vào tài khoản này.
              </p>
            </div>

            <form onSubmit={handleSubmitRefund} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Ngân Hàng Nhận Tiền (*)</label>
                <select
                  value={refundForm.refund_bank}
                  onChange={(e) => setRefundForm({ ...refundForm, refund_bank: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold outline-none focus:border-blue-500"
                >
                  {POPULAR_BANKS.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Số Tài Khoản Ngân Hàng (*)</label>
                <input
                  type="text"
                  value={refundForm.refund_account_no}
                  onChange={(e) => setRefundForm({ ...refundForm, refund_account_no: e.target.value.trim() })}
                  placeholder="Nhập số tài khoản của bạn (VD: 0987654321)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold outline-none focus:border-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Tên Chủ Tài Khoản (* Viết hoa không dấu)</label>
                <input
                  type="text"
                  value={refundForm.refund_account_name}
                  onChange={(e) => setRefundForm({ ...refundForm, refund_account_name: e.target.value.toUpperCase() })}
                  placeholder="VD: NGUYEN VAN A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold uppercase outline-none focus:border-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Lý Do Hủy Phòng</label>
                <textarea
                  rows={2}
                  value={refundForm.refund_reason}
                  onChange={(e) => setRefundForm({ ...refundForm, refund_reason: e.target.value })}
                  placeholder="Thay đổi lịch trình công tác, bận việc đột xuất..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRefundBooking(null)}
                  className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="px-5 py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{submittingRefund ? 'Đang Gửi...' : 'Xác Nhận Gửi Yêu Cầu Hoàn Tiền'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
