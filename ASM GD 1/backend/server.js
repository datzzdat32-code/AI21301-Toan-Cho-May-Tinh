const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { dbRun, dbAll, dbGet, initDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Security: High-Entropy 256-bit JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'SECURE_VNSTAY_ADMIN_KEY_89f3a1b2c4e5d6f7890a1b2c3d4e5f6a';

// ----------------------------------------------------
// SECURITY MIDDLEWARES & HEADERS
// ----------------------------------------------------
// 1. Helmet HTTP Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow external image sources (Unsplash/QR)
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors());
app.use(express.json());

// 2. Rate Limiting for Login Endpoint (Chống Tấn Công Dò Mật Khẩu Brute-Force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 login attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '⚠️ Bạn đã thử đăng nhập sai quá 5 lần. Vì lí do bảo mật, tài khoản bị tạm khóa trong 15 phút!' }
});

// Initialize Database
initDB().catch(console.error);

// ----------------------------------------------------
// ROOT API HEALTH CHECK & WELCOME ROUTE
// ----------------------------------------------------
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>VnStay.vn API Server</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; text-align: center; }
        .card { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .badge { display: inline-block; background: #dcfce7; color: #15803d; font-weight: 600; padding: 6px 16px; border-radius: 9999px; font-size: 14px; margin-bottom: 16px; }
        h1 { color: #0284c7; margin-bottom: 10px; font-size: 24px; }
        p { color: #64748b; margin-bottom: 20px; line-height: 1.6; }
        ul { text-align: left; background: #f1f5f9; padding: 16px 24px; border-radius: 8px; list-style-type: square; }
        li { margin-bottom: 8px; font-family: monospace; font-size: 14px; }
        a { color: #0284c7; font-weight: 600; text-decoration: none; }
        a:hover { text-underline-offset: 4px; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">🟢 BACKEND SERVER OPERATIONAL</span>
        <h1>VnStay.vn RESTful API Node.js Server</h1>
        <p>Máy chủ Backend đang chạy tốt tại Cổng <strong>5000</strong>.</p>
        <p>Để trải nghiệm Giao diện Website đặt phòng Khách sạn, vui lòng mở địa chỉ:<br>
           👉 <a href="http://localhost:3000" target="_blank"><strong>http://localhost:3000</strong></a>
        </p>
        <h3>📌 Các đường dẫn API tiêu biểu:</h3>
        <ul>
          <li>GET <a href="/api/rooms" target="_blank">/api/rooms</a> - Danh sách phòng khách sạn</li>
          <li>GET <a href="/api/locations" target="_blank">/api/locations</a> - Các địa điểm du lịch</li>
          <li>POST /api/auth/login - API Đăng nhập</li>
          <li>POST /api/auth/register - API Đăng ký</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// ----------------------------------------------------
// AUTH & ADMIN PROTECTION MIDDLEWARES
// ----------------------------------------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Chưa cung cấp mã xác thực (Token)' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
    req.user = user;
    next();
  });
};

// Double-check Role against Database (Chống giả mạo JWT / Role Escalation)
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: 'Từ chối truy cập: Không tìm thấy định danh tài khoản' });
    }

    const dbUser = await dbGet('SELECT id, role FROM users WHERE id = ?', [req.user.id]);
    if (!dbUser || dbUser.role !== 'ADMIN') {
      console.warn(`🚨 CẢNH BÁO BẢO MẬT: Phát hiện nỗ lực truy cập Admin trái phép từ User ID: ${req.user.id}`);
      return res.status(403).json({ error: '🚨 TỪ CHỐI TRUY CẬP: Yêu cầu quyền Quản trị viên (Admin)' });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Lỗi kiểm tra quyền bảo mật hệ thống' });
  }
};

// ----------------------------------------------------
// AUTH API
// ----------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tên, email và mật khẩu' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo an toàn' });
    }

    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email này đã được đăng ký tài khoản' });
    }

    const userId = 'usr_' + Date.now();
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'CUSTOMER'; // New users are ALWAYS CUSTOMER (Cannot register as ADMIN)

    await dbRun(
      'INSERT INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, email, hashedPassword, role, phone || '']
    );

    const token = jwt.sign({ id: userId, email, role, name }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      token,
      user: { id: userId, name, email, role, phone }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng ký tài khoản' });
  }
});

