import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, QrCode, Clock, CheckCircle2, XCircle, AlertCircle, Sparkles, Building2 } from 'lucide-react';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

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

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã Xác Nhận & Thanh Toán
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
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => setSelectedVoucher(booking)}
                          className="w-full py-1.5 px-3 rounded-lg font-bold text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5 text-blue-600" />
                          <span>Mã Vé E-Voucher</span>
                        </button>
                      )}

                      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="w-full py-1.5 px-3 rounded-lg font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                        >
                          Hủy Đơn Đặt
                        </button>
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
    </div>
  );
}
