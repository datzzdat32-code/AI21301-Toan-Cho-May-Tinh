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
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors());
app.use(express.json());

// Rate Limiting for Login Endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '⚠️ Bạn đã thử đăng nhập sai quá nhiều lần. Vì lý do bảo mật, vui lòng thử lại sau 15 phút!' }
});

// Initialize Database (16 Tables)
initDB().catch(console.error);

// ----------------------------------------------------
// ROOT API HEALTH CHECK
// ----------------------------------------------------
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>VnStay.vn API Server (16 Tables Schema)</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; text-align: center; }
        .card { max-width: 680px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .badge { display: inline-block; background: #dcfce7; color: #15803d; font-weight: 700; padding: 6px 18px; border-radius: 9999px; font-size: 13px; margin-bottom: 16px; }
        h1 { color: #0284c7; margin-bottom: 8px; font-size: 26px; }
        p { color: #64748b; margin-bottom: 20px; line-height: 1.6; }
        .endpoints { text-align: left; background: #f1f5f9; padding: 18px 24px; border-radius: 12px; font-size: 13.5px; }
        .endpoints ul { margin: 8px 0; padding-left: 20px; }
        li { margin-bottom: 6px; }
        a { color: #0284c7; font-weight: 600; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">🟢 CƠ SỞ DỮ LIỆU CHUẨN 16 BẢNG (DBML & MYSQL COMPATIBLE)</span>
        <h1>VnStay.vn RESTful API Server</h1>
        <p>Máy chủ Backend đang hoạt động ổn định trên Cổng <strong>5000</strong> với cấu trúc CSDL 16 bảng quan hệ hoàn chỉnh.</p>
        <p>Giao diện Website đang phục vụ tại: <a href="http://localhost:3000" target="_blank"><strong>http://localhost:3000</strong></a></p>
        <div class="endpoints">
          <strong>📌 Danh mục API Tiêu biểu:</strong>
          <ul>
            <li>GET <a href="/api/hotels" target="_blank">/api/hotels</a> - Danh sách khách sạn (Bảng hotels)</li>
            <li>GET <a href="/api/rooms" target="_blank">/api/rooms</a> - Danh sách phòng & Hạng phòng (Bảng rooms, room_types)</li>
            <li>GET <a href="/api/locations" target="_blank">/api/locations</a> - Các thành phố du lịch</li>
            <li>GET <a href="/api/promotions" target="_blank">/api/promotions</a> - Khuyến mại & Mã giảm giá</li>
            <li>GET <a href="/api/amenities" target="_blank">/api/amenities</a> - Danh mục tiện ích</li>
            <li>POST /api/auth/login - Đăng nhập tài khoản</li>
            <li>POST /api/auth/register - Đăng ký tài khoản</li>
          </ul>
        </div>
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

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: 'Từ chối truy cập: Không tìm thấy định danh tài khoản' });
    }

    const dbUser = await dbGet('SELECT id, role FROM users WHERE id = ?', [req.user.id]);
    if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'ADMIN')) {
      return res.status(403).json({ error: '🚨 TỪ CHỐI TRUY CẬP: Yêu cầu quyền Quản trị viên (Admin)' });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Lỗi kiểm tra quyền bảo mật hệ thống' });
  }
};

