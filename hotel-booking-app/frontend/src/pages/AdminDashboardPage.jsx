import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, DollarSign, CalendarCheck, Hotel, TrendingUp, Plus, Search,
  UserCheck, CheckCircle2, XCircle, Clock, X, Sparkles, Building2, User, 
  CreditCard, Eye, RefreshCw, Filter, AlertCircle, Compass, Trash2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  
  // Navigation Tabs: overview, room_status, customers, rooms_manage, bookings
  const [activeTab, setActiveTab] = useState('overview'); 

  // States
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time Global Search Query in Admin Header
  const [searchQuery, setSearchQuery] = useState('');
  
  // Room Status Filter (ALL, AVAILABLE, OCCUPIED)
  const [roomFilterStatus, setRoomFilterStatus] = useState('ALL');

  // Customer Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Add Room Modal
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    room_number: '107',
    room_type_id: 'rt_deluxe',
    name: '',
    description: '',
    price_per_night: 2200000,
    capacity: 2,
    bed_count: 1,
    size_sqm: 45,
    images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
    amenities: ['Wifi Tốc độ cao', 'Ban công Hướng biển', 'Bồn tắm nằm', 'Ăn sáng miễn phí']
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, roomsRes, bookingsRes, customersRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/rooms'),
        axios.get('/api/admin/bookings'),
        axios.get('/api/admin/customers')
      ]);
      setStats(statsRes.data);
      setRooms(roomsRes.data);
      setBookings(bookingsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Phiên xác thực Admin đã hết hạn. Vui lòng nhấn Đăng Xuất và Đăng Nhập lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="text-center space-y-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <ShieldAlert className="w-14 h-14 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Truy Cập Bị Từ Chối</h2>
          <p className="text-slate-500 text-xs">Trang này chỉ dành cho tài khoản có quyền Quản Trị Viên (Admin).</p>
        </div>
      </div>
    );
  }

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/rooms', newRoom);
      alert('Thêm phòng mới thành công!');
      setShowAddRoomModal(false);
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi tạo phòng mới');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng này khỏi hệ thống?')) return;
    try {
      await axios.delete(`/api/admin/rooms/${roomId}`);
      fetchAdminData();
    } catch (error) {
      alert('Lỗi khi xóa phòng');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await axios.put(`/api/admin/bookings/${bookingId}/status`, { status: newStatus });
      fetchAdminData();
    } catch (error) {
      alert('Lỗi khi cập nhật đơn');
    }
  };

  // Filtered lists based on Global Search Query
  const filteredCustomers = customers.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = 
      r.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.room_type_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.current_guest && r.current_guest.guest_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (roomFilterStatus === 'AVAILABLE') return matchesSearch && r.occupancy_status === 'AVAILABLE';
    if (roomFilterStatus === 'OCCUPIED') return matchesSearch && r.occupancy_status === 'OCCUPIED';
    return matchesSearch;
  });

  const filteredBookings = bookings.filter(b =>
    b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.guest_phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.room_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.room_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Walk-in booking modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    room_id: '',
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    check_in: new Date().toISOString().split('T')[0],
    check_out: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    guest_count: 2,
    total_price: 2200000,
    payment_method: 'CASH'
  });

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/bookings/walk-in', walkInForm);
      alert('Tạo đơn đặt phòng tại quầy lễ tân thành công!');
      setShowWalkInModal(false);
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi tạo đơn tại quầy');
    }
  };

  const handleToggleMaintenance = async (roomId) => {
    try {
      const res = await axios.put(`/api/admin/rooms/${roomId}/toggle-maintenance`);
      alert(res.data.message);
      fetchAdminData();
    } catch (error) {
      alert('Lỗi khi đổi trạng thái phòng');
    }
  };

  const exportBookingsToCSV = () => {
    if (!bookings || bookings.length === 0) {
      alert('Không có dữ liệu đơn hàng để xuất báo cáo');
      return;
    }
    const headers = ['Mã Đơn', 'Khách Hàng', 'SĐT', 'Email', 'Tên Phòng', 'Số Phòng', 'Check In', 'Check Out', 'Tổng Tiền (VND)', 'Trạng Thái'];
    const rows = bookings.map(b => [
      b.id,
      `"${b.guest_name}"`,
      `"${b.guest_phone}"`,
      `"${b.guest_email}"`,
      `"${b.room_name}"`,
      b.room_number || '',
      b.check_in,
      b.check_out,
      b.total_price,
      b.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VnStay_BaoCaoDoanhThu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Title & Quick Search Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-blue-600 text-xs font-bold uppercase tracking-widest block mb-1">
                Hệ Thống Quản Trị Khách Sạn & Resort
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-7 h-7 text-blue-600" />
                <span>Dashboard Admin Báo Cáo</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  if (rooms.length > 0) {
                    setWalkInForm(prev => ({ ...prev, room_id: rooms[0].id, total_price: rooms[0].price_per_night * 2 }));
                  }
                  setShowWalkInModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>➕ Đặt Phòng Tại Quầy (Walk-in)</span>
              </button>

              <button
                onClick={exportBookingsToCSV}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                <span>📥 Xuất Báo Cáo CSV</span>
              </button>

              <button
                onClick={fetchAdminData}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 border border-slate-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* GLOBAL SEARCH BAR */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2.5">
            <Search className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Tìm kiếm nhanh theo Mã Khách Hàng (usr_...), Tên khách, Số điện thoại, Số phòng (101, 102), Mã đơn..."
              className="bg-transparent text-xs text-slate-800 outline-none w-full placeholder:text-slate-400 font-semibold"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-700 mr-1">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* MAIN MENU NAVIGATION TABS */}
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Thống Kê Doanh Thu</span>
            </button>

            <button
              onClick={() => setActiveTab('room_status')}
              className={`px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'room_status' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Trạng Thái Phòng (Trống / Đã Thuê)</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'customers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Mã KH & Khách Đã Thuê ({customers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'bookings' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Quản Lý Đơn Đặt ({bookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rooms_manage')}
              className={`px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'rooms_manage' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Hotel className="w-4 h-4" />
              <span>Quản Lý Phòng ({rooms.length})</span>
            </button>
          </div>

        </div>

        {/* OVERVIEW STATS CARDS */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Total Revenue */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>💰 Doanh Thu Đã Thu</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-emerald-600">{formatVND(stats.totalRevenue)}</p>
              <span className="text-[11px] text-slate-500 block font-medium">Dự kiến thu thêm: <strong className="text-blue-700">{formatVND(stats.pendingRevenue)}</strong></span>
            </div>

            {/* Total Bookings */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>📑 Tổng Đơn Đặt Phòng</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900">{stats.totalBookings} đơn</p>
              <span className="text-[11px] text-blue-600 font-bold">{stats.confirmedBookings} đơn đã xác nhận</span>
            </div>

            {/* Room Availability */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>🟢 Phòng Trống vs 🔴 Đã Thuê</span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-emerald-600">{stats.availableRoomsCount} Trống</span>
                <span className="text-slate-300 text-sm">/</span>
                <span className="text-lg font-bold text-rose-600">{stats.occupiedRoomsCount} Đã thuê</span>
              </div>
              <span className="text-[11px] text-slate-500 block font-medium">Tỷ lệ lấp đầy: <strong className="text-blue-700">{stats.occupancyRate}%</strong></span>
            </div>

            {/* Total Customers */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>🆔 Khách Hàng Lưu Trú</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900">{customers.length} Khách hàng</p>
              <span className="text-[11px] text-purple-600 font-bold">Đã đăng ký hệ thống</span>
            </div>

          </div>
        )}

        {/* TAB 1: OVERVIEW & REVENUE BREAKDOWN */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            
            {/* Revenue Payment Method Cards */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>Báo Cáo Phân Tích Doanh Thu Theo Phương Thức Thanh Toán</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs text-slate-500 block font-bold">Cổng VNPay QR</span>
                  <p className="text-lg font-extrabold text-emerald-600">
                    {formatVND(stats.paymentStats?.find(p => p.method === 'VNPAY')?.totalAmount || 0)}
                  </p>
                  <span className="text-[11px] text-slate-500 font-medium">{stats.paymentStats?.find(p => p.method === 'VNPAY')?.count || 0} giao dịch thành công</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs text-slate-500 block font-bold">Ví Điện Tử MoMo QR</span>
                  <p className="text-lg font-extrabold text-pink-600">
                    {formatVND(stats.paymentStats?.find(p => p.method === 'MOMO_QR')?.totalAmount || 0)}
                  </p>
                  <span className="text-[11px] text-slate-500 font-medium">{stats.paymentStats?.find(p => p.method === 'MOMO_QR')?.count || 0} giao dịch thành công</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs text-slate-500 block font-bold">Thẻ Tín Dụng Quốc Tế</span>
                  <p className="text-lg font-extrabold text-sky-600">
                    {formatVND(stats.paymentStats?.find(p => p.method === 'CREDIT_CARD')?.totalAmount || 0)}
                  </p>
                  <span className="text-[11px] text-slate-500 font-medium">{stats.paymentStats?.find(p => p.method === 'CREDIT_CARD')?.count || 0} giao dịch thành công</span>
                </div>
              </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Top Đơn Đặt Phòng Mới Nhất</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
                    <tr>
                      <th className="p-3">Mã Đơn</th>
                      <th className="p-3">Khách Hàng</th>
                      <th className="p-3">Phòng Đặt</th>
                      <th className="p-3">Thời Gian Lưu Trú</th>
                      <th className="p-3">Tổng Tiền</th>
                      <th className="p-3">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.slice(0, 5).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-blue-700 font-bold">#{b.id}</td>
                        <td className="p-3 text-slate-900 font-bold">{b.guest_name}<br /><span className="text-slate-400 text-[10px] font-normal">{b.guest_phone}</span></td>
                        <td className="p-3 text-slate-700 font-semibold">{b.room_name} (Số {b.room_number})</td>
                        <td className="p-3 text-slate-600 font-medium">{b.check_in} → {b.check_out}</td>
                        <td className="p-3 font-bold text-blue-700">{formatVND(b.total_price)}</td>
                        <td className="p-3 font-bold text-xs">{b.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROOM STATUS (PHÒNG TRỐNG VS ĐÃ CÓ NGƯỜI THUÊ) */}
        {activeTab === 'room_status' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Trạng Thái Phòng Trực Tuyến (Phòng Trống / Đã Có Người Thuê)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Theo dõi danh sách phòng sẵn sàng đón khách hoặc đang có khách ở.</p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold self-start">
                <button
                  onClick={() => setRoomFilterStatus('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    roomFilterStatus === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất Cả ({rooms.length})
                </button>
                <button
                  onClick={() => setRoomFilterStatus('AVAILABLE')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    roomFilterStatus === 'AVAILABLE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:text-slate-900'
                  }`}
                >
                  🟢 Phòng Trống ({rooms.filter(r => r.occupancy_status === 'AVAILABLE').length})
                </button>
                <button
                  onClick={() => setRoomFilterStatus('OCCUPIED')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    roomFilterStatus === 'OCCUPIED' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-700 hover:text-slate-900'
                  }`}
                >
                  🔴 Đã Thuê ({rooms.filter(r => r.occupancy_status === 'OCCUPIED').length})
                </button>
              </div>
            </div>

            {/* Room Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className={`bg-slate-50/80 border p-4 rounded-xl space-y-3 relative transition-all ${
                    room.occupancy_status === 'OCCUPIED'
                      ? 'border-rose-200 bg-rose-50/20'
                      : 'border-emerald-200 bg-emerald-50/20'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <span className="font-mono text-base font-extrabold text-blue-700">
                      Phòng {room.room_number}
                    </span>
                    {room.occupancy_status === 'OCCUPIED' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600" />
                        🔴 Đã Có Khách Thuê
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        🟢 Phòng Trống (Sẵn Sàng)
                      </span>
                    )}
                  </div>

                  {/* Room Spec Summary */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{room.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{room.room_type_name} • {room.capacity} Khách • {room.size_sqm} m²</p>
                    <p className="text-sm font-extrabold text-blue-700 mt-1">{formatVND(room.price_per_night)} / đêm</p>
                  </div>

                  {/* Occupant details if Occupied */}
                  {room.occupancy_status === 'OCCUPIED' && room.current_guest ? (
                    <div className="bg-white p-3 rounded-xl border border-rose-200 text-xs space-y-1 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">Khách Thuê Hiện Tại:</span>
                      <p className="text-slate-900 font-bold">{room.current_guest.guest_name}</p>
                      <p className="text-slate-600 font-medium">SĐT: <strong className="text-slate-900">{room.current_guest.guest_phone}</strong></p>
                      <p className="text-slate-600 font-medium">Thời gian lưu trú: <strong className="text-blue-700">{room.current_guest.check_in} → {room.current_guest.check_out}</strong></p>
                    </div>
                  ) : (
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-200 text-xs text-emerald-700 font-medium text-center">
                      ✨ Phòng sạch đẹp, sẵn sàng đón khách
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: CUSTOMER MANAGEMENT & BOOKED ROOMS (MÃ KHÁCH HÀNG & KHÁCH ĐÃ THUÊ PHÒNG NÀO) */}
        {activeTab === 'customers' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span>Quản Lý Mã Khách Hàng & Danh Sách Phòng Khách Đã Thuê</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tra cứu Mã KH (`usr_...`), số dư chi tiêu và các phòng từng khách đã thuê.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="p-3">Mã KH (Customer ID)</th>
                    <th className="p-3">Họ và Tên</th>
                    <th className="p-3">Thông Tin Liên Hệ</th>
                    <th className="p-3">Số Lượng Đơn</th>
                    <th className="p-3">Tổng Chi Tiêu</th>
                    <th className="p-3">Khách Đã Thuê Phòng Nào</th>
                    <th className="p-3">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-blue-700 font-bold">{c.id}</td>
                      <td className="p-3 text-slate-900 font-bold">{c.name}</td>
                      <td className="p-3 text-slate-600 font-medium">
                        <div>{c.email}</div>
                        <div className="text-slate-400 text-[10px]">{c.phone || 'Chưa cập nhật SĐT'}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{c.total_bookings} đơn</td>
                      <td className="p-3 font-extrabold text-blue-700">{formatVND(c.total_spent)}</td>
                      <td className="p-3">
                        {c.booked_rooms?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {c.booked_rooms.map((br, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-700">
                                🏠 Phòng {br.room_number} ({br.check_in})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa đặt phòng nào</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold border border-blue-200 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi Tiết</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Danh Sách Tất Cả Đơn Đặt Phòng</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="p-3">Mã Đơn</th>
                    <th className="p-3">Khách Hàng</th>
                    <th className="p-3">Tên Phòng</th>
                    <th className="p-3">Ngày Lưu Trú</th>
                    <th className="p-3">Thanh Toán</th>
                    <th className="p-3">Trạng Thái</th>
                    <th className="p-3">Cập Nhật Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-blue-700 font-bold">#{b.id}</td>
                      <td className="p-3">
                        <strong className="text-slate-900 block font-bold">{b.guest_name}</strong>
                        <span className="text-slate-500 text-[10px] font-medium">{b.guest_phone} - {b.guest_email}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{b.room_name} (Số {b.room_number})</td>
                      <td className="p-3 text-slate-600 font-medium">{b.check_in} → {b.check_out}</td>
                      <td className="p-3 font-bold text-blue-700">{formatVND(b.total_price)} ({b.payment_method || 'VNPAY'})</td>
                      <td className="p-3 font-bold">{b.status}</td>
                      <td className="p-3 flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')}
                          className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] hover:bg-emerald-100 border border-emerald-200"
                        >
                          Duyệt Đơn
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                          className="px-2 py-1 rounded-md bg-rose-50 text-rose-700 font-bold text-[10px] hover:bg-rose-100 border border-rose-200"
                        >
                          Hủy Đơn
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ROOMS CATEGORY MANAGEMENT */}
        {activeTab === 'rooms_manage' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Quản Lý Danh Sách Tất Cả Phòng</h3>
              <button
                onClick={() => setShowAddRoomModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Phòng Mới</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="p-3">Mã Số</th>
                    <th className="p-3">Tên Phòng</th>
                    <th className="p-3">Loại Phòng</th>
                    <th className="p-3">Giá / Đêm</th>
                    <th className="p-3">Sức Chứa</th>
                    <th className="p-3">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRooms.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-blue-700 font-bold">Phòng {r.room_number}</td>
                      <td className="p-3 font-bold text-slate-900">{r.name}</td>
                      <td className="p-3 text-slate-600 font-medium">{r.room_type_name}</td>
                      <td className="p-3 font-bold text-blue-700">{formatVND(r.price_per_night)}</td>
                      <td className="p-3 font-medium">{r.capacity} Khách</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteRoom(r.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* CUSTOMER DETAIL MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] text-blue-600 font-mono font-bold block">{selectedCustomer.id}</span>
                <h3 className="text-base font-bold text-slate-900">Lịch Sử Đặt Phòng: {selectedCustomer.name}</h3>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 border border-slate-200">
              <p className="text-slate-600 font-medium">Email: <strong className="text-slate-900">{selectedCustomer.email}</strong></p>
              <p className="text-slate-600 font-medium">SĐT: <strong className="text-slate-900">{selectedCustomer.phone}</strong></p>
              <p className="text-slate-600 font-medium">Tổng chi tiêu: <strong className="text-blue-700 font-bold">{formatVND(selectedCustomer.total_spent)}</strong></p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase">Danh Sách Các Phòng Đã Thuê:</h4>
              {selectedCustomer.booked_rooms?.map((b) => (
                <div key={b.booking_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Phòng {b.room_number} - {b.room_name}</span>
                    <span className="text-blue-700">{formatVND(b.total_price)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Thời gian: {b.check_in} → {b.check_out}</div>
                  <div className="text-[10px] font-bold text-emerald-600">Trạng thái: {b.status}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full py-2.5 rounded-xl font-bold bg-blue-600 text-white text-xs hover:bg-blue-700 shadow-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* ADD ROOM MODAL */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Thêm Phòng Mới Vào Hệ Thống</h3>
              <button onClick={() => setShowAddRoomModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Số Phòng (*)</label>
                  <input
                    type="text"
                    value={newRoom.room_number}
                    onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                    placeholder="VD: 107"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Loại Phòng</label>
                  <select
                    value={newRoom.room_type_id}
                    onChange={(e) => setNewRoom({ ...newRoom, room_type_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-medium"
                  >
                    <option value="rt_standard">Standard Room</option>
                    <option value="rt_deluxe">Deluxe Ocean View</option>
                    <option value="rt_suite">Executive Suite</option>
                    <option value="rt_villa">Beachfront Pool Villa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Tên Phòng Hiển Thị (*)</label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="Phòng Deluxe Hướng Biển Ban Công Vô Cực"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Giá Phòng / Đêm (VND) (*)</label>
                <input
                  type="number"
                  value={newRoom.price_per_night}
                  onChange={(e) => setNewRoom({ ...newRoom, price_per_night: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Số Khách</label>
                  <input
                    type="number"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Số Giường</label>
                  <input
                    type="number"
                    value={newRoom.bed_count}
                    onChange={(e) => setNewRoom({ ...newRoom, bed_count: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Diện Tích m²</label>
                  <input
                    type="number"
                    value={newRoom.size_sqm}
                    onChange={(e) => setNewRoom({ ...newRoom, size_sqm: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-blue-600 text-white text-xs hover:bg-blue-700 shadow-sm"
              >
                Lưu & Thêm Phòng Mới
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN WALK-IN BOOKING MODAL (ĐẶT PHÒNG TRỰC TIẾP TẠI QUẦY LỄ TÂN) */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Đặt Phòng Trực Tiếp Tại Quầy (Walk-in)</span>
              </h3>
              <button onClick={() => setShowWalkInModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Chọn Phòng Trống (*)</label>
                <select
                  value={walkInForm.room_id}
                  onChange={(e) => {
                    const selectedRoom = rooms.find(r => r.id === e.target.value);
                    setWalkInForm({
                      ...walkInForm,
                      room_id: e.target.value,
                      total_price: selectedRoom ? selectedRoom.price_per_night * 2 : walkInForm.total_price
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-bold"
                  required
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Phòng {r.room_number} - {r.name} ({formatVND(r.price_per_night)}/đêm)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Tên Khách Hàng (*)</label>
                  <input
                    type="text"
                    value={walkInForm.guest_name}
                    onChange={(e) => setWalkInForm({ ...walkInForm, guest_name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Số Điện Thoại (*)</label>
                  <input
                    type="text"
                    value={walkInForm.guest_phone}
                    onChange={(e) => setWalkInForm({ ...walkInForm, guest_phone: e.target.value })}
                    placeholder="0912 345 678"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Email Khách Hàng</label>
                <input
                  type="email"
                  value={walkInForm.guest_email}
                  onChange={(e) => setWalkInForm({ ...walkInForm, guest_email: e.target.value })}
                  placeholder="khachle@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Ngày Nhận Phòng</label>
                  <input
                    type="date"
                    value={walkInForm.check_in}
                    onChange={(e) => setWalkInForm({ ...walkInForm, check_in: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Ngày Trả Phòng</label>
                  <input
                    type="date"
                    value={walkInForm.check_out}
                    onChange={(e) => setWalkInForm({ ...walkInForm, check_out: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Tổng Số Tiền (VND)</label>
                  <input
                    type="number"
                    value={walkInForm.total_price}
                    onChange={(e) => setWalkInForm({ ...walkInForm, total_price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-extrabold text-blue-700"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Hình Thức Thanh Toán</label>
                  <select
                    value={walkInForm.payment_method}
                    onChange={(e) => setWalkInForm({ ...walkInForm, payment_method: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-bold"
                  >
                    <option value="CASH">💵 Tiền mặt tại quầy</option>
                    <option value="VNPAY">📱 Chuyển khoản QR VNPay</option>
                    <option value="CARD">💳 Thẻ Pos / Visa</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-extrabold bg-blue-600 text-white text-xs hover:bg-blue-700 shadow-md transition-all"
              >
                Xác Nhận Tạo Đơn & Nhận Phòng Ngay
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
