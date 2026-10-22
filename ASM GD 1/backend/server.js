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
    const { capacity, minPrice, maxPrice, roomTypeId, location, search, sortBy, status, checkIn, checkOut } = req.query;
    const todayStr = new Date().toISOString().split('T')[0];

    // Tự động chuyển trạng thái COMPLETED cho các đơn khách đã trả phòng trong quá khứ
    await dbRun(
      `UPDATE bookings 
       SET status = 'COMPLETED' 
       WHERE check_out <= ? AND status IN ('CONFIRMED', 'PAID')`,
      [todayStr]
    ).catch(() => {});

    let sql = `
      SELECT r.*, rt.name as room_type_name 
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE 1=1
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

    // Lấy thông tin các đơn đặt phòng chưa hết hạn lưu trú (check_out > today)
    const activeBookings = await dbAll(
      `SELECT room_id, guest_name, check_in, check_out, status 
       FROM bookings 
       WHERE status IN ('CONFIRMED', 'PAID', 'PENDING', 'AWAITING_PAYMENT_CONFIRMATION')
         AND check_out > ?`,
      [todayStr]
    );

    const bookingsByRoom = {};
    activeBookings.forEach(b => {
      if (!bookingsByRoom[b.room_id]) bookingsByRoom[b.room_id] = [];
      bookingsByRoom[b.room_id].push(b);
    });

    let rooms = rows.map(r => {
      const roomBookings = bookingsByRoom[r.id] || [];
      let isOccupied = false;
      let overlappingBooking = null;

      // Nếu khách tìm kiếm theo khoảng ngày cụ thể:
      // Kiểm tra trùng lịch: b.check_in < reqCheckOut AND b.check_out > reqCheckIn
      if (checkIn && checkOut) {
        overlappingBooking = roomBookings.find(b => b.check_in < checkOut && b.check_out > checkIn);
        isOccupied = r.is_available === 0 || !!overlappingBooking;
      } else {
        // Nếu xem trang chủ theo ngày hiện tại:
        // Phòng kín nếu hôm nay nằm trong đợt ở: b.check_in <= todayStr AND b.check_out > todayStr
        const currentStay = roomBookings.find(b => b.check_in <= todayStr && b.check_out > todayStr);
        isOccupied = r.is_available === 0 || !!currentStay;
        overlappingBooking = currentStay;
      }

      return {
        ...r,
        images: JSON.parse(r.images || '[]'),
        amenities: JSON.parse(r.amenities || '[]'),
        occupancy_status: isOccupied ? 'OCCUPIED' : 'AVAILABLE',
        is_occupied: isOccupied,
        is_available: isOccupied ? 0 : 1,
        active_booking: overlappingBooking || null,
        booked_ranges: roomBookings.map(b => ({
          check_in: b.check_in,
          check_out: b.check_out,
          status: b.status
        }))
      };
    });

    if (status === 'AVAILABLE') {
      rooms = rooms.filter(r => r.occupancy_status === 'AVAILABLE');
    } else if (status === 'OCCUPIED') {
      rooms = rooms.filter(r => r.occupancy_status === 'OCCUPIED');
    }

    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Lỗi khi tải danh sách phòng' });
  }
});

app.get('/api/rooms/:id', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
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

    // Lấy tất cả các đợt phòng đã có khách đặt chưa hết hạn
    const activeBookings = await dbAll(
      `SELECT id, guest_name, check_in, check_out, status 
       FROM bookings 
       WHERE room_id = ? 
         AND status IN ('CONFIRMED', 'PAID', 'PENDING', 'AWAITING_PAYMENT_CONFIRMATION')
         AND check_out > ?
       ORDER BY check_in ASC`,
      [req.params.id, todayStr]
    );

    // Kiểm tra xem hôm nay có khách đang ở hay không
    const currentStay = activeBookings.find(b => b.check_in <= todayStr && b.check_out > todayStr);
    const isOccupiedToday = room.is_available === 0 || !!currentStay;

    room.occupancy_status = isOccupiedToday ? 'OCCUPIED' : 'AVAILABLE';
    room.is_occupied = isOccupiedToday;
    room.current_stay = currentStay || null;
    room.booked_ranges = activeBookings.map(b => ({
      id: b.id,
      check_in: b.check_in,
      check_out: b.check_out,
      guest_name: b.guest_name,
      status: b.status
    }));

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

    // Kiểm tra xem khoảng ngày khách chọn có bị trùng lịch với đơn đặt phòng khác không
    const overlap = await dbGet(
      `SELECT id, guest_name, check_in, check_out FROM bookings 
       WHERE room_id = ? 
         AND status IN ('CONFIRMED', 'PAID', 'PENDING', 'AWAITING_PAYMENT_CONFIRMATION')
         AND check_in < ? AND check_out > ?`,
      [roomId, checkOut, checkIn]
    );
    if (overlap) {
      return res.status(400).json({ 
        error: `Phòng đã có lịch khách đặt từ ngày ${overlap.check_in} đến ${overlap.check_out}. Quý khách vui lòng chọn các ngày khác còn trống!` 
      });
    }

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

    const booking = await dbGet(
      `SELECT b.*, r.name as room_name, r.room_number 
       FROM bookings b 
       LEFT JOIN rooms r ON b.room_id = r.id 
       WHERE b.id = ?`, 
      [bookingId]
    );
    if (!booking) return res.status(404).json({ error: 'Đơn đặt phòng không tồn tại' });

    const paymentId = 'pay_' + Date.now();
    const transactionId = 'TXN' + Math.floor(100000 + Math.random() * 900000);
    const isPayAtHotel = method === 'PAY_AT_HOTEL';
    
    // Nếu khách chuyển khoản QR: chuyển trạng thái chờ Admin kiểm tra tài khoản
    // Nếu khách thanh toán tại quầy: chuyển trạng thái PENDING
    const status = isPayAtHotel ? 'PENDING' : 'AWAITING_CONFIRMATION';
    const bookingStatus = isPayAtHotel ? 'PENDING' : 'AWAITING_PAYMENT_CONFIRMATION';

    await dbRun(
      `INSERT INTO payments (id, booking_id, method, transaction_id, amount, status, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, DATETIME('now'))`,
      [paymentId, bookingId, method || 'VNPAY', transactionId, booking.total_price, status]
    );

    await dbRun('UPDATE bookings SET status = ? WHERE id = ?', [bookingStatus, bookingId]);

    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price);
    const notifId = 'notif_' + Date.now();

    if (!isPayAtHotel) {
      // Gửi thông báo đến Admin: Khách báo đã chuyển khoản, Admin cần kiểm tra tài khoản ngân hàng để duyệt
      await dbRun(
        `INSERT INTO notifications (id, type, title, message, booking_id, amount, guest_name, room_name, is_read, created_at)
         VALUES (?, 'PAYMENT_SUBMITTED', ?, ?, ?, ?, ?, ?, 0, DATETIME('now'))`,
        [
          notifId,
          'Khách Báo Đã Chuyển Tiền - Cần Kiểm Tra & Xác Nhận!',
          `Khách hàng ${booking.guest_name} (${booking.guest_phone}) đã quét VietQR và báo đã chuyển khoản số tiền ${formattedPrice} cho đơn đặt phòng #${bookingId} - Phòng ${booking.room_number || ''} (${booking.room_name || 'Phòng nghỉ'}). Admin vui lòng kiểm tra tài khoản nhận tiền và bấm "Đã Nhận Tiền & Duyệt".`,
          bookingId,
          booking.total_price,
          booking.guest_name,
          booking.room_name || 'Phòng nghỉ'
        ]
      );
    } else {
      // Thông báo đặt phòng thanh toán tại quầy
      await dbRun(
        `INSERT INTO notifications (id, type, title, message, booking_id, amount, guest_name, room_name, is_read, created_at)
         VALUES (?, 'PAYMENT_SUBMITTED', ?, ?, ?, ?, ?, ?, 0, DATETIME('now'))`,
        [
          notifId,
          'Đơn Đặt Phòng Mới (Thanh Toán Tại Khách Sạn)',
          `Khách hàng ${booking.guest_name} (${booking.guest_phone}) đã đặt phòng #${bookingId} - Phòng ${booking.room_number || ''} (${booking.room_name || 'Phòng nghỉ'}) với hình thức thanh toán trực tiếp tại quầy lễ tân: ${formattedPrice}.`,
          bookingId,
          booking.total_price,
          booking.guest_name,
          booking.room_name || 'Phòng nghỉ'
        ]
      );
    }

    res.json({
      message: isPayAtHotel 
        ? 'Xác nhận đặt phòng tại khách sạn thành công!' 
        : 'Đã gửi thông tin chuyển khoản tới Admin! Quản trị viên đang kiểm tra tài khoản ngân hàng để xác nhận đơn.',
      transactionId,
      status: bookingStatus
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Lỗi khi xử lý thanh toán' });
  }
});