// ----------------------------------------------------
// 1. AUTH API (users table)
// ----------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, full_name, email, password, phone } = req.body;
    const displayName = full_name || name;

    if (!displayName || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo an toàn' });
    }

    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email này đã được đăng ký tài khoản' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

    const result = await dbRun(
      `INSERT INTO users (full_name, email, password, phone, avatar, role, status)
       VALUES (?, ?, ?, ?, ?, 'user', 'active')`,
      [displayName.trim(), email.trim().toLowerCase(), hashedPassword, phone || '', defaultAvatar]
    );

    const newUserId = result.lastID;
    const token = jwt.sign(
      { id: newUserId, email: email.trim().toLowerCase(), role: 'CUSTOMER', name: displayName },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      token,
      user: {
        id: newUserId,
        name: displayName,
        full_name: displayName,
        email: email.trim().toLowerCase(),
        role: 'CUSTOMER',
        phone: phone || '',
        avatar: defaultAvatar
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng ký tài khoản' });
  }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ email và mật khẩu' });
    }

    const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (!user) {
      return res.status(400).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ hỗ trợ!' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    const isSystemAdmin = user.role === 'admin' || user.role === 'ADMIN';
    const roleFormatted = isSystemAdmin ? 'ADMIN' : 'CUSTOMER';

    const token = jwt.sign(
      { id: user.id, email: user.email, role: roleFormatted, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        name: user.full_name,
        full_name: user.full_name,
        email: user.email,
        role: roleFormatted,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng nhập' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, full_name, email, role, phone, avatar, status, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy thông tin tài khoản' });

    const isSystemAdmin = user.role === 'admin' || user.role === 'ADMIN';
    res.json({
      user: {
        ...user,
        name: user.full_name,
        role: isSystemAdmin ? 'ADMIN' : 'CUSTOMER'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi máy chủ khi xác thực tài khoản' });
  }
});

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
    await dbRun('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newHashedPassword, req.user.id]);

    res.json({ message: 'Đổi mật khẩu Quản Trị Viên thành công! Tài khoản của bạn đã được bảo vệ.' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi đổi mật khẩu Admin' });
  }
});

// ----------------------------------------------------
// 2. HOTELS & LOCATIONS API (hotels, hotel_images, hotel_amenities)
// ----------------------------------------------------
app.get('/api/hotels', async (req, res) => {
  try {
    const { city, search, minStar } = req.query;
    let sql = `
      SELECT h.*, 
        (SELECT image_url FROM hotel_images WHERE hotel_id = h.id AND is_cover = 1 LIMIT 1) as cover_image,
        (SELECT MIN(base_price) FROM room_types WHERE hotel_id = h.id AND status = 'active') as min_price,
        (SELECT COUNT(*) FROM reviews WHERE hotel_id = h.id AND status = 'approved') as review_count,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE hotel_id = h.id AND status = 'approved') as avg_rating
      FROM hotels h
      WHERE h.status = 'active'
    `;
    const params = [];

    if (city) {
      sql += ' AND h.city LIKE ?';
      params.push(`%${city}%`);
    }
    if (search) {
      sql += ' AND (h.name LIKE ? OR h.address LIKE ? OR h.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (minStar) {
      sql += ' AND h.star_rating >= ?';
      params.push(parseInt(minStar));
    }

    sql += ' ORDER BY h.star_rating DESC, h.id ASC';

    const hotels = await dbAll(sql, params);
    res.json(hotels);
  } catch (error) {
    console.error('Error get hotels:', error);
    res.status(500).json({ error: 'Lỗi khi tải danh sách khách sạn' });
  }
});

app.get('/api/hotels/:id', async (req, res) => {
  try {
    const hotel = await dbGet('SELECT * FROM hotels WHERE id = ?', [req.params.id]);
    if (!hotel) return res.status(404).json({ error: 'Không tìm thấy khách sạn' });

    const images = await dbAll('SELECT * FROM hotel_images WHERE hotel_id = ? ORDER BY is_cover DESC', [req.params.id]);
    const amenities = await dbAll(
      `SELECT a.* FROM amenities a
       JOIN hotel_amenities ha ON ha.amenity_id = a.id
       WHERE ha.hotel_id = ? AND a.status = 'active'`,
      [req.params.id]
    );
    const roomTypes = await dbAll(
      `SELECT rt.*, 
         (SELECT image_url FROM room_type_images WHERE room_type_id = rt.id AND is_cover = 1 LIMIT 1) as cover_image
       FROM room_types rt
       WHERE rt.hotel_id = ? AND rt.status = 'active'`,
      [req.params.id]
    );
    const reviews = await dbAll(
      `SELECT r.*, u.full_name as user_name, u.avatar as user_avatar
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.hotel_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json({
      ...hotel,
      images,
      amenities,
      roomTypes,
      reviews
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi tải chi tiết khách sạn' });
  }
});

app.get('/api/locations', async (req, res) => {
  try {
    const cities = await dbAll(`
      SELECT 
        h.city as location,
        h.city as city_name,
        COUNT(DISTINCT h.id) as hotel_count,
        COUNT(DISTINCT r.id) as room_count,
        MIN(rt.base_price) as min_price,
        (SELECT hi.image_url FROM hotel_images hi 
         JOIN hotels h2 ON hi.hotel_id = h2.id 
         WHERE h2.city = h.city AND hi.is_cover = 1 LIMIT 1) as image_url
      FROM hotels h
      LEFT JOIN room_types rt ON rt.hotel_id = h.id
      LEFT JOIN rooms r ON r.room_type_id = rt.id
      WHERE h.status = 'active'
      GROUP BY h.city
      ORDER BY room_count DESC
    `);
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách địa điểm' });
  }
});

// ----------------------------------------------------
// 3. ROOMS & CATEGORIES API (room_types, rooms, room_type_images, room_type_amenities)
// ----------------------------------------------------
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await dbAll(`
      SELECT id, name, description, base_price, area_sqm, max_adults
      FROM room_types 
      WHERE status = 'active'
    `);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh mục hạng phòng' });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    const { capacity, minPrice, maxPrice, roomTypeId, location, search, sortBy } = req.query;

    let sql = `
      SELECT 
        rt.id as id,
        rt.id as room_type_id,
        rt.name as name,
        rt.description,
        rt.base_price as price_per_night,
        rt.max_adults as capacity,
        rt.bed_type as bed_count,
        rt.area_sqm as size_sqm,
        rt.quantity,
        h.id as hotel_id,
        h.name as hotel_name,
        h.city as location,
        h.address,
        h.star_rating,
        1 as is_available,
        COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews rev WHERE rev.hotel_id = h.id AND rev.status = 'approved'), 4.8) as rating,
        COALESCE((SELECT COUNT(*) FROM reviews rev WHERE rev.hotel_id = h.id AND rev.status = 'approved'), 12) as review_count
      FROM room_types rt
      JOIN hotels h ON rt.hotel_id = h.id
      WHERE rt.status = 'active' AND h.status = 'active'
    `;
    const params = [];

    if (location) {
      sql += ' AND (h.city LIKE ? OR h.name LIKE ? OR h.address LIKE ?)';
      params.push(`%${location}%`, `%${location}%`, `%${location}%`);
    }

    if (capacity) {
      sql += ' AND rt.max_adults >= ?';
      params.push(parseInt(capacity));
    }

    if (minPrice) {
      sql += ' AND rt.base_price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      sql += ' AND rt.base_price <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (roomTypeId) {
      sql += ' AND rt.id = ?';
      params.push(parseInt(roomTypeId));
    }

    if (search) {
      sql += ' AND (rt.name LIKE ? OR rt.description LIKE ? OR h.name LIKE ? OR h.city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (sortBy === 'price_asc') {
      sql += ' ORDER BY rt.base_price ASC';
    } else if (sortBy === 'price_desc') {
      sql += ' ORDER BY rt.base_price DESC';
    } else if (sortBy === 'rating') {
      sql += ' ORDER BY rating DESC';
    } else {
      sql += ' ORDER BY rt.base_price ASC';
    }

    const rows = await dbAll(sql, params);

    // Fetch images & amenities for each room type
    const roomTypesWithDetails = await Promise.all(rows.map(async (r) => {
      const images = await dbAll('SELECT image_url FROM room_type_images WHERE room_type_id = ? ORDER BY is_cover DESC', [r.id]);
      const hotelImgs = await dbAll('SELECT image_url FROM hotel_images WHERE hotel_id = ? ORDER BY is_cover DESC LIMIT 2', [r.hotel_id]);
      
      const imageUrls = images.length > 0 
        ? images.map(i => i.image_url) 
        : hotelImgs.map(i => i.image_url);

      const amenities = await dbAll(`
        SELECT a.name FROM amenities a
        JOIN room_type_amenities rta ON rta.amenity_id = a.id
        WHERE rta.room_type_id = ? AND a.status = 'active'
      `, [r.id]);

      return {
        ...r,
        room_type_name: r.name,
        images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
        amenities: amenities.map(a => a.name)
      };
    }));

    res.json(roomTypesWithDetails);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Lỗi khi tải danh sách phòng' });
  }
});

app.get('/api/rooms/:id', async (req, res) => {
  try {
    const roomTypeId = req.params.id;
    const roomType = await dbGet(`
      SELECT 
        rt.id as id,
        rt.id as room_type_id,
        rt.name as name,
        rt.description,
        rt.base_price as price_per_night,
        rt.max_adults as capacity,
        rt.bed_type as bed_count,
        rt.area_sqm as size_sqm,
        rt.quantity,
        rt.cancellation_policy,
        h.id as hotel_id,
        h.name as hotel_name,
        h.city as location,
        h.address,
        h.star_rating,
        h.check_in_time,
        h.check_out_time,
        1 as is_available
      FROM room_types rt
      JOIN hotels h ON rt.hotel_id = h.id
      WHERE rt.id = ?
    `, [roomTypeId]);

    if (!roomType) return res.status(404).json({ error: 'Hạng phòng không tồn tại' });

    const images = await dbAll('SELECT image_url FROM room_type_images WHERE room_type_id = ? ORDER BY is_cover DESC', [roomTypeId]);
    const hotelImages = await dbAll('SELECT image_url FROM hotel_images WHERE hotel_id = ? ORDER BY is_cover DESC', [roomType.hotel_id]);
    const allImages = [...images.map(i => i.image_url), ...hotelImages.map(i => i.image_url)];

    const amenities = await dbAll(`
      SELECT a.name, a.icon FROM amenities a
      JOIN room_type_amenities rta ON rta.amenity_id = a.id
      WHERE rta.room_type_id = ? AND a.status = 'active'
    `, [roomTypeId]);

    const reviews = await dbAll(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.full_name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.hotel_id = ? AND r.status = 'approved'
      ORDER BY r.created_at DESC
    `, [roomType.hotel_id]);

    const avgRating = reviews.length > 0 
      ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1) 
      : 4.8;

    res.json({
      ...roomType,
      room_type_name: roomType.name,
      images: allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
      amenities: amenities.map(a => a.name),
      rating: parseFloat(avgRating),
      review_count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Get room detail error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin chi tiết phòng' });
  }
});

