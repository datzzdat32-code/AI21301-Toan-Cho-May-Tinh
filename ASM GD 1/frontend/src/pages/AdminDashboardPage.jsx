import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, DollarSign, CalendarCheck, Hotel, TrendingUp, Plus, Search,
  UserCheck, CheckCircle2, XCircle, Clock, X, Sparkles, Building2, User, 
  CreditCard, Eye, RefreshCw, Filter, AlertCircle, Compass, Trash2,
  QrCode, Smartphone, Wallet, Check, Save, Bell, AlertTriangle, Phone, ExternalLink, Edit3, Bed, Users, Copy, LogOut
} from 'lucide-react';

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

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  // Navigation Tabs: overview, room_status, customers, rooms_manage, bookings, payment_config, notifications
  const [activeTab, setActiveTab] = useState('overview'); 

  // States
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin Payment Notifications (Success & Failed)
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [notifFilter, setNotifFilter] = useState('ALL'); // ALL, PAYMENT_SUCCESS, PAYMENT_FAILED, UNREAD

  // Payment configuration (Real money receiver: MBBank & MoMo)
  const [paymentConfig, setPaymentConfig] = useState({
    bankId: 'MB',
    bankName: 'MBBank - Ngân hàng Quân Đội',
    accountNo: '0355133380',
    accountName: 'DANG QUOC TOAN',
    momoPhone: '0355133380',
    momoName: 'DANG QUOC TOAN'
  });
  const [savingPaymentConfig, setSavingPaymentConfig] = useState(false);
  const [paymentConfigMsg, setPaymentConfigMsg] = useState('');

  // Real-time Global Search Query in Admin Header
  const [searchQuery, setSearchQuery] = useState('');
  
  // Room Status Filter (ALL, AVAILABLE, OCCUPIED)
  const [roomFilterStatus, setRoomFilterStatus] = useState('ALL');

  // Booking Status Filter (ALL, PENDING, CONFIRMED, PAID, REFUND_REQUESTED, REFUNDED, CANCELLED)
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');

  // Refund Management State
  const [selectedRefundBooking, setSelectedRefundBooking] = useState(null);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Customer Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Add Room Modal
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  // Edit Room Modal
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({
    room_number: '107',
    room_type_id: 1,
    name: '',
    description: '',
    price_per_night: 2200000,
    capacity: 2,
    bed_count: 1,
    size_sqm: 45,
    images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
    amenities: ['Wifi Tốc độ cao', 'Ban công Hướng biển', 'Bồn tắm nằm', 'Ăn sáng miễn phí']
  });

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

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, roomsRes, bookingsRes, customersRes, paymentRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/rooms'),
        axios.get('/api/admin/bookings'),
        axios.get('/api/admin/customers'),
        axios.get('/api/payment-config').catch(() => ({ data: null }))
      ]);
      setStats(statsRes.data);
      setRooms(roomsRes.data);
      setBookings(bookingsRes.data);
      setCustomers(customersRes.data);
      if (paymentRes && paymentRes.data) {
        setPaymentConfig(paymentRes.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Phiên xác thực Admin đã hết hạn. Vui lòng nhấn Đăng Xuất và Đăng Nhập lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/admin/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadNotifCount(res.data.unreadCount || 0);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  const handleMarkNotifRead = async (id) => {
    try {
      await axios.put(`/api/admin/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadNotifCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error mark read:', err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await axios.put('/api/admin/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadNotifCount(0);
    } catch (err) {
      console.error('Error mark all read:', err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`/api/admin/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      fetchNotifications();
    } catch (err) {
      console.error('Error delete notif:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
      fetchNotifications();

      // Tự động kiểm tra thông báo thanh toán mới sau mỗi 5 giây
      const interval = setInterval(() => {
        fetchNotifications();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-xs font-semibold">Đang kiểm tra quyền quản trị viên...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 p-4">
        <div className="text-center space-y-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full">
          <ShieldAlert className="w-14 h-14 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Yêu Cầu Quyền Quản Trị Viên</h2>
          <p className="text-slate-500 text-xs leading-relaxed">
            Trang Dashboard chỉ dành cho tài khoản có quyền Quản Trị Viên (Admin).
            Vui lòng đăng nhập với tài khoản Admin để truy cập và quản lý hệ thống.
          </p>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left text-xs space-y-1">
            <span className="font-bold text-slate-700 block mb-1">🔑 Tài khoản Admin quản trị có sẵn:</span>
            <div className="text-slate-600 font-mono">Email: <strong className="text-blue-600">admin@grandhorizon.com</strong></div>
            <div className="text-slate-600 font-mono">Mật khẩu: <strong className="text-blue-600">admin123</strong></div>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link to="/login" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs">
              Đăng Nhập Admin Ngay
            </Link>
            <Link to="/" className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all">
              Về Trang Chủ
            </Link>
          </div>
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

  const handleOpenEditRoom = (room) => {
    let amenitiesList = [];
    try {
      amenitiesList = Array.isArray(room.amenities) ? room.amenities : JSON.parse(room.amenities || '[]');
    } catch (e) {
      amenitiesList = typeof room.amenities === 'string' ? room.amenities.split(',').map(s => s.trim()) : [];
    }

    let imagesList = [];
    try {
      imagesList = Array.isArray(room.images) ? room.images : JSON.parse(room.images || '[]');
    } catch (e) {
      imagesList = typeof room.images === 'string' ? [room.images] : [];
    }

    setEditingRoom({
      id: room.id,
      room_number: room.room_number,
      room_type_id: room.room_type_id || 'rt_deluxe',
      name: room.name,
      hotel_name: room.hotel_name || 'VnStay Grand Horizon Hotel',
      location: room.location || 'Đà Nẵng',
      description: room.description || '',
      price_per_night: room.price_per_night,
      capacity: room.capacity || 2,
      bed_count: room.bed_count || 1,
      size_sqm: room.size_sqm || 40,
      is_available: room.is_available !== undefined ? room.is_available : 1,
      images: imagesList.length > 0 ? imagesList : ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
      amenities: amenitiesList
    });
    setShowEditRoomModal(true);
  };

  const handleUpdateRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/rooms/${editingRoom.id}`, editingRoom);
      alert(`Cập nhật thông tin Phòng ${editingRoom.room_number} thành công!`);
      setShowEditRoomModal(false);
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi cập nhật thông tin phòng');
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

  const handleConfirmRefund = async (bookingId) => {
    if (!window.confirm(`Xác nhận bạn đã chuyển khoản hoàn tiền xong cho đơn #${bookingId}? Sau khi xác nhận, trạng thái đơn sẽ chuyển sang ĐÃ HOÀN TIỀN (REFUNDED) và phòng sẽ được mở lại cho khách khác đặt.`)) {
      return;
    }
    setProcessingRefund(true);
    try {
      await axios.post(`/api/admin/bookings/${bookingId}/confirm-refund`);
      alert(`Đã hoàn tất thủ tục hoàn tiền cho đơn #${bookingId}! Trạng thái đơn đã đổi sang ĐÃ HOÀN TIỀN và phòng đã sẵn sàng đón khách mới.`);
      setSelectedRefundBooking(null);
      await Promise.all([fetchAdminData(), fetchNotifications()]);
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xác nhận hoàn tiền');
    } finally {
      setProcessingRefund(false);
    }
  };

  // Admin kiểm tra tài khoản ngân hàng và xác nhận ĐÃ NHẬN ĐỦ TIỀN để duyệt đơn
  const handleConfirmPaymentReceived = async (bookingId, guestName, amount) => {
    if (!window.confirm(`XÁC NHẬN ĐÃ NHẬN TIỀN:\nBạn đã kiểm tra tài khoản ngân hàng và xác nhận ĐÃ NHẬN ĐỦ số tiền ${formatVND(amount)} của khách hàng "${guestName}" cho đơn #${bookingId}?\n\nSau khi xác nhận, đơn sẽ được phê duyệt (CONFIRMED) và phòng sẽ chuyển sang ĐÃ KÍN.`)) {
      return;
    }
    try {
      await axios.post(`/api/admin/bookings/${bookingId}/confirm-payment`);
      alert(`Đã xác nhận nhận đủ tiền và duyệt đơn #${bookingId} thành công! Khách hàng đã có vé nhận phòng.`);
      await Promise.all([fetchAdminData(), fetchNotifications()]);
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xác nhận nhận tiền');
    }
  };

  // Admin kiểm tra tài khoản ngân hàng nhưng CHƯA NHẬN ĐƯỢC TIỀN
  const handleRejectPayment = async (bookingId, guestName) => {
    const reason = window.prompt(`Báo chưa nhận được tiền cho đơn #${bookingId} của khách "${guestName}":\nVui lòng nhập lý do (VD: Chưa thấy biến động số dư, sai nội dung chuyển khoản):`, 'Chưa nhận được biến động số dư tài khoản ngân hàng');
    if (reason === null) return;
    try {
      await axios.post(`/api/admin/bookings/${bookingId}/reject-payment`, { reason });
      alert(`Đã cập nhật trạng thái Chưa nhận được tiền cho đơn #${bookingId}!`);
      await Promise.all([fetchAdminData(), fetchNotifications()]);
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi từ chối nhận tiền');
    }
  };

  // Admin thực hiện thủ tục trả phòng (Check-out) cho khách và giải phóng phòng
  const handleCheckoutBooking = async (bookingId, guestName, roomNumber) => {
    if (!window.confirm(`XÁC NHẬN KHÁCH TRẢ PHÒNG (CHECK-OUT):\nBạn có chắc chắn muốn làm thủ tục trả phòng cho khách "${guestName}" (Phòng ${roomNumber || ''})?\n\nSau khi trả phòng, đơn đặt sẽ chuyển sang trạng thái HOÀN THÀNH (COMPLETED) và phòng sẽ được giải phóng ngay lập tức để đón lượt khách tiếp theo!`)) {
      return;
    }
    try {
      const res = await axios.post(`/api/admin/bookings/${bookingId}/checkout`);
      alert(res.data?.message || 'Trả phòng thành công! Phòng đã sẵn sàng đón khách mới.');
      await Promise.all([fetchAdminData(), fetchNotifications()]);
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi thực hiện thủ tục trả phòng');
    }
  };

  // Filtered lists based on Global Search Query
  const q = (searchQuery || '').toLowerCase();

  const filteredCustomers = customers.filter(c => 
    String(c.id || '').toLowerCase().includes(q) ||
    String(c.name || '').toLowerCase().includes(q) ||
    String(c.email || '').toLowerCase().includes(q) ||
    String(c.phone || '').toLowerCase().includes(q)
  );

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = 
      String(r.room_number || '').toLowerCase().includes(q) ||
      String(r.name || '').toLowerCase().includes(q) ||
      String(r.room_type_name || '').toLowerCase().includes(q) ||
      (r.current_guest && String(r.current_guest.guest_name || '').toLowerCase().includes(q));

    if (roomFilterStatus === 'AVAILABLE') return matchesSearch && r.occupancy_status === 'AVAILABLE';
    if (roomFilterStatus === 'OCCUPIED') return matchesSearch && r.occupancy_status === 'OCCUPIED';
    return matchesSearch;
  });

  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      String(b.id || '').toLowerCase().includes(q) ||
      String(b.booking_code || '').toLowerCase().includes(q) ||
      String(b.guest_name || '').toLowerCase().includes(q) ||
      String(b.guest_phone || '').toLowerCase().includes(q) ||
      String(b.room_name || '').toLowerCase().includes(q) ||
      String(b.room_number || '').toLowerCase().includes(q) ||
      String(b.refund_account_no || '').toLowerCase().includes(q) ||
      String(b.refund_account_name || '').toLowerCase().includes(q);

    if (bookingStatusFilter === 'AWAITING_PAYMENT_CONFIRMATION') return matchesSearch && b.status === 'AWAITING_PAYMENT_CONFIRMATION';
    if (bookingStatusFilter === 'PENDING') return matchesSearch && b.status === 'PENDING';
    if (bookingStatusFilter === 'CONFIRMED') return matchesSearch && b.status === 'CONFIRMED';
    if (bookingStatusFilter === 'PAID') return matchesSearch && (b.status === 'PAID' || b.payment_status === 'COMPLETED');
    if (bookingStatusFilter === 'REFUND_REQUESTED') return matchesSearch && b.status === 'REFUND_REQUESTED';
    if (bookingStatusFilter === 'REFUNDED') return matchesSearch && b.status === 'REFUNDED';
    if (bookingStatusFilter === 'CANCELLED') return matchesSearch && (b.status === 'CANCELLED' || b.status === 'PAYMENT_FAILED');
    return matchesSearch;
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

  const handleSavePaymentConfig = async (e) => {
    e.preventDefault();
    setSavingPaymentConfig(true);
    setPaymentConfigMsg('');
    try {
      const bankObj = POPULAR_BANKS.find(b => b.id === paymentConfig.bankId);
      const payload = {
        ...paymentConfig,
        bankName: bankObj ? bankObj.name : paymentConfig.bankName
      };
      const res = await axios.put('/api/payment-config', payload);
      setPaymentConfig(res.data.config || payload);
      setPaymentConfigMsg('Lưu cấu hình tài khoản nhận tiền thành công! Mọi giao dịch đặt phòng của khách sẽ chuyển về đây.');
      setTimeout(() => setPaymentConfigMsg(''), 4000);
    } catch (err) {
      setPaymentConfigMsg('Lỗi khi lưu cấu hình nhận tiền. Vui lòng thử lại!');
    } finally {
      setSavingPaymentConfig(false);
    }
  };

  // Đếm số đơn chờ kiểm tra thanh toán & chờ hoàn tiền
  const pendingAwaitingPaymentCount = bookings.filter(b => b.status === 'AWAITING_PAYMENT_CONFIRMATION').length;
  const pendingRefundCount = bookings.filter(b => b.status === 'REFUND_REQUESTED').length;

  // Sidebar nav items config
  const navItems = [
    { key: 'overview',       icon: DollarSign,    label: 'Doanh Thu',            sub: 'Thống kê & báo cáo' },
    { key: 'notifications',  icon: Bell,          label: 'Thông Báo Thanh Toán', sub: unreadNotifCount > 0 ? `${unreadNotifCount} tin mới` : `${notifications.length} thông báo`, badge: unreadNotifCount },
    { key: 'room_status',    icon: Building2,     label: 'Trạng Thái Phòng',     sub: 'Trống / Đã thuê' },
    { key: 'customers',      icon: UserCheck,     label: 'Khách Hàng',           sub: `${customers.length} khách` },
    { 
      key: 'bookings',       
      icon: CalendarCheck, 
      label: 'Đơn Đặt Phòng',        
      sub: pendingAwaitingPaymentCount > 0 ? `⚡ ${pendingAwaitingPaymentCount} đơn chờ duyệt tiền` : `${bookings.length} đơn`, 
      badge: (pendingAwaitingPaymentCount + pendingRefundCount) || undefined 
    },
    { key: 'rooms_manage',   icon: Hotel,         label: 'Quản Lý Phòng',        sub: `${rooms.length} phòng` },
    { key: 'payment_config', icon: CreditCard,    label: 'Tài Khoản Nhận Tiền',  sub: 'Ngân Hàng & VietQR' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 notranslate" translate="no">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Main Grid: Sidebar (Left) + Content (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── SIDEBAR NAVIGATION CARD (Sticky & Luôn hiển thị) ── */}
          <div className="lg:col-span-1">
            <aside className="bg-white border border-slate-200 p-4 rounded-2xl sticky top-24 z-30 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <span>Điều Hướng Quản Trị</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="relative p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    title="Xem thông báo thanh toán"
                  >
                    <Bell className="w-4 h-4 text-blue-600" />
                    {unreadNotifCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                      </span>
                    )}
                  </button>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    Admin
                  </span>
                </div>
              </div>

              {/* Thanh Tìm Kiếm Gọn Trong Sidebar */}
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm khách, phòng, đơn..."
                  className="bg-transparent text-xs text-slate-800 outline-none w-full placeholder:text-slate-400 font-semibold"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-0.5 text-slate-400 hover:text-slate-700 mr-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-1.5 text-xs font-bold">
                {navItems.map(({ key, icon: Icon, label, sub, badge }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all group ${
                      activeTab === key
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      activeTab === key ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold leading-tight truncate">{label}</p>
                        {badge > 0 && (
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ml-1 ${
                            activeTab === key ? 'bg-white text-rose-600' : 'bg-rose-600 text-white animate-pulse'
                          }`}>
                            {badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] leading-tight truncate ${activeTab === key ? 'text-blue-100' : 'text-slate-400 font-normal'}`}>{sub}</p>
                    </div>
                    {activeTab === key && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Action Buttons inside Sidebar */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => {
                    if (rooms.length > 0) {
                      setWalkInForm(prev => ({ ...prev, room_id: rooms[0].id, total_price: rooms[0].price_per_night * 2 }));
                    }
                    setShowWalkInModal(true);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>Đặt Phòng Walk-in</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={exportBookingsToCSV}
                    className="px-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-xs"
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>Xuất CSV</span>
                  </button>
                  <button
                    onClick={fetchAdminData}
                    className="px-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors border border-slate-200"
                  >
                    <RefreshCw className="w-3 h-3 text-blue-600" />
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>

          {/* ── RIGHT MAIN CONTENT COLUMN ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Quick Unread Alert Banner (if unread > 0 and not on notifications tab) */}
            {unreadNotifCount > 0 && activeTab !== 'notifications' && (
              <div 
                onClick={() => setActiveTab('notifications')}
                className="bg-amber-50 border border-amber-200 hover:border-amber-300 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950">
                      Bạn có {unreadNotifCount} thông báo thanh toán phòng mới!
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Có khách hàng vừa hoàn tất thanh toán hoặc gặp sự cố chuyển khoản. Nhấn để xem chi tiết ngay.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl shrink-0 hover:bg-amber-200">
                  Xem Ngay →
                </span>
              </div>
            )}

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
                    <div className="bg-white p-3 rounded-xl border border-rose-200 text-xs space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">Khách Thuê Hiện Tại:</span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">Đang ở</span>
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold">{room.current_guest.guest_name}</p>
                        <p className="text-slate-600 font-medium">SĐT: <strong className="text-slate-900">{room.current_guest.guest_phone}</strong></p>
                        <p className="text-slate-600 font-medium">Thời gian lưu trú: <strong className="text-blue-700">{room.current_guest.check_in} → {room.current_guest.check_out}</strong></p>
                      </div>
                      <button
                        onClick={() => handleCheckoutBooking(room.current_guest.booking_id, room.current_guest.guest_name, room.room_number)}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Bấm để trả phòng ngay và giải phóng phòng thành phòng trống"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Khách Trả Phòng (Check-out)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-200 text-xs text-emerald-700 font-medium text-center">
                      ✨ Phòng sạch đẹp, sẵn sàng đón khách
                    </div>
                  )}

                  {/* Upcoming Booked Ranges */}
                  {room.booked_ranges && room.booked_ranges.length > 0 && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        📅 Lịch Đặt Tương Lai ({room.booked_ranges.length}):
                      </span>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {room.booked_ranges.map((rng, i) => (
                          <div key={i} className="text-[10px] bg-slate-50 border border-slate-100 px-2 py-1 rounded flex justify-between font-mono">
                            <span className="text-blue-700 font-bold">{rng.check_in} → {rng.check_out}</span>
                            <span className="text-slate-600 font-sans font-medium">{rng.guest_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions on Room Card */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEditRoom(room)}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-blue-700 text-xs font-bold border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Sửa thông tin phòng này"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa Phòng</span>
                    </button>
                    
                    <button
                      onClick={() => handleToggleMaintenance(room.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        room.is_available === 0 
                          ? 'bg-amber-100 text-amber-800 border-amber-300' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                      title="Bật/Tắt bảo trì phòng"
                    >
                      {room.is_available === 0 ? '🛠️ Đang bảo trì' : '⚙️ Bật bảo trì'}
                    </button>
                  </div>

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                  <span>Quản Lý Toàn Bộ Đơn Đặt Phòng</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Xác nhận, cập nhật trạng thái thanh toán hoặc hủy đơn cho khách hàng.</p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                {[
                  { key: 'ALL', label: `Tất cả (${bookings.length})` },
                  { 
                    key: 'AWAITING_PAYMENT_CONFIRMATION', 
                    label: `⏳ Chờ kiểm tra tiền (${bookings.filter(b => b.status === 'AWAITING_PAYMENT_CONFIRMATION').length})`,
                    highlight: bookings.filter(b => b.status === 'AWAITING_PAYMENT_CONFIRMATION').length > 0 
                  },
                  { key: 'PENDING', label: `Chờ duyệt (${bookings.filter(b => b.status === 'PENDING').length})` },
                  { key: 'CONFIRMED', label: `Đã duyệt (${bookings.filter(b => b.status === 'CONFIRMED').length})` },
                  { key: 'PAID', label: `Đã thanh toán (${bookings.filter(b => b.status === 'PAID' || b.payment_status === 'COMPLETED').length})` },
                  { key: 'COMPLETED', label: `Đã trả phòng (${bookings.filter(b => b.status === 'COMPLETED').length})` },
                  { 
                    key: 'REFUND_REQUESTED', 
                    label: `💸 Chờ hoàn tiền (${bookings.filter(b => b.status === 'REFUND_REQUESTED').length})`,
                    highlight: bookings.filter(b => b.status === 'REFUND_REQUESTED').length > 0 
                  },
                  { key: 'REFUNDED', label: `Đã hoàn tiền (${bookings.filter(b => b.status === 'REFUNDED').length})` },
                  { key: 'CANCELLED', label: `Đã hủy / Thất bại (${bookings.filter(b => b.status === 'CANCELLED' || b.status === 'PAYMENT_FAILED').length})` },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setBookingStatusFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      bookingStatusFilter === f.key
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : f.highlight
                        ? 'bg-amber-50 text-amber-800 border-amber-300 font-extrabold animate-pulse'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

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
                    <th className="p-3">Hành Động / Duyệt Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => {
                    const isConfirmed = b.status === 'CONFIRMED';
                    const isAwaitingPayment = b.status === 'AWAITING_PAYMENT_CONFIRMATION';
                    const isPending = b.status === 'PENDING';
                    const isPaid = b.status === 'PAID' || b.payment_status === 'COMPLETED';
                    const isCompleted = b.status === 'COMPLETED';
                    const isRefundRequested = b.status === 'REFUND_REQUESTED';
                    const isRefunded = b.status === 'REFUNDED';
                    const isFailed = b.status === 'PAYMENT_FAILED';
                    const isCancelled = b.status === 'CANCELLED';

                    return (
                      <tr key={b.id} className={`hover:bg-slate-50 ${isAwaitingPayment ? 'bg-amber-50/60 font-medium' : isRefundRequested ? 'bg-amber-50/40' : ''}`}>
                        <td className="p-3 font-mono text-blue-700 font-bold">#{b.id}</td>
                        <td className="p-3">
                          <strong className="text-slate-900 block font-bold">{b.guest_name}</strong>
                          <span className="text-slate-500 text-[10px] font-medium">{b.guest_phone} • {b.guest_email}</span>
                          {b.refund_account_no && (
                            <div className="mt-1 text-[10px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded font-mono">
                              STK hoàn: <strong>{b.refund_bank} - {b.refund_account_no}</strong> ({b.refund_account_name})
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{b.room_name} (Số {b.room_number})</td>
                        <td className="p-3 text-slate-600 font-medium">{b.check_in} → {b.check_out}</td>
                        <td className="p-3 font-bold text-blue-700">
                          {formatVND(b.total_price)}
                          <span className="block text-[10px] text-slate-400 font-normal">({b.payment_method || 'VNPAY'})</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                            isAwaitingPayment
                              ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                              : isRefundRequested
                              ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                              : isRefunded
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : isCompleted
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isConfirmed
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : isFailed
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {b.status === 'AWAITING_PAYMENT_CONFIRMATION' ? 'CHỜ DUYỆT TIỀN' :
                             b.status === 'REFUND_REQUESTED' ? 'YÊU CẦU HOÀN TIỀN' : 
                             b.status === 'REFUNDED' ? 'ĐÃ HOÀN TIỀN' : 
                             b.status === 'COMPLETED' ? 'ĐÃ TRẢ PHÒNG' : 
                             b.status === 'PAYMENT_FAILED' ? 'CHƯA NHẬN ĐƯỢC TIỀN' : b.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {isAwaitingPayment ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleConfirmPaymentReceived(b.id, b.guest_name, b.total_price)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow-sm flex items-center gap-1 transition-all cursor-pointer animate-bounce"
                                title="Kiểm tra app ngân hàng và bấm nhận tiền để duyệt đơn"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Đã Nhận Tiền & Duyệt</span>
                              </button>
                              <button
                                onClick={() => handleRejectPayment(b.id, b.guest_name)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition-all cursor-pointer"
                                title="Báo chưa thấy tiền vào tài khoản"
                              >
                                <span>Chưa Nhận Tiền</span>
                              </button>
                            </div>
                          ) : isRefundRequested ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedRefundBooking(b)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer animate-bounce"
                                title="Mở mã QR VietQR chuyển khoản trả lại tiền cho khách"
                              >
                                <span>💸 Quét QR Hoàn Tiền</span>
                              </button>
                            </div>
                          ) : isRefunded ? (
                            <div className="flex items-center gap-1.5 text-purple-700 font-bold text-[11px] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đã Chuyển Tiền Trả Khách</span>
                            </div>
                          ) : isCompleted ? (
                            <div className="flex items-center gap-1.5 text-slate-600 font-bold text-[11px] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đã Xong Thủ Tục (Phòng Trống)</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {(isConfirmed || isPaid) && (
                                <button
                                  onClick={() => handleCheckoutBooking(b.id, b.guest_name, b.room_number)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Khách trả phòng, giải phóng phòng để đón khách tiếp theo"
                                >
                                  <LogOut className="w-3.5 h-3.5" />
                                  <span>Trả Phòng</span>
                                </button>
                              )}
                              {!isConfirmed && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px] hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                                  title="Duyệt đơn"
                                >
                                  Duyệt Đơn
                                </button>
                              )}
                              {!isPaid && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'PAID')}
                                  className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px] hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                                  title="Đã nhận tiền"
                                >
                                  Đã Thu Tiền
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                                className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-[11px] hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                                title="Hủy đơn"
                              >
                                Hủy Đơn
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ROOMS CATEGORY MANAGEMENT */}
        {activeTab === 'rooms_manage' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-blue-600" />
                  <span>Quản Lý Toàn Bộ Phòng & Tiện Nghi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Thêm phòng mới, chỉnh sửa giá/sức chứa/mô tả hoặc xóa phòng khỏi hệ thống.</p>
              </div>
              <button
                onClick={() => setShowAddRoomModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Phòng Mới</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="p-3">Hình Ảnh</th>
                    <th className="p-3">Số Phòng</th>
                    <th className="p-3">Tên Phòng</th>
                    <th className="p-3">Loại Phòng</th>
                    <th className="p-3">Giá / Đêm</th>
                    <th className="p-3">Sức Chứa</th>
                    <th className="p-3">Trạng Thái</th>
                    <th className="p-3">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRooms.map((r) => {
                    let firstImage = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=400&q=80';
                    try {
                      const imgs = Array.isArray(r.images) ? r.images : JSON.parse(r.images || '[]');
                      if (imgs.length > 0) firstImage = imgs[0];
                    } catch (e) {}

                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <img
                            src={firstImage}
                            alt={r.name}
                            className="w-14 h-10 object-cover rounded-lg border border-slate-200"
                          />
                        </td>
                        <td className="p-3 font-mono text-blue-700 font-extrabold text-sm">Phòng {r.room_number}</td>
                        <td className="p-3">
                          <strong className="text-slate-900 block font-bold">{r.name}</strong>
                          <span className="text-[10px] text-slate-400 font-medium">{r.location || 'Đà Nẵng'} • {r.size_sqm} m²</span>
                        </td>
                        <td className="p-3 text-slate-600 font-semibold">{r.room_type_name}</td>
                        <td className="p-3 font-extrabold text-blue-700">{formatVND(r.price_per_night)}</td>
                        <td className="p-3 font-medium">{r.capacity} Khách ({r.bed_count || 1} Giường)</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            r.is_available === 1 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {r.is_available === 1 ? 'Sẵn sàng' : 'Bảo trì'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditRoom(r)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Chỉnh sửa thông tin phòng"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Sửa</span>
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(r.id)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                              title="Xóa phòng này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5b: ADMIN NOTIFICATIONS (THÔNG BÁO THANH TOÁN TIỀN PHÒNG) */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Thông Báo Thanh Toán Tiền Phòng</h3>
                    {unreadNotifCount > 0 && (
                      <span className="text-[11px] bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-extrabold animate-pulse">
                        {unreadNotifCount} tin chưa đọc
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Báo cáo tức thì mọi sự kiện thanh toán phòng của khách hàng: Thành công hoặc Thất bại (hết giờ, sự cố chuyển khoản).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {unreadNotifCount > 0 && (
                    <button
                      onClick={handleMarkAllNotifsRead}
                      className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-blue-200 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Đánh dấu tất cả đã đọc</span>
                    </button>
                  )}
                  <button
                    onClick={fetchNotifications}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all border border-slate-200 cursor-pointer"
                    title="Làm mới danh sách"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'ALL', label: `Tất cả (${notifications.length})` },
                  { 
                    key: 'PAYMENT_SUBMITTED', 
                    label: `⏳ Khách báo chuyển tiền (${notifications.filter(n => n.type === 'PAYMENT_SUBMITTED').length})` 
                  },
                  { 
                    key: 'REFUND_REQUESTED', 
                    label: `💸 Yêu cầu hoàn tiền (${notifications.filter(n => n.type === 'REFUND_REQUESTED').length})` 
                  },
                  { 
                    key: 'PAYMENT_SUCCESS', 
                    label: `✅ Thanh toán thành công (${notifications.filter(n => n.type === 'PAYMENT_SUCCESS').length})` 
                  },
                  { 
                    key: 'PAYMENT_FAILED', 
                    label: `❌ Thanh toán thất bại (${notifications.filter(n => n.type === 'PAYMENT_FAILED').length})` 
                  },
                  { 
                    key: 'UNREAD', 
                    label: `📩 Chưa đọc (${notifications.filter(n => !n.is_read).length})` 
                  }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setNotifFilter(f.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      notifFilter === f.key
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Notifications List */}
              <div className="space-y-3">
                {notifications
                  .filter((n) => {
                    if (notifFilter === 'PAYMENT_SUBMITTED') return n.type === 'PAYMENT_SUBMITTED';
                    if (notifFilter === 'REFUND_REQUESTED') return n.type === 'REFUND_REQUESTED';
                    if (notifFilter === 'PAYMENT_SUCCESS') return n.type === 'PAYMENT_SUCCESS';
                    if (notifFilter === 'PAYMENT_FAILED') return n.type === 'PAYMENT_FAILED';
                    if (notifFilter === 'UNREAD') return !n.is_read;
                    return true;
                  })
                  .map((notif) => {
                    const isSuccess = notif.type === 'PAYMENT_SUCCESS';
                    const isPaymentSubmitted = notif.type === 'PAYMENT_SUBMITTED';
                    const isRefundReq = notif.type === 'REFUND_REQUESTED';
                    const isRefundDone = notif.type === 'REFUND_COMPLETED';

                    return (
                      <div
                        key={notif.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                          !notif.is_read
                            ? isPaymentSubmitted
                              ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-300'
                              : isRefundReq
                              ? 'bg-amber-50/70 border-amber-300 shadow-sm ring-1 ring-amber-200'
                              : isRefundDone
                              ? 'bg-purple-50/60 border-purple-300 shadow-sm ring-1 ring-purple-200'
                              : isSuccess
                              ? 'bg-emerald-50/60 border-emerald-300 shadow-sm ring-1 ring-emerald-200'
                              : 'bg-rose-50/60 border-rose-300 shadow-sm ring-1 ring-rose-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          
                          {/* Left: Icon & Content */}
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isPaymentSubmitted
                                ? 'bg-amber-100 text-amber-800'
                                : isRefundReq
                                ? 'bg-amber-100 text-amber-700'
                                : isRefundDone
                                ? 'bg-purple-100 text-purple-700'
                                : isSuccess
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-rose-100 text-rose-600'
                            }`}>
                              {isPaymentSubmitted ? <Clock className="w-5 h-5 animate-spin" /> :
                               isRefundReq ? <DollarSign className="w-5 h-5" /> :
                               isRefundDone ? <CheckCircle2 className="w-5 h-5" /> :
                               isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>

                            <div className="space-y-1.5 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                  isPaymentSubmitted
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                    : isRefundReq
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                    : isRefundDone
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : isSuccess
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                                }`}>
                                  {isPaymentSubmitted ? 'Khách Báo Đã Chuyển Tiền - Cần Duyệt' :
                                   isRefundReq ? 'Yêu Cầu Hủy & Hoàn Tiền' :
                                   isRefundDone ? 'Hoàn Tiền Hoàn Tất' :
                                   isSuccess ? 'Thanh Toán Thành Công' : 'Thanh Toán Thất Bại'}
                                </span>

                                {!notif.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Chưa đọc" />
                                )}

                                <span className="text-[11px] text-slate-400 font-medium">
                                  {new Date(notif.created_at).toLocaleString('vi-VN')}
                                </span>
                              </div>

                              <h4 className={`text-sm font-bold ${
                                isPaymentSubmitted ? 'text-amber-950 font-extrabold' :
                                isRefundReq ? 'text-amber-950 font-extrabold' :
                                isSuccess ? 'text-slate-900' : 'text-rose-950 font-extrabold'
                              }`}>
                                {notif.title}
                              </h4>

                              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {notif.message}
                              </p>

                              {/* Info tags */}
                              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                                {notif.amount && (
                                  <div className="font-bold">
                                    <span className="text-slate-400">Số tiền: </span>
                                    <span className={
                                      isPaymentSubmitted ? 'text-amber-700 font-extrabold' :
                                      isRefundReq ? 'text-amber-700 font-extrabold' :
                                      isSuccess ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'
                                    }>
                                      {formatVND(notif.amount)}
                                    </span>
                                  </div>
                                )}
                                {notif.guest_name && (
                                  <div>
                                    <span className="text-slate-400">Khách: </span>
                                    <strong className="text-slate-800">{notif.guest_name}</strong>
                                  </div>
                                )}
                                {notif.room_name && (
                                  <div>
                                    <span className="text-slate-400">Phòng: </span>
                                    <strong className="text-slate-800">{notif.room_name}</strong>
                                  </div>
                                )}
                                {notif.booking_id && (
                                  <div>
                                    <span className="text-slate-400">Mã đơn: </span>
                                    <span className="font-mono text-blue-700 font-bold">#{notif.booking_id}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            {isPaymentSubmitted && notif.booking_id && (
                              <button
                                onClick={() => {
                                  const found = bookings.find(b => String(b.id) === String(notif.booking_id));
                                  if (found) {
                                    handleConfirmPaymentReceived(found.id, found.guest_name, found.total_price);
                                  } else {
                                    handleConfirmPaymentReceived(notif.booking_id, notif.guest_name || 'Khách hàng', notif.amount || 0);
                                  }
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm animate-bounce"
                                title="Admin xác nhận đã kiểm tra tài khoản và nhận đủ tiền"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Đã Nhận Tiền & Duyệt</span>
                              </button>
                            )}

                            {isRefundReq && notif.booking_id && (
                              <button
                                onClick={() => {
                                  const found = bookings.find(b => String(b.id) === String(notif.booking_id));
                                  if (found) {
                                    setSelectedRefundBooking(found);
                                  } else {
                                    setSearchQuery(String(notif.booking_id));
                                    setActiveTab('bookings');
                                  }
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm animate-bounce"
                                title="Mở mã QR VietQR chuyển tiền hoàn trả cho khách"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Chuyển Hoàn Tiền</span>
                              </button>
                            )}

                            {notif.booking_id && (
                              <button
                                onClick={() => {
                                  setSearchQuery(notif.booking_id);
                                  setActiveTab('bookings');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-blue-200"
                                title="Đi tới đơn đặt phòng"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Xem Đơn</span>
                              </button>
                            )}

                            {notif.booking_id && (
                              <button
                                onClick={() => {
                                  setSearchQuery(notif.booking_id);
                                  setActiveTab('bookings');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-blue-200"
                                title="Đi tới đơn đặt phòng"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Xem Đơn</span>
                              </button>
                            )}

                            {!notif.is_read ? (
                              <button
                                onClick={() => handleMarkNotifRead(notif.id)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200"
                              >
                                <Check className="w-3.5 h-3.5 text-blue-600" />
                                <span>Đã xem</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium px-2 py-1">Đã đọc</span>
                            )}

                            <button
                              onClick={() => handleDeleteNotification(notif.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Xóa thông báo này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}

                {/* Empty State */}
                {notifications.filter((n) => {
                  if (notifFilter === 'PAYMENT_SUCCESS') return n.type === 'PAYMENT_SUCCESS';
                  if (notifFilter === 'PAYMENT_FAILED') return n.type === 'PAYMENT_FAILED';
                  if (notifFilter === 'UNREAD') return !n.is_read;
                  return true;
                }).length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-600">Không có thông báo nào!</p>
                    <p className="text-xs text-slate-400">
                      Khi khách đặt phòng và thanh toán (thành công hoặc thất bại), thông báo sẽ tự động cập nhật tại đây theo thời gian thực.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: PAYMENT RECEIVER CONFIGURATION (TÀI KHOẢN NHẬN TIỀN THẬT) */}
        {activeTab === 'payment_config' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-slate-900 text-lg font-extrabold">Cấu Hình Tài Khoản Nhận Tiền Thật</span>
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      Trực Tuyến 24/7
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Thiết lập số tài khoản Ngân hàng thụ hưởng của Khách sạn. Mọi giao dịch đặt phòng của khách qua VNPay / App Ngân Hàng sẽ được quét mã và chuyển tiền tươi thẳng vào tài khoản này 100%.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Chủ Khách Sạn:</span>
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {paymentConfig.accountName || 'DANG QUOC TOAN'}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              {paymentConfigMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{paymentConfigMsg}</span>
                </div>
              )}

              {/* Form & Live Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Input Form (7 cols) */}
                <form onSubmit={handleSavePaymentConfig} className="lg:col-span-7 space-y-5">
                  
                  {/* Card: Bank Config */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-xs pb-2 border-b border-slate-200">
                      <QrCode className="w-4 h-4" />
                      <span>Thông Tin Tài Khoản Ngân Hàng (VNPay & VietQR Napas 24/7)</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Ngân Hàng Thụ Hưởng (*)</label>
                      <select
                        value={paymentConfig.bankId}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, bankId: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-blue-500 shadow-xs"
                      >
                        {POPULAR_BANKS.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Số Tài Khoản Ngân Hàng (*)</label>
                      <input
                        type="text"
                        value={paymentConfig.accountNo}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, accountNo: e.target.value.trim() })}
                        placeholder="VD: 0355133380"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold outline-none focus:border-blue-500 shadow-xs text-slate-900"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Tên Chủ Tài Khoản (* Viết hoa không dấu)</label>
                      <input
                        type="text"
                        value={paymentConfig.accountName}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, accountName: e.target.value.toUpperCase() })}
                        placeholder="VD: DANG QUOC TOAN"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold uppercase outline-none focus:border-blue-500 shadow-xs text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={savingPaymentConfig}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {savingPaymentConfig ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang Lưu Cấu Hình...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Lưu Cấu Hình Tài Khoản Nhận Tiền Ngay</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Right: Live Preview of QR Codes (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        Xem Trước Mã QR Thực Tế
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                        Live Preview
                      </span>
                    </div>

                    {/* QR VietQR Live */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-2 shadow-xs">
                      <span className="text-xs font-bold text-blue-700 block">Mã VietQR Chuẩn (Napas 24/7 & VNPay)</span>
                      <img
                        src={`https://img.vietqr.io/image/${paymentConfig.bankId}-${paymentConfig.accountNo}-compact2.png?amount=500000&addInfo=DEMO%20ADMIN&accountName=${encodeURIComponent(paymentConfig.accountName)}`}
                        alt="VietQR Demo Preview"
                        className="w-48 h-48 mx-auto object-contain border border-slate-100 rounded-lg p-1"
                      />
                      <div className="text-xs text-slate-600 font-medium">
                        {paymentConfig.bankName || 'MBBank'} • <strong className="font-mono text-slate-900 font-bold">{paymentConfig.accountNo}</strong>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Chủ TK: <strong className="text-slate-800">{paymentConfig.accountName}</strong>
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

          </div>
        </div>
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

      {/* ADMIN EDIT ROOM MODAL */}
      {showEditRoomModal && editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <span>Chỉnh Sửa Thông Tin Phòng {editingRoom.room_number}</span>
              </h3>
              <button onClick={() => setShowEditRoomModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRoomSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Số Phòng</label>
                  <input
                    type="text"
                    value={editingRoom.room_number}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 outline-none font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Loại Phòng</label>
                  <select
                    value={editingRoom.room_type_id}
                    onChange={(e) => setEditingRoom({ ...editingRoom, room_type_id: e.target.value })}
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
                  value={editingRoom.name}
                  onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                  placeholder="Phòng Deluxe Hướng Biển Ban Công Vô Cực"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Giá Phòng / Đêm (VND) (*)</label>
                  <input
                    type="number"
                    value={editingRoom.price_per_night}
                    onChange={(e) => setEditingRoom({ ...editingRoom, price_per_night: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-blue-700 outline-none font-extrabold"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Địa Điểm / Thành Phố</label>
                  <input
                    type="text"
                    value={editingRoom.location || 'Đà Nẵng'}
                    onChange={(e) => setEditingRoom({ ...editingRoom, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Số Khách Tối Đa</label>
                  <input
                    type="number"
                    value={editingRoom.capacity}
                    onChange={(e) => setEditingRoom({ ...editingRoom, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Số Giường</label>
                  <input
                    type="number"
                    value={editingRoom.bed_count}
                    onChange={(e) => setEditingRoom({ ...editingRoom, bed_count: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Diện Tích m²</label>
                  <input
                    type="number"
                    value={editingRoom.size_sqm}
                    onChange={(e) => setEditingRoom({ ...editingRoom, size_sqm: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Trạng Thái Sẵn Sàng</label>
                <select
                  value={editingRoom.is_available}
                  onChange={(e) => setEditingRoom({ ...editingRoom, is_available: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-bold"
                >
                  <option value={1}>🟢 Sẵn sàng đón khách</option>
                  <option value={0}>🛠️ Tạm ngưng đón khách (Đang bảo trì)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Đường Dẫn Ảnh Phòng (URL)</label>
                <input
                  type="text"
                  value={editingRoom.images?.[0] || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, images: [e.target.value] })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Mô Tả Phòng</label>
                <textarea
                  rows={2}
                  value={editingRoom.description || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                  placeholder="Mô tả chi tiết phòng..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditRoomModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-all cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-md transition-all cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN VIETQR REFUND MODAL */}
      {selectedRefundBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl my-8">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Chuyển Khoản Hoàn Tiền Đơn #{selectedRefundBooking.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Khách yêu cầu hủy phòng & hoàn tiền • Quét VietQR hoặc chuyển khoản trực tiếp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRefundBooking(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Left Column: VietQR Code */}
              <div className="flex flex-col items-center justify-center bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-center">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 inline-block">
                  <img
                    src={`https://img.vietqr.io/image/${selectedRefundBooking.refund_bank || 'MB'}-${selectedRefundBooking.refund_account_no || '0'}-compact2.png?amount=${selectedRefundBooking.total_price || 0}&addInfo=${encodeURIComponent(`HOAN TIEN DON ${selectedRefundBooking.id}`)}&accountName=${encodeURIComponent(selectedRefundBooking.refund_account_name || selectedRefundBooking.guest_name || '')}`}
                    alt="VietQR Hoàn Tiền"
                    className="w-48 h-48 object-contain rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/200x200?text=VietQR+Error';
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mã Napas 24/7 Tự Động</span>
                  </span>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Mở App MBBank hoặc bất kỳ ngân hàng nào quét mã để chuyển lại tiền phòng cho khách
                  </p>
                </div>
              </div>

              {/* Right Column: Account & Booking details */}
              <div className="space-y-3.5 text-xs">
                
                {/* Amount Box */}
                <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl space-y-1">
                  <span className="text-amber-800 font-bold block text-[11px]">Số tiền cần hoàn trả cho khách:</span>
                  <div className="text-2xl font-black text-amber-700">
                    {formatVND(selectedRefundBooking.total_price)}
                  </div>
                  <div className="text-[11px] text-amber-800">
                    Đơn: <strong>{selectedRefundBooking.room_name}</strong> (Phòng #{selectedRefundBooking.room_number})
                  </div>
                </div>

                {/* Bank Account Info */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="text-slate-500 font-semibold text-[11px] border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <span>Tài Khoản Khách Đăng Ký Nhận Tiền</span>
                    <span className="text-blue-600 font-bold">Napas 24/7</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Ngân hàng:</span>
                    <strong className="text-slate-800 font-bold text-xs">
                      {POPULAR_BANKS.find(b => b.id === selectedRefundBooking.refund_bank)?.name || selectedRefundBooking.refund_bank || 'MBBank'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Số tài khoản nhận:</span>
                      <strong className="text-blue-700 font-mono font-bold text-sm tracking-wide">
                        {selectedRefundBooking.refund_account_no || 'Chưa cung cấp'}
                      </strong>
                    </div>
                    {selectedRefundBooking.refund_account_no && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedRefundBooking.refund_account_no);
                          setCopiedAccount(true);
                          setTimeout(() => setCopiedAccount(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedAccount ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAccount ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Chủ tài khoản:</span>
                    <strong className="text-slate-800 font-bold uppercase">
                      {selectedRefundBooking.refund_account_name || selectedRefundBooking.guest_name}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Lý do khách xin hủy:</span>
                    <p className="text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200 mt-0.5">
                      "{selectedRefundBooking.refund_reason || 'Khách thay đổi lịch trình cá nhân'}"
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Note & Action Buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-800 leading-relaxed">
                ℹ️ <strong>Quy trình:</strong> Admin vui lòng quét mã VietQR trên điện thoại để hoàn tiền cho khách. Sau khi app ngân hàng báo thành công, nhấn nút <strong>"Xác Nhận Đã Chuyển Tiền Hoàn Trả Xong"</strong> để hệ thống giải phóng phòng ({selectedRefundBooking.room_name}) và cập nhật lịch sử.
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedRefundBooking(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-all cursor-pointer"
                >
                  Đóng Lại
                </button>
                <button
                  type="button"
                  disabled={processingRefund}
                  onClick={() => handleConfirmRefund(selectedRefundBooking.id)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {processingRefund ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang xử lý hoàn tiền...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✅ Xác Nhận Đã Chuyển Tiền Hoàn Trả Xong</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