// Admin kiểm tra ngân hàng và Xác nhận đã nhận tiền thành công
app.post('/api/admin/bookings/:id/confirm-payment', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await dbGet(
      `SELECT b.*, r.name as room_name, r.room_number 
       FROM bookings b 
       LEFT JOIN rooms r ON b.room_id = r.id 
       WHERE b.id = ?`,
      [bookingId]
    );
    if (!booking) return res.status(404).json({ error: 'Đơn đặt phòng không tồn tại' });

    // Cập nhật đơn sang CONFIRMED và thanh toán sang SUCCESS
    await dbRun(`UPDATE bookings SET status = 'CONFIRMED' WHERE id = ?`, [bookingId]);
    await dbRun(
      `UPDATE payments SET status = 'SUCCESS', paid_at = DATETIME('now') WHERE booking_id = ?`,
      [bookingId]
    );

    // Đánh dấu phòng đã kín khách
    await dbRun(`UPDATE rooms SET is_available = 0 WHERE id = ?`, [booking.room_id]);

    // Gửi thông báo thanh toán thành công
    const notifId = 'notif_cf_' + Date.now();
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price || 0);
    await dbRun(
      `INSERT INTO notifications (id, type, title, message, booking_id, amount, guest_name, room_name, is_read, created_at)
       VALUES (?, 'PAYMENT_SUCCESS', ?, ?, ?, ?, ?, ?, 0, DATETIME('now'))`,
      [
        notifId,
        'Admin Đã Xác Nhận Nhận Đủ Tiền & Duyệt Đơn!',
        `Admin đã kiểm tra tài khoản ngân hàng và xác nhận nhận đủ số tiền ${formattedPrice} của khách ${booking.guest_name} (${booking.guest_phone}) cho đơn #${bookingId}. Đơn đã được phê duyệt thành công.`,
        bookingId,
        booking.total_price,
        booking.guest_name,
        booking.room_name || 'Phòng nghỉ'
      ]
    );

    res.json({ message: `Đã xác nhận nhận đủ tiền và duyệt đơn #${bookingId} thành công!`, bookingId });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Lỗi khi xác nhận nhận tiền' });
  }
});