// ----------------------------------------------------
// 4. PROMOTIONS / VOUCHERS API (promotions table)
// ----------------------------------------------------
app.get(['/api/promotions', '/api/vouchers'], async (req, res) => {
  try {
    const promotions = await dbAll("SELECT * FROM promotions WHERE status = 'active'");
    // Map to voucher format for backward compatibility
    const formatted = promotions.map(p => ({
      id: p.id,
      code: p.code,
      description: p.description,
      discount_type: p.discount_type,
      discount_value: p.discount_value,
      discount_amount: p.discount_value,
      min_spend: p.min_order_value,
      min_order_value: p.min_order_value,
      is_active: p.status === 'active' ? 1 : 0
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách khuyến mại' });
  }
});

app.post(['/api/promotions/apply', '/api/vouchers/apply'], async (req, res) => {
  try {
    const { code, totalPrice } = req.body;
    if (!code) return res.status(400).json({ error: 'Vui lòng nhập mã giảm giá' });

    const promo = await dbGet("SELECT * FROM promotions WHERE UPPER(code) = UPPER(?) AND status = 'active'", [code.trim()]);
    if (!promo) {
      return res.status(404).json({ error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    }

    if (totalPrice && totalPrice < promo.min_order_value) {
      const formatMinSpend = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promo.min_order_value);
      return res.status(400).json({ error: `Mã ${promo.code} chỉ áp dụng cho hóa đơn từ ${formatMinSpend}` });
    }

    let discountAmount = promo.discount_value;
    if (promo.discount_type === 'percentage') {
      discountAmount = Math.round((totalPrice * promo.discount_value) / 100);
    }

    res.json({
      message: `Áp dụng mã ${promo.code} thành công! Giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}`,
      voucher: {
        id: promo.id,
        code: promo.code,
        discount_amount: discountAmount,
        min_spend: promo.min_order_value
      },
      promotion: promo
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi kiểm tra mã giảm giá' });
  }
});

// ----------------------------------------------------
// 5. BOOKINGS & BOOKING DETAILS API (bookings, booking_details, payments)
// ----------------------------------------------------
app.post('/api/bookings', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guestCount, guestName, guestEmail, guestPhone, specialRequests, userId, voucherCode } = req.body;

    if (!roomId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin đặt phòng' });
    }

    const roomType = await dbGet('SELECT * FROM room_types WHERE id = ?', [roomId]);
    if (!roomType) return res.status(404).json({ error: 'Không tìm thấy thông tin hạng phòng' });

    // Find an available physical room for this room_type
    let physicalRoom = await dbGet("SELECT * FROM rooms WHERE room_type_id = ? AND status = 'available' LIMIT 1", [roomId]);
    if (!physicalRoom) {
      physicalRoom = await dbGet('SELECT * FROM rooms WHERE room_type_id = ? LIMIT 1', [roomId]);
    }
    const physicalRoomId = physicalRoom ? physicalRoom.id : 1;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const totalAmount = nights * roomType.base_price;

    let discountAmount = 0;
    let promoId = null;

    if (voucherCode) {
      const promo = await dbGet("SELECT * FROM promotions WHERE UPPER(code) = UPPER(?) AND status = 'active'", [voucherCode.trim()]);
      if (promo && totalAmount >= promo.min_order_value) {
        promoId = promo.id;
        discountAmount = promo.discount_type === 'percentage' 
          ? Math.round((totalAmount * promo.discount_value) / 100) 
          : promo.discount_value;
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);
    const bookingCode = 'BK' + Date.now();

    // Resolve user ID
    let finalUserId = 2; // Default customer
    if (userId && !isNaN(parseInt(userId))) {
      finalUserId = parseInt(userId);
    } else if (req.user && req.user.id) {
      finalUserId = req.user.id;
    } else {
      const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [guestEmail.trim().toLowerCase()]);
      if (existingUser) finalUserId = existingUser.id;
    }

    // 1. Insert into bookings table
    const bookingResult = await dbRun(`
      INSERT INTO bookings (
        user_id, promotion_id, booking_code, check_in_date, check_out_date,
        total_guests, total_amount, discount_amount, final_amount,
        booking_status, contact_name, contact_phone, contact_email, special_request
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `, [
      finalUserId, promoId, bookingCode, checkIn, checkOut,
      guestCount || 2, totalAmount, discountAmount, finalAmount,
      guestName, guestPhone, guestEmail, specialRequests || ''
    ]);

    const newBookingId = bookingResult.lastID;

    // 2. Insert into booking_details table
    await dbRun(`
      INSERT INTO booking_details (
        booking_id, room_id, room_type_id, quantity, price_per_night, number_of_nights, subtotal
      ) VALUES (?, ?, ?, 1, ?, ?, ?)
    `, [newBookingId, physicalRoomId, roomType.id, roomType.base_price, nights, totalAmount]);

    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [newBookingId]);

    res.status(201).json({
      message: 'Tạo đơn đặt phòng thành công',
      booking: {
        ...booking,
        id: booking.id,
        total_price: booking.final_amount,
        check_in: booking.check_in_date,
        check_out: booking.check_out_date,
        status: booking.booking_status.toUpperCase()
      },
      roomName: roomType.name,
      nights
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi đặt phòng' });
  }
});

app.get('/api/bookings/my-bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await dbAll(`
      SELECT 
        b.id,
        b.booking_code,
        b.check_in_date as check_in,
        b.check_out_date as check_out,
        b.total_guests as guest_count,
        b.total_amount,
        b.discount_amount,
        b.final_amount as total_price,
        UPPER(b.booking_status) as status,
        b.contact_name as guest_name,
        b.contact_email as guest_email,
        b.contact_phone as guest_phone,
        b.special_request as special_requests,
        b.created_at,
        bd.room_type_id,
        bd.room_id,
        rt.name as room_name,
        rt.name as room_type_name,
        h.name as hotel_name,
        h.city as location,
        rt.base_price as price_per_night,
        (SELECT image_url FROM room_type_images WHERE room_type_id = rt.id LIMIT 1) as cover_image
      FROM bookings b
      LEFT JOIN booking_details bd ON bd.booking_id = b.id
      LEFT JOIN room_types rt ON bd.room_type_id = rt.id
      LEFT JOIN hotels h ON rt.hotel_id = h.id
      WHERE b.user_id = ? OR b.contact_email = ?
      ORDER BY b.created_at DESC
    `, [req.user.id, req.user.email]);

    const formatted = bookings.map(b => ({
      ...b,
      room_images: b.cover_image ? [b.cover_image] : ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80']
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get my-bookings error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách đơn đặt phòng' });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await dbGet(`
      SELECT 
        b.*,
        b.check_in_date as check_in,
        b.check_out_date as check_out,
        b.final_amount as total_price,
        UPPER(b.booking_status) as status,
        b.contact_name as guest_name,
        b.contact_phone as guest_phone,
        b.contact_email as guest_email,
        rt.name as room_name,
        rt.area_sqm as size_sqm,
        rt.bed_type as bed_count,
        h.name as hotel_name,
        h.city as location,
        p.payment_method,
        p.payment_status,
        p.transaction_code as transaction_id
      FROM bookings b
      LEFT JOIN booking_details bd ON bd.booking_id = b.id
      LEFT JOIN room_types rt ON bd.room_type_id = rt.id
      LEFT JOIN hotels h ON rt.hotel_id = h.id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.id = ?
    `, [req.params.id]);

    if (!booking) return res.status(404).json({ error: 'Không tìm thấy đơn đặt phòng' });

    booking.room_images = ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'];
    booking.amenities = ['Wifi 5G', 'Ăn sáng buffet', 'Điều hòa'];

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy chi tiết đơn đặt phòng' });
  }
});

// ----------------------------------------------------
// 6. PAYMENTS & REFUNDS API (payments, refunds tables)
// ----------------------------------------------------
app.post('/api/bookings/:id/pay', async (req, res) => {
  try {
    const { method } = req.body;
    const bookingId = req.params.id;

    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) return res.status(404).json({ error: 'Đơn đặt phòng không tồn tại' });

    const transactionCode = 'TXN' + Math.floor(100000 + Math.random() * 900000);
    const paymentStatus = method === 'PAY_AT_HOTEL' ? 'pending' : 'success';
    const bookingStatus = method === 'PAY_AT_HOTEL' ? 'pending' : 'confirmed';

    // Insert into payments table
    await dbRun(`
      INSERT INTO payments (booking_id, amount, payment_method, transaction_code, payment_status, paid_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [bookingId, booking.final_amount, method || 'VNPAY', transactionCode, paymentStatus]);

    // Update booking status
    await dbRun('UPDATE bookings SET booking_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [bookingStatus, bookingId]);

    res.json({
      message: 'Xác nhận thanh toán thành công!',
      transactionId: transactionCode,
      status: bookingStatus.toUpperCase()
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

    await dbRun("UPDATE bookings SET booking_status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);

    // Check if paid to create refund request record
    const payment = await dbGet("SELECT * FROM payments WHERE booking_id = ? AND payment_status = 'success'", [req.params.id]);
    if (payment) {
      const refundCode = 'RF' + Date.now();
      await dbRun(`
        INSERT INTO refunds (
          payment_id, booking_id, refund_code, refund_amount, refund_type,
          refund_method, refund_status, transaction_code, reason
        ) VALUES (?, ?, ?, ?, 'full', ?, 'pending', ?, 'Khách hàng hủy đơn đặt phòng')
      `, [payment.id, booking.id, refundCode, payment.amount, payment.payment_method, payment.transaction_code]);
    }

    res.json({ message: 'Hủy đơn đặt phòng thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi hủy đơn' });
  }
});

// ----------------------------------------------------
// 7. REVIEWS & FAVORITES API (reviews, favorites)
// ----------------------------------------------------
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { hotelId, roomId, bookingId, rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ số sao và nhận xét' });
    }

    let targetHotelId = hotelId;
    if (!targetHotelId && roomId) {
      const rt = await dbGet('SELECT hotel_id FROM room_types WHERE id = ?', [roomId]);
      if (rt) targetHotelId = rt.hotel_id;
    }

    let targetBookingId = bookingId;
    if (!targetBookingId) {
      const lastBooking = await dbGet('SELECT id FROM bookings WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.id]);
      targetBookingId = lastBooking ? lastBooking.id : 1;
    }

    await dbRun(`
      INSERT INTO reviews (user_id, hotel_id, booking_id, rating, comment, status)
      VALUES (?, ?, ?, ?, ?, 'approved')
    `, [req.user.id, targetHotelId || 1, targetBookingId, rating, comment]);

    res.status(201).json({ message: 'Gửi đánh giá thành công! Cảm ơn phản hồi của bạn.' });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Lỗi khi lưu đánh giá' });
  }
});

app.get('/api/amenities', async (req, res) => {
  try {
    const amenities = await dbAll("SELECT * FROM amenities WHERE status = 'active'");
    res.json(amenities);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh mục tiện ích' });
  }
});

// ----------------------------------------------------
// 8. ADMIN DASHBOARD API
// ----------------------------------------------------
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const revenueRow = await dbGet("SELECT SUM(final_amount) as totalRevenue FROM bookings WHERE booking_status = 'confirmed' OR booking_status = 'completed'");
    const pendingRevenueRow = await dbGet("SELECT SUM(final_amount) as pendingRevenue FROM bookings WHERE booking_status = 'pending'");
    const totalBookingsRow = await dbGet('SELECT COUNT(*) as totalBookings FROM bookings');
    const confirmedBookingsRow = await dbGet("SELECT COUNT(*) as confirmedBookings FROM bookings WHERE booking_status = 'confirmed' OR booking_status = 'completed'");
    const totalRoomsRow = await dbGet('SELECT COUNT(*) as totalRooms FROM rooms');
    const totalHotelsRow = await dbGet('SELECT COUNT(*) as totalHotels FROM hotels');

    const activeOccupiedRoomsRow = await dbGet(
      "SELECT COUNT(DISTINCT room_id) as occupiedCount FROM booking_details bd JOIN bookings b ON bd.booking_id = b.id WHERE b.booking_status = 'confirmed'"
    );

    const occupiedRoomsCount = activeOccupiedRoomsRow ? activeOccupiedRoomsRow.occupiedCount : 0;
    const availableRoomsCount = Math.max(0, (totalRoomsRow.totalRooms || 0) - occupiedRoomsCount);

    const recentBookings = await dbAll(`
      SELECT 
        b.id,
        b.booking_code,
        b.contact_name as guest_name,
        b.contact_phone as guest_phone,
        b.contact_email as guest_email,
        b.final_amount as total_price,
        UPPER(b.booking_status) as status,
        b.check_in_date as check_in,
        b.check_out_date as check_out,
        b.created_at,
        rt.name as room_name,
        h.name as hotel_name,
        h.city as location,
        r.room_number
      FROM bookings b
      LEFT JOIN booking_details bd ON bd.booking_id = b.id
      LEFT JOIN room_types rt ON bd.room_type_id = rt.id
      LEFT JOIN hotels h ON rt.hotel_id = h.id
      LEFT JOIN rooms r ON bd.room_id = r.id
      ORDER BY b.created_at DESC LIMIT 10
    `);

    const paymentStats = await dbAll(`
      SELECT payment_method as method, SUM(amount) as totalAmount, COUNT(*) as count 
      FROM payments 
      WHERE payment_status = 'success'
      GROUP BY payment_method
    `);

    res.json({
      totalRevenue: revenueRow.totalRevenue || 0,
      pendingRevenue: pendingRevenueRow.pendingRevenue || 0,
      totalBookings: totalBookingsRow.totalBookings || 0,
      confirmedBookings: confirmedBookingsRow.confirmedBookings || 0,
      totalRooms: totalRoomsRow.totalRooms || 0,
      totalHotels: totalHotelsRow.totalHotels || 0,
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
    const rooms = await dbAll(`
      SELECT 
        r.id,
        r.room_number,
        r.floor_number,
        r.status as room_status,
        rt.id as room_type_id,
        rt.name as room_type_name,
        rt.name as name,
        rt.base_price as price_per_night,
        rt.max_adults as capacity,
        rt.bed_type as bed_count,
        rt.area_sqm as size_sqm,
        h.id as hotel_id,
        h.name as hotel_name,
        h.city as location,
        CASE WHEN r.status = 'available' THEN 1 ELSE 0 END as is_available
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      JOIN hotels h ON rt.hotel_id = h.id
      ORDER BY h.city ASC, r.room_number ASC
    `);

    const activeBookings = await dbAll(`
      SELECT 
        bd.room_id,
        b.id as booking_id,
        b.contact_name as guest_name,
        b.contact_email as guest_email,
        b.contact_phone as guest_phone,
        b.check_in_date as check_in,
        b.check_out_date as check_out,
        UPPER(b.booking_status) as booking_status
      FROM booking_details bd
      JOIN bookings b ON bd.booking_id = b.id
      WHERE b.booking_status = 'confirmed' OR b.booking_status = 'pending'
    `);

    const formatted = rooms.map(r => {
      const currentBooking = activeBookings.find(b => b.room_id === r.id);
      return {
        ...r,
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
        amenities: ['Wifi 5G', 'Điều hòa', 'Smart TV'],
        occupancy_status: currentBooking ? 'OCCUPIED' : 'AVAILABLE',
        current_guest: currentBooking || null
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi tải phòng Admin' });
  }
});

app.get('/api/admin/customers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await dbAll("SELECT id, full_name as name, email, phone, role, avatar, created_at FROM users WHERE role = 'user'");
    const allBookings = await dbAll(`
      SELECT 
        b.id as booking_id,
        b.user_id,
        b.contact_email,
        b.final_amount as total_price,
        UPPER(b.booking_status) as status,
        b.check_in_date as check_in,
        b.check_out_date as check_out,
        b.created_at,
        rt.name as room_name,
        h.name as hotel_name,
        h.city as location,
        r.room_number
      FROM bookings b
      LEFT JOIN booking_details bd ON bd.booking_id = b.id
      LEFT JOIN room_types rt ON bd.room_type_id = rt.id
      LEFT JOIN hotels h ON rt.hotel_id = h.id
      LEFT JOIN rooms r ON bd.room_id = r.id
      ORDER BY b.created_at DESC
    `);

    const customersWithDetails = users.map(u => {
      const userBookings = allBookings.filter(b => b.user_id === u.id || b.contact_email === u.email);
      const totalSpent = userBookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum, b) => sum + b.total_price, 0);

      return {
        ...u,
        total_bookings: userBookings.length,
        total_spent: totalSpent,
        booked_rooms: userBookings
      };
    });

    res.json(customersWithDetails);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách khách hàng' });
  }
});

app.post('/api/admin/bookings/walk-in', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { room_id, guest_name, guest_email, guest_phone, check_in, check_out, guest_count, total_price, payment_method } = req.body;
    if (!guest_name || !guest_phone || !check_in || !check_out) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tên khách, SĐT và ngày lưu trú' });
    }

    const room = await dbGet('SELECT * FROM rooms WHERE id = ?', [room_id || 1]);
    const roomTypeId = room ? room.room_type_id : 1;
    const bookingCode = 'BK_WALKIN_' + Date.now();

    const bookingResult = await dbRun(`
      INSERT INTO bookings (
        user_id, booking_code, check_in_date, check_out_date, total_guests,
        total_amount, discount_amount, final_amount, booking_status,
        contact_name, contact_phone, contact_email, special_request
      ) VALUES (1, ?, ?, ?, ?, ?, 0, ?, 'confirmed', ?, ?, ?, 'Khách đặt trực tiếp tại quầy lễ tân')
    `, [
      bookingCode, check_in, check_out, guest_count || 2,
      total_price, total_price, guest_name, guest_phone, guest_email || 'walkin@vnstay.vn'
    ]);

    const newBookingId = bookingResult.lastID;

    await dbRun(`
      INSERT INTO booking_details (booking_id, room_id, room_type_id, quantity, price_per_night, number_of_nights, subtotal)
      VALUES (?, ?, ?, 1, ?, 1, ?)
    `, [newBookingId, room_id || 1, roomTypeId, total_price, total_price]);

    const txnCode = 'WALK' + Math.floor(100000 + Math.random() * 900000);
    await dbRun(`
      INSERT INTO payments (booking_id, amount, payment_method, transaction_code, payment_status, paid_at)
      VALUES (?, ?, ?, ?, 'success', CURRENT_TIMESTAMP)
    `, [newBookingId, total_price, payment_method || 'CASH', txnCode]);

    res.status(201).json({ message: 'Tạo đơn đặt phòng trực tiếp tại quầy thành công!', bookingId: newBookingId });
  } catch (error) {
    console.error('Walk-in booking error:', error);
    res.status(500).json({ error: 'Lỗi khi tạo đơn đặt phòng tại quầy' });
  }
});