// Appling loginLimiter rate-limiting to prevent brute force attacks
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    // Token expires in 24h
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng nhập' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy thông tin tài khoản' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi máy chủ khi xác thực tài khoản' });
  }
});

// ----------------------------------------------------
// ADMIN PASSWORD CHANGE & SECURITY API
// ----------------------------------------------------
app.post('/api/admin/change-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const admin = await dbGet('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const validPassword = await bcrypt.compare(currentPassword, admin.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác' });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await dbRun('UPDATE users SET password = ? WHERE id = ?', [newHashedPassword, req.user.id]);

    console.log(`🔒 SECURE EVENT: Admin (ID: ${req.user.id}) đã đổi mật khẩu thành công!`);

    res.json({ message: 'Đổi mật khẩu Quản Trị Viên thành công! Tài khoản của bạn đã được bảo vệ.' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi đổi mật khẩu Admin' });
  }
});

// ----------------------------------------------------
// ROOMS, LOCATIONS & CATEGORIES API
// ----------------------------------------------------
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM room_types');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh mục phòng' });
  }
});

app.get('/api/locations', async (req, res) => {
  try {
    const locations = await dbAll(
      `SELECT location, COUNT(*) as room_count, MIN(price_per_night) as min_price
       FROM rooms
       WHERE is_available = 1
       GROUP BY location`
    );
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách địa điểm du lịch' });
  }
});

// ----------------------------------------------------
// VOUCHERS & PROMOTIONS API
// ----------------------------------------------------
app.get('/api/vouchers', async (req, res) => {
  try {
    const vouchers = await dbAll('SELECT * FROM vouchers WHERE is_active = 1');
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách mã giảm giá' });
  }
});