// Admin kiểm tra ngân hàng và Báo chưa nhận được tiền
app.post('/api/admin/bookings/:id/reject-payment', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { reason } = req.body;
    const booking = await dbGet(
      `SELECT b.*, r.name as room_name, r.room_number 
       FROM bookings b 
       LEFT JOIN rooms r ON b.room_id = r.id 
       WHERE b.id = ?`,
      [bookingId]
    );
    if (!booking) return res.status(404).json({ error: 'Đơn đặt phòng không tồn tại' });

    // Đưa đơn về trạng thái PAYMENT_FAILED hoặc PENDING để khách thử lại
    await dbRun(`UPDATE bookings SET status = 'PAYMENT_FAILED' WHERE id = ?`, [bookingId]);
    await dbRun(`UPDATE payments SET status = 'FAILED' WHERE booking_id = ?`, [bookingId]);

    const notifId = 'notif_rj_' + Date.now();
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price || 0);
    await dbRun(
      `INSERT INTO notifications (id, type, title, message, booking_id, amount, guest_name, room_name, is_read, created_at)
       VALUES (?, 'PAYMENT_FAILED', ?, ?, ?, ?, ?, ?, 0, DATETIME('now'))`,
      [
        notifId,
        'Chưa Nhận Được Tiền Đơn #' + bookingId,
        `Admin đã kiểm tra tài khoản nhưng chưa thấy giao dịch chuyển khoản ${formattedPrice} của khách ${booking.guest_name} (${booking.guest_phone}). ${reason ? 'Lý do: ' + reason : 'Đơn đã chuyển về trạng thái Chưa thanh toán.'}`,
        bookingId,
        booking.total_price,
        booking.guest_name,
        booking.room_name || 'Phòng nghỉ'
      ]
    );

    res.json({ message: `Đã báo chưa nhận được tiền cho đơn #${bookingId}`, bookingId });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ error: 'Lỗi khi từ chối xác nhận thanh toán' });
  }
});