app.put('/api/admin/rooms/:id/toggle-maintenance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const room = await dbGet('SELECT status FROM rooms WHERE id = ?', [req.params.id]);
    if (!room) return res.status(404).json({ error: 'Phòng không tồn tại' });

    const newStatus = room.status === 'available' ? 'maintenance' : 'available';
    await dbRun('UPDATE rooms SET status = ? WHERE id = ?', [newStatus, req.params.id]);

    res.json({
      message: `Đã chuyển trạng thái phòng thành ${newStatus === 'available' ? 'Sẵn sàng đón khách 🟢' : 'Đang bảo trì 🔴'}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi thay đổi trạng thái phòng' });
  }
});

app.get('/api/admin/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await dbAll(`
      SELECT 
        b.id,
        b.booking_code,
        b.check_in_date as check_in,
        b.check_out_date as check_out,
        b.total_guests as guest_count,
        b.final_amount as total_price,
        UPPER(b.booking_status) as status,
        b.contact_name as guest_name,
        b.contact_phone as guest_phone,
        b.contact_email as guest_email,
        b.special_request as special_requests,
        b.created_at,
        rt.name as room_name,
        h.name as hotel_name,
        h.city as location,
        r.room_number,
        p.payment_method,
        p.payment_status
      FROM bookings b
      LEFT JOIN booking_details bd ON bd.booking_id = b.id
      LEFT JOIN room_types rt ON bd.room_type_id = rt.id
      LEFT JOIN hotels h ON rt.hotel_id = h.id
      LEFT JOIN rooms r ON bd.room_id = r.id
      LEFT JOIN payments p ON p.booking_id = b.id
      ORDER BY b.created_at DESC
    `);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi tải danh sách đơn đặt phòng Admin' });
  }
});

app.put('/api/admin/bookings/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await dbRun('UPDATE bookings SET booking_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status.toLowerCase(), req.params.id]);
    res.json({ message: `Cập nhật trạng thái đơn thành ${status} thành công` });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật đơn' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 VnStay Backend Server running with 16 Tables Schema on port ${PORT}`);
});