app.post('/api/vouchers/apply', async (req, res) => {
  try {
    const { code, totalPrice } = req.body;
    if (!code) return res.status(400).json({ error: 'Vui lòng nhập mã giảm giá' });

    const voucher = await dbGet('SELECT * FROM vouchers WHERE UPPER(code) = UPPER(?) AND is_active = 1', [code.trim()]);
    if (!voucher) {
      return res.status(404).json({ error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    }

    if (totalPrice && totalPrice < voucher.min_spend) {
      const formatMinSpend = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.min_spend);
      return res.status(400).json({ error: `Mã ${voucher.code} chỉ áp dụng cho hóa đơn từ ${formatMinSpend}` });
    }

    res.json({
      message: `Áp dụng mã ${voucher.code} thành công!`,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        discount_amount: voucher.discount_amount,
        min_spend: voucher.min_spend
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi kiểm tra mã giảm giá' });
  }
});

app.get('/api/amenities', async (req, res) => {
  try {
    const amenities = await dbAll('SELECT * FROM amenities');
    res.json(amenities);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh mục tiện nghi' });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    const { capacity, minPrice, maxPrice, roomTypeId, location, search, sortBy } = req.query;

    let sql = `
      SELECT r.*, rt.name as room_type_name 
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.is_available = 1
    `;
    const params = [];

    if (location) {
      sql += ' AND (r.location LIKE ? OR r.name LIKE ? OR r.hotel_name LIKE ?)';
      params.push(`%${location}%`, `%${location}%`, `%${location}%`);
    }

    if (capacity) {
      sql += ' AND r.capacity >= ?';
      params.push(parseInt(capacity));
    }

    if (minPrice) {
      sql += ' AND r.price_per_night >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      sql += ' AND r.price_per_night <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (roomTypeId) {
      sql += ' AND r.room_type_id = ?';
      params.push(roomTypeId);
    }

    if (search) {
      sql += ' AND (r.name LIKE ? OR r.description LIKE ? OR r.location LIKE ? OR r.hotel_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (sortBy === 'price_asc') {
      sql += ' ORDER BY r.price_per_night ASC';
    } else if (sortBy === 'price_desc') {
      sql += ' ORDER BY r.price_per_night DESC';
    } else if (sortBy === 'rating') {
      sql += ' ORDER BY r.rating DESC';
    } else {
      sql += ' ORDER BY r.price_per_night ASC';
    }

    const rows = await dbAll(sql, params);

    const rooms = rows.map(r => ({
      ...r,
      images: JSON.parse(r.images || '[]'),
      amenities: JSON.parse(r.amenities || '[]')
    }));

    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Lỗi khi tải danh sách phòng' });
  }
});

app.get('/api/rooms/:id', async (req, res) => {
  try {
    const room = await dbGet(
      `SELECT r.*, rt.name as room_type_name, rt.description as room_type_desc
       FROM rooms r
       JOIN room_types rt ON r.room_type_id = rt.id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (!room) return res.status(404).json({ error: 'Phòng không tồn tại' });

    room.images = JSON.parse(room.images || '[]');
    room.amenities = JSON.parse(room.amenities || '[]');

    const reviews = await dbAll('SELECT * FROM reviews WHERE room_id = ? ORDER BY created_at DESC', [req.params.id]);

    res.json({ ...room, reviews });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy thông tin chi tiết phòng' });
  }
});

// ----------------------------------------------------
// BOOKING & PAYMENT API
// ----------------------------------------------------
app.post('/api/bookings', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guestCount, guestName, guestEmail, guestPhone, specialRequests, userId } = req.body;

    if (!roomId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin đặt phòng' });
    }

    const room = await dbGet('SELECT * FROM rooms WHERE id = ?', [roomId]);
    if (!room) return res.status(404).json({ error: 'Không tìm thấy thông tin phòng' });

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const totalPrice = nights * room.price_per_night;

    const bookingId = 'bk_' + Date.now();
    const finalUserId = userId || (req.user ? req.user.id : 'usr_' + Date.now());

    await dbRun(
      `INSERT INTO bookings (id, user_id, room_id, check_in, check_out, guest_count, total_price, status, guest_name, guest_email, guest_phone, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)`,
      [bookingId, finalUserId, roomId, checkIn, checkOut, guestCount || 1, totalPrice, guestName, guestEmail, guestPhone, specialRequests || '']
    );

    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [bookingId]);

    res.status(201).json({
      message: 'Tạo đơn đặt phòng thành công',
      booking,
      roomName: room.name,
      nights
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi đặt phòng' });
  }
});

app.get('/api/bookings/my-bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await dbAll(
      `SELECT b.*, r.name as room_name, r.hotel_name, r.location, r.images as room_images, r.price_per_night, rt.name as room_type_name
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       JOIN room_types rt ON r.room_type_id = rt.id
       WHERE b.user_id = ? OR b.guest_email = ?
       ORDER BY b.created_at DESC`,
      [req.user.id, req.user.email]
    );

    const formatted = bookings.map(b => ({
      ...b,
      room_images: JSON.parse(b.room_images || '[]')
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách đơn đặt phòng' });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await dbGet(
      `SELECT b.*, r.name as room_name, r.hotel_name, r.location, r.images as room_images, r.size_sqm, r.bed_count, r.amenities, p.method as payment_method, p.status as payment_status, p.transaction_id
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       LEFT JOIN payments p ON p.booking_id = b.id
       WHERE b.id = ?`,
      [req.params.id]
    );

    if (!booking) return res.status(404).json({ error: 'Không tìm thấy đơn đặt phòng' });

    booking.room_images = JSON.parse(booking.room_images || '[]');
    booking.amenities = JSON.parse(booking.amenities || '[]');

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy chi tiết đơn đặt phòng' });
  }
});

app.post('/api/bookings/:id/pay', async (req, res) => {
  try {
    const { method } = req.body;
    const bookingId = req.params.id;

    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) return res.status(404).json({ error: 'Đơn đặt phòng không tồn tại' });

    const paymentId = 'pay_' + Date.now();
    const transactionId = 'TXN' + Math.floor(100000 + Math.random() * 900000);
    const status = method === 'PAY_AT_HOTEL' ? 'PENDING' : 'SUCCESS';
    const bookingStatus = method === 'PAY_AT_HOTEL' ? 'PENDING' : 'CONFIRMED';

    await dbRun(
      `INSERT INTO payments (id, booking_id, method, transaction_id, amount, status, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, DATETIME('now'))`,
      [paymentId, bookingId, method || 'VNPAY', transactionId, booking.total_price, status]
    );

    await dbRun('UPDATE bookings SET status = ? WHERE id = ?', [bookingStatus, bookingId]);

    res.json({
      message: 'Xác nhận thanh toán thành công!',
      transactionId,
      status: bookingStatus
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Lỗi khi xử lý thanh toán' });
  }
});

app.put('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ error: 'Đơn đặt phòng không tồn tại' });

    if (booking.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Bạn không có quyền hủy đơn này' });
    }

    await dbRun("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Hủy đơn đặt phòng thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi hủy đơn' });
  }
});

// ----------------------------------------------------
// REVIEWS API
// ----------------------------------------------------
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { roomId, rating, comment } = req.body;
    if (!roomId || !rating || !comment) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ số sao và nhận xét' });
    }

    const reviewId = 'rev_' + Date.now();
    await dbRun(
      'INSERT INTO reviews (id, user_id, room_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?, ?)',
      [reviewId, req.user.id, roomId, req.user.name, rating, comment]
    );

    const avgData = await dbGet('SELECT AVG(rating) as avgRating, COUNT(*) as cnt FROM reviews WHERE room_id = ?', [roomId]);
    if (avgData && avgData.cnt > 0) {
      await dbRun('UPDATE rooms SET rating = ?, review_count = ? WHERE id = ?', [
        parseFloat(avgData.avgRating.toFixed(1)),
        avgData.cnt,
        roomId
      ]);
    }

    res.status(201).json({ message: 'Gửi đánh giá thành công!' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lưu đánh giá' });
  }
});

// ----------------------------------------------------
// STRICT SECURE ADMIN API ENDPOINTS
// ----------------------------------------------------
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const revenueRow = await dbGet("SELECT SUM(total_price) as totalRevenue FROM bookings WHERE status = 'CONFIRMED' OR status = 'COMPLETED'");
    const pendingRevenueRow = await dbGet("SELECT SUM(total_price) as pendingRevenue FROM bookings WHERE status = 'PENDING'");
    const totalBookingsRow = await dbGet('SELECT COUNT(*) as totalBookings FROM bookings');
    const confirmedBookingsRow = await dbGet("SELECT COUNT(*) as confirmedBookings FROM bookings WHERE status = 'CONFIRMED' OR status = 'COMPLETED'");
    const totalRoomsRow = await dbGet('SELECT COUNT(*) as totalRooms FROM rooms');

    const activeOccupiedRoomsRow = await dbGet(
      "SELECT COUNT(DISTINCT room_id) as occupiedCount FROM bookings WHERE status = 'CONFIRMED' OR status = 'COMPLETED'"
    );

    const occupiedRoomsCount = activeOccupiedRoomsRow ? activeOccupiedRoomsRow.occupiedCount : 0;
    const availableRoomsCount = Math.max(0, (totalRoomsRow.totalRooms || 0) - occupiedRoomsCount);

    const recentBookings = await dbAll(
      `SELECT b.*, r.name as room_name, r.room_number, r.location, r.hotel_name
       FROM bookings b 
       JOIN rooms r ON b.room_id = r.id 
       ORDER BY b.created_at DESC LIMIT 10`
    );

    const paymentStats = await dbAll(
      `SELECT method, SUM(amount) as totalAmount, COUNT(*) as count 
       FROM payments 
       WHERE status = 'SUCCESS'
       GROUP BY method`
    );

    res.json({
      totalRevenue: revenueRow.totalRevenue || 0,
      pendingRevenue: pendingRevenueRow.pendingRevenue || 0,
      totalBookings: totalBookingsRow.totalBookings || 0,
      confirmedBookings: confirmedBookingsRow.confirmedBookings || 0,
      totalRooms: totalRoomsRow.totalRooms || 0,
      occupiedRoomsCount,
      availableRoomsCount,
      occupancyRate: totalRoomsRow.totalRooms ? Math.round((occupiedRoomsCount / totalRoomsRow.totalRooms) * 100) : 0,
      recentBookings,
      paymentStats
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi lấy thống kê Admin' });
  }
});

app.get('/api/admin/rooms', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rooms = await dbAll(
      `SELECT r.*, rt.name as room_type_name 
       FROM rooms r 
       JOIN room_types rt ON r.room_type_id = rt.id 
       ORDER BY r.location ASC, r.room_number ASC`
    );

    const activeBookings = await dbAll(
      `SELECT b.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.status = 'CONFIRMED' OR b.status = 'PENDING'`
    );

    const formatted = rooms.map(r => {
      const currentBooking = activeBookings.find(b => b.room_id === r.id);
      return {
        ...r,
        images: JSON.parse(r.images || '[]'),
        amenities: JSON.parse(r.amenities || '[]'),
        occupancy_status: currentBooking ? 'OCCUPIED' : 'AVAILABLE',
        current_guest: currentBooking ? {
          guest_name: currentBooking.guest_name,
          guest_email: currentBooking.guest_email,
          guest_phone: currentBooking.guest_phone,
          check_in: currentBooking.check_in,
          check_out: currentBooking.check_out,
          booking_id: currentBooking.id,
          booking_status: currentBooking.status
        } : null
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi tải phòng Admin' });
  }
});

app.get('/api/admin/customers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await dbAll("SELECT id, name, email, phone, role, created_at FROM users WHERE role = 'CUSTOMER'");
    const allBookings = await dbAll(
      `SELECT b.*, r.name as room_name, r.room_number, r.location, r.hotel_name
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       ORDER BY b.created_at DESC`
    );

    const customersWithDetails = users.map(u => {
      const userBookings = allBookings.filter(b => b.user_id === u.id || b.guest_email === u.email);
      const totalSpent = userBookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum, b) => sum + b.total_price, 0);

      const bookedRooms = userBookings.map(b => ({
        booking_id: b.id,
        room_id: b.room_id,
        room_name: b.room_name,
        room_number: b.room_number,
        location: b.location,
        hotel_name: b.hotel_name,
        check_in: b.check_in,
        check_out: b.check_out,
        total_price: b.total_price,
        status: b.status,
        created_at: b.created_at
      }));

      return {
        ...u,
        total_bookings: userBookings.length,
        total_spent: totalSpent,
        booked_rooms: bookedRooms
      };
    });

    res.json(customersWithDetails);
  } catch (error) {
    console.error('Error fetching admin customers:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách khách hàng' });
  }
});

app.post('/api/admin/rooms', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { room_number, room_type_id, name, hotel_name, location, description, price_per_night, capacity, bed_count, size_sqm, images, amenities } = req.body;

    if (!room_number || !name || !price_per_night || !room_type_id) {
      return res.status(400).json({ error: 'Vui lòng điền đủ các thông tin bắt buộc' });
    }

    const existingRoom = await dbGet('SELECT * FROM rooms WHERE room_number = ?', [room_number]);
    if (existingRoom) {
      return res.status(400).json({ error: `Số phòng ${room_number} đã tồn tại trong hệ thống! Vui lòng chọn số phòng khác` });
    }

    const roomId = 'rm_' + Date.now();
    await dbRun(
      `INSERT INTO rooms (id, room_number, room_type_id, name, hotel_name, location, description, price_per_night, capacity, bed_count, size_sqm, images, amenities, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        roomId,
        room_number,
        room_type_id,
        name,
        hotel_name || 'VnStay Hotel',
        location || 'Phú Quốc',
        description || '',
        price_per_night,
        capacity || 2,
        bed_count || 1,
        size_sqm || 30,
        JSON.stringify(images || []),
        JSON.stringify(amenities || [])
      ]
    );

    res.status(201).json({ message: 'Thêm phòng mới thành công!', roomId });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi tạo phòng mới' });
  }
});

app.put('/api/admin/rooms/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, hotel_name, location, description, price_per_night, capacity, bed_count, size_sqm, is_available, images, amenities } = req.body;

    await dbRun(
      `UPDATE rooms 
       SET name = ?, hotel_name = ?, location = ?, description = ?, price_per_night = ?, capacity = ?, bed_count = ?, size_sqm = ?, is_available = ?, images = ?, amenities = ?
       WHERE id = ?`,
      [
        name,
        hotel_name,
        location,
        description,
        price_per_night,
        capacity,
        bed_count,
        size_sqm,
        is_available !== undefined ? (is_available ? 1 : 0) : 1,
        JSON.stringify(images || []),
        JSON.stringify(amenities || []),
        req.params.id
      ]
    );

    res.json({ message: 'Cập nhật phòng thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật thông tin phòng' });
  }
});

app.delete('/api/admin/rooms/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await dbRun('DELETE FROM rooms WHERE id = ?', [req.params.id]);
    res.json({ message: 'Xóa phòng thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xóa phòng' });
  }
});