// API Ghi nhận thanh toán thất bại và thông báo về Admin
app.post('/api/bookings/:id/payment-failed', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { reason } = req.body;
    const booking = await dbGet(
      `SELECT b.*, r.name as room_name, r.room_number 
       FROM bookings b 
       LEFT JOIN rooms r ON b.room_id = r.id 
       WHERE b.id = ?`,
      [bookingId]
    );
    if (!booking) return res.status(404).json({ error: 'Đơn đặt phòng không tồn tại' });

    const paymentId = 'pay_fail_' + Date.now();
    await dbRun(
      `INSERT INTO payments (id, booking_id, method, amount, status, paid_at)
       VALUES (?, ?, 'VNPAY_VIETQR', ?, 'FAILED', DATETIME('now'))`,
      [paymentId, bookingId, booking.total_price]
    );

    const notifId = 'notif_' + Date.now();
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price);
    const reasonDetail = reason || 'Khách hàng hủy giao dịch hoặc chuyển khoản thất bại/hết hạn';

    await dbRun(
      `INSERT INTO notifications (id, type, title, message, booking_id, amount, guest_name, room_name, is_read, created_at)
       VALUES (?, 'PAYMENT_FAILED', ?, ?, ?, ?, ?, ?, 0, DATETIME('now'))`,
      [
        notifId,
        'Thanh Toán Tiền Phòng Thất Bại!',
        `Đơn đặt phòng #${bookingId} của khách ${booking.guest_name} (${booking.guest_phone}) thanh toán thất bại (${reasonDetail}). Số tiền: ${formattedPrice}. Vui lòng kiểm tra và liên hệ hỗ trợ khách hàng!`,
        bookingId,
        booking.total_price,
        booking.guest_name,
        booking.room_name || 'Phòng nghỉ'
      ]
    );

    res.json({ message: 'Đã ghi nhận thanh toán thất bại và báo về Admin', notifId });
  } catch (error) {
    console.error('Payment failed logging error:', error);
    res.status(500).json({ error: 'Lỗi ghi nhận thanh toán thất bại' });
  }
});

// ----------------------------------------------------
// ADMIN NOTIFICATIONS API
// ----------------------------------------------------
app.get('/api/admin/notifications', async (req, res) => {
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        booking_id TEXT,
        amount REAL,
        guest_name TEXT,
        room_name TEXT,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const notifications = await dbAll('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
    const unreadCountRow = await dbGet('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0');
    res.json({
      notifications,
      unreadCount: unreadCountRow ? unreadCountRow.count : 0
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách thông báo' });
  }
});

app.put('/api/admin/notifications/:id/read', async (req, res) => {
  try {
    await dbRun('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã đánh dấu đã đọc' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật thông báo' });
  }
});

app.put('/api/admin/notifications/mark-all-read', async (req, res) => {
  try {
    await dbRun('UPDATE notifications SET is_read = 1');
    res.json({ message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật thông báo' });
  }
});

app.delete('/api/admin/notifications/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã xóa thông báo' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xóa thông báo' });
  }
});

// ----------------------------------------------------
// PAYMENT CONFIG API (Cấu hình tài khoản nhận tiền thật MoMo & VNPay / VietQR)
// ----------------------------------------------------
const defaultPaymentConfig = {
  bankId: 'MB',
  bankName: 'MBBank (Ngân hàng Quân Đội)',
  accountNo: '0355133380',
  accountName: 'DANG QUOC TOAN',
  momoPhone: '0355133380',
  momoName: 'DANG QUOC TOAN'
};

app.get('/api/payment-config', async (req, res) => {
  try {
    const row = await dbGet('SELECT * FROM payment_configs WHERE id = 1');
    if (row && row.data) {
      return res.json(JSON.parse(row.data));
    }
    res.json(defaultPaymentConfig);
  } catch (error) {
    console.error('Fetch payment config error:', error);
    res.json(defaultPaymentConfig);
  }
});

app.put('/api/payment-config', async (req, res) => {
  try {
    const { bankId, bankName, accountNo, accountName, momoPhone, momoName } = req.body;
    const current = await dbGet('SELECT * FROM payment_configs WHERE id = 1');
    const existing = current && current.data ? JSON.parse(current.data) : defaultPaymentConfig;

    const updated = {
      bankId: bankId || existing.bankId,
      bankName: bankName || existing.bankName,
      accountNo: accountNo || existing.accountNo,
      accountName: (accountName || existing.accountName).toUpperCase(),
      momoPhone: momoPhone || existing.momoPhone,
      momoName: (momoName || existing.momoName).toUpperCase()
    };

    await dbRun('CREATE TABLE IF NOT EXISTS payment_configs (id INTEGER PRIMARY KEY, data TEXT NOT NULL)');
    await dbRun('INSERT OR REPLACE INTO payment_configs (id, data) VALUES (1, ?)', [JSON.stringify(updated)]);

    res.json({ message: 'Lưu thông tin tài khoản nhận tiền thành công!', config: updated });
  } catch (error) {
    console.error('Save payment config error:', error);
    res.status(500).json({ error: 'Không thể lưu cấu hình nhận tiền' });
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
// REFUND WORKFLOW API (HỦY PHÒNG & CHUYỂN TIỀN HOÀN TRẢ)
// ----------------------------------------------------
app.post('/api/bookings/:id/request-refund', authenticateToken, async (req, res) => {
  try {
    const { refund_bank, refund_account_no, refund_account_name, refund_reason } = req.body;
    if (!refund_bank || !refund_account_no || !refund_account_name) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin ngân hàng, số tài khoản và tên chủ tài khoản nhận tiền hoàn' });
    }

    const booking = await dbGet('SELECT b.*, r.name as room_name, r.room_number FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ error: 'Đơn đặt phòng không tồn tại' });

    if (booking.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Bạn không có quyền yêu cầu hoàn tiền cho đơn này' });
    }

    // Cập nhật trạng thái đơn thành REFUND_REQUESTED và lưu tài khoản nhận lại tiền
    await dbRun(`
      UPDATE bookings 
      SET status = 'REFUND_REQUESTED',
          refund_bank = ?,
          refund_account_no = ?,
          refund_account_name = ?,
          refund_reason = ?
      WHERE id = ?
    `, [refund_bank, refund_account_no.trim(), refund_account_name.trim().toUpperCase(), refund_reason || '', req.params.id]);

    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price || 0);

    // Gửi thông báo ngay về phía Admin
    const notifId = 'notif_ref_' + Date.now();
    await dbRun(`
      INSERT INTO notifications (id, type, title, message, booking_id, amount, guest_name, room_name, is_read, created_at)
      VALUES (?, 'REFUND_REQUESTED', ?, ?, ?, ?, ?, ?, 0, DATETIME('now'))
    `, [
      notifId,
      'Yêu Cầu Hủy Phòng & Hoàn Tiền!',
      `Khách hàng ${booking.guest_name} (${booking.guest_phone}) yêu cầu hủy phòng #${booking.id} - Phòng ${booking.room_number || ''} (${booking.room_name || ''}) và hoàn lại số tiền ${formattedPrice}. Tài khoản nhận: ${refund_bank} - ${refund_account_no} (${refund_account_name}). Lý do: ${refund_reason || 'Không ghi chú'}.`,
      booking.id,
      booking.total_price,
      booking.guest_name,
      booking.room_name
    ]);

    res.json({ message: 'Yêu cầu hủy phòng và hoàn tiền đã được gửi tới Quản trị viên (Admin). Admin sẽ kiểm tra và chuyển khoản hoàn trả sớm nhất!' });
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi gửi yêu cầu hoàn tiền' });
  }
});

// Admin xác nhận đã chuyển tiền hoàn trả cho khách
app.post('/api/admin/bookings/:id/confirm-refund', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const booking = await dbGet('SELECT b.*, r.name as room_name, r.room_number FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ error: 'Đơn đặt phòng không tồn tại' });

    // Cập nhật trạng thái booking thành REFUNDED
    await dbRun(`
      UPDATE bookings 
      SET status = 'REFUNDED',
          refunded_at = DATETIME('now')
      WHERE id = ?
    `, [req.params.id]);

    // Cập nhật payments thành REFUNDED
    await dbRun(`UPDATE payments SET status = 'REFUNDED' WHERE booking_id = ?`, [req.params.id]);

    // Giải phóng phòng để khách khác có thể đặt
    await dbRun(`UPDATE rooms SET is_available = 1 WHERE id = ?`, [booking.room_id]);

    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price || 0);

    // Gửi thông báo xác nhận hoàn tất hoàn tiền
    const notifId = 'notif_done_' + Date.now();
    await dbRun(`
      INSERT INTO notifications (id, type, title, message, booking_id, amount, guest_name, room_name, is_read, created_at)
      VALUES (?, 'REFUND_COMPLETED', ?, ?, ?, ?, ?, ?, 0, DATETIME('now'))
    `, [
      notifId,
      'Đã Hoàn Tiền Chuyển Khoản Xong!',
      `Đã chuyển tiền hoàn trả ${formattedPrice} về STK ${booking.refund_bank || 'MB'} - ${booking.refund_account_no} (${booking.refund_account_name}) cho khách ${booking.guest_name}. Đơn #${booking.id} đã hoàn tất và phòng ${booking.room_number || ''} đã mở lại sẵn sàng.`,
      booking.id,
      booking.total_price,
      booking.guest_name,
      booking.room_name
    ]);

    res.json({ message: 'Xác nhận đã chuyển tiền hoàn trả cho khách thành công! Đơn đặt đã chuyển trạng thái ĐÃ HOÀN TIỀN.' });
  } catch (error) {
    console.error('Confirm refund error:', error);
    res.status(500).json({ error: 'Lỗi khi xác nhận hoàn tiền' });
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
    const todayStr = new Date().toISOString().split('T')[0];

    // Tự động hoàn thành các đơn đã qua ngày trả phòng
    await dbRun(
      `UPDATE bookings SET status = 'COMPLETED' 
       WHERE check_out <= ? AND status IN ('CONFIRMED', 'PAID')`,
      [todayStr]
    );

    const revenueRow = await dbGet("SELECT SUM(total_price) as totalRevenue FROM bookings WHERE status = 'CONFIRMED' OR status = 'COMPLETED'");
    const pendingRevenueRow = await dbGet("SELECT SUM(total_price) as pendingRevenue FROM bookings WHERE status = 'PENDING'");
    const totalBookingsRow = await dbGet('SELECT COUNT(*) as totalBookings FROM bookings');
    const confirmedBookingsRow = await dbGet("SELECT COUNT(*) as confirmedBookings FROM bookings WHERE status = 'CONFIRMED' OR status = 'COMPLETED'");
    const totalRoomsRow = await dbGet('SELECT COUNT(*) as totalRooms FROM rooms');

    // Phòng hiện đang có khách ở hôm nay
    const activeOccupiedRoomsRow = await dbGet(
      `SELECT COUNT(DISTINCT room_id) as occupiedCount 
       FROM bookings 
       WHERE status IN ('CONFIRMED', 'PAID') 
         AND check_in <= ? AND check_out > ?`,
      [todayStr, todayStr]
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
    const todayStr = new Date().toISOString().split('T')[0];

    // Tự động hoàn thành các đơn đã qua ngày trả phòng
    await dbRun(
      `UPDATE bookings SET status = 'COMPLETED' 
       WHERE check_out <= ? AND status IN ('CONFIRMED', 'PAID')`,
      [todayStr]
    );

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
       WHERE b.status IN ('CONFIRMED', 'PAID', 'PENDING', 'AWAITING_PAYMENT_CONFIRMATION')
         AND b.check_out > ?
       ORDER BY b.check_in ASC`,
      [todayStr]
    );

    const formatted = rooms.map(r => {
      const currentStay = activeBookings.find(b => b.room_id === r.id && b.check_in <= todayStr && b.check_out > todayStr);
      const roomBookings = activeBookings.filter(b => b.room_id === r.id);

      return {
        ...r,
        images: JSON.parse(r.images || '[]'),
        amenities: JSON.parse(r.amenities || '[]'),
        occupancy_status: (r.is_available === 0 || currentStay) ? 'OCCUPIED' : 'AVAILABLE',
        current_guest: currentStay ? {
          guest_name: currentStay.guest_name,
          guest_email: currentStay.guest_email,
          guest_phone: currentStay.guest_phone,
          check_in: currentStay.check_in,
          check_out: currentStay.check_out,
          booking_id: currentStay.id,
          booking_status: currentStay.status
        } : null,
        booked_ranges: roomBookings.map(b => ({
          booking_id: b.id,
          guest_name: b.guest_name,
          check_in: b.check_in,
          check_out: b.check_out,
          status: b.status
        }))
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

// Admin thực hiện trả phòng (Check-out) cho khách và giải phóng phòng ngay lập tức
app.post('/api/admin/bookings/:id/checkout', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const booking = await dbGet(
      'SELECT b.*, r.name as room_name, r.room_number FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.id = ?',
      [req.params.id]
    );
    if (!booking) return res.status(404).json({ error: 'Đơn đặt phòng không tồn tại' });

    // Cập nhật trạng thái thành COMPLETED
    await dbRun("UPDATE bookings SET status = 'COMPLETED' WHERE id = ?", [req.params.id]);

    // Đảm bảo phòng ở trạng thái sẵn sàng đón khách
    await dbRun('UPDATE rooms SET is_available = 1 WHERE id = ?', [booking.room_id]);

    // Tạo thông báo hoàn tất trả phòng
    const notifId = 'notif_co_' + Date.now();
    await dbRun(
      `INSERT INTO notifications (id, type, title, message, booking_id, amount, guest_name, room_name, is_read, created_at)
       VALUES (?, 'CHECKOUT_COMPLETED', ?, ?, ?, ?, ?, ?, 0, DATETIME('now'))`,
      [
        notifId,
        'Khách Đã Trả Phòng (Check-out)',
        `Khách hàng ${booking.guest_name} đã hoàn tất thủ tục trả phòng ${booking.room_number || ''} (${booking.room_name}). Phòng đã trống và sẵn sàng đón lượt khách tiếp theo cho các ngày chưa có lịch!`,
        booking.id,
        booking.total_price,
        booking.guest_name,
        booking.room_name
      ]
    );

    res.json({ message: `Đã hoàn tất trả phòng cho khách ${booking.guest_name}! Phòng ${booking.room_number || ''} đã sẵn sàng đón khách mới.` });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Lỗi khi thực hiện thủ tục trả phòng' });
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