app.get('/api/admin/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await dbAll(
      `SELECT b.*, r.name as room_name, r.room_number, r.location, r.hotel_name, p.method as payment_method, p.status as payment_status
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       LEFT JOIN payments p ON p.booking_id = b.id
       ORDER BY b.created_at DESC`
    );

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi tải danh sách đơn đặt phòng Admin' });
  }
});

app.put('/api/admin/bookings/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await dbRun('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Cập nhật trạng thái đơn thành ${status} thành công` });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật đơn' });
  }
});

// Admin Walk-in Booking (Đặt phòng trực tiếp tại quầy)
app.post('/api/admin/bookings/walk-in', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { room_id, guest_name, guest_email, guest_phone, check_in, check_out, guest_count, total_price, payment_method } = req.body;
    if (!room_id || !guest_name || !guest_phone || !check_in || !check_out) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin phòng, tên khách, SĐT và ngày lưu trú' });
    }

    const bookingId = 'bk_walkin_' + Date.now();
    await dbRun(
      `INSERT INTO bookings (id, user_id, room_id, check_in, check_out, guest_count, total_price, status, guest_name, guest_email, guest_phone, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, 'Khách đặt trực tiếp tại quầy lễ tân')`,
      [bookingId, 'usr_walkin', room_id, check_in, check_out, guest_count || 2, total_price, guest_name, guest_email || 'walkin@vnstay.vn', guest_phone]
    );

    const paymentId = 'pay_' + Date.now();
    await dbRun(
      `INSERT INTO payments (id, booking_id, method, amount, status, paid_at) VALUES (?, ?, ?, ?, 'SUCCESS', CURRENT_TIMESTAMP)`,
      [paymentId, bookingId, payment_method || 'CASH', total_price]
    );

    res.status(201).json({ message: 'Tạo đơn đặt phòng trực tiếp tại quầy thành công!', bookingId });
  } catch (error) {
    console.error('Walk-in booking error:', error);
    res.status(500).json({ error: 'Lỗi khi tạo đơn đặt phòng tại quầy' });
  }
});

// Admin Toggle Maintenance Status
app.put('/api/admin/rooms/:id/toggle-maintenance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const room = await dbGet('SELECT is_available FROM rooms WHERE id = ?', [req.params.id]);
    if (!room) return res.status(404).json({ error: 'Phòng không tồn tại' });

    const newStatus = room.is_available === 1 ? 0 : 1;
    await dbRun('UPDATE rooms SET is_available = ? WHERE id = ?', [newStatus, req.params.id]);

    res.json({ message: `Đã chuyển trạng thái phòng thành ${newStatus === 1 ? 'Sẵn sàng đón khách 🟢' : 'Đang bảo trì 🔴'}` });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi thay đổi trạng thái phòng' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 VnStay Backend Server running securely on port ${PORT}`);
});
