const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'hotel.db');
const db = new sqlite3.Database(dbPath);

// Enable WAL Mode and Foreign Keys for High Performance & Integrity
db.run('PRAGMA journal_mode = WAL;');
db.run('PRAGMA foreign_keys = ON;');

// Promisified helper methods
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

async function initDB() {
  db.serialize(async () => {
    // 1. Bảng Users (Tài khoản)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'CUSTOMER',
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Bảng Locations (Tỉnh thành / Địa điểm du lịch)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        city_name TEXT NOT NULL,
        region TEXT NOT NULL DEFAULT 'Miền Trung',
        image_url TEXT
      )
    `);

    // 3. Bảng Hotels (Khách sạn & Resort)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS hotels (
        id TEXT PRIMARY KEY,
        location_id TEXT NOT NULL,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        star_rating INTEGER DEFAULT 5,
        description TEXT,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
      )
    `);

    // 4. Bảng Room Types (Hạng phòng)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS room_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      )
    `);

    // 5. Bảng Rooms (Phòng nghỉ vật lý)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        room_number TEXT UNIQUE NOT NULL,
        hotel_id TEXT,
        room_type_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price_per_night REAL NOT NULL,
        capacity INTEGER NOT NULL,
        bed_count INTEGER NOT NULL,
        size_sqm INTEGER NOT NULL,
        location TEXT NOT NULL DEFAULT 'Phú Quốc',
        hotel_name TEXT NOT NULL DEFAULT 'Grand Horizon Resort',
        images TEXT NOT NULL, -- JSON array of image URLs
        amenities TEXT NOT NULL, -- JSON array of strings
        is_available BOOLEAN DEFAULT 1,
        rating REAL DEFAULT 4.8,
        review_count INTEGER DEFAULT 12,
        FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
      )
    `);

    // 6. Bảng Amenities (Danh mục tiện nghi)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS amenities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon_code TEXT
      )
    `);

    // 7. Bảng Room_Amenities (Bảng trung gian N-N phòng & tiện nghi)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS room_amenities (
        room_id TEXT NOT NULL,
        amenity_id TEXT NOT NULL,
        PRIMARY KEY (room_id, amenity_id),
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
      )
    `);

    // 8. Bảng Vouchers (Mã giảm giá Promo)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS vouchers (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount_amount REAL NOT NULL,
        min_spend REAL DEFAULT 0,
        is_active BOOLEAN DEFAULT 1
      )
    `);

    // 9. Bảng Bookings (Đơn đặt phòng)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        room_id TEXT NOT NULL,
        voucher_id TEXT,
        check_in TEXT NOT NULL,
        check_out TEXT NOT NULL,
        guest_count INTEGER NOT NULL,
        total_price REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        guest_name TEXT NOT NULL,
        guest_email TEXT NOT NULL,
        guest_phone TEXT NOT NULL,
        special_requests TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE SET NULL
      )
    `);

    // 10. Bảng Payments (Nhật ký giao dịch thanh toán tài chính)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        booking_id TEXT NOT NULL,
        method TEXT NOT NULL,
        transaction_id TEXT,
        amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        paid_at DATETIME,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `);

    // 11. Bảng Reviews (Đánh giá & Phản hồi)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        room_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      )
    `);

    // Create Indexes for High Performance Querying
    await dbRun('CREATE INDEX IF NOT EXISTS idx_rooms_location ON rooms(location)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(is_available)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_reviews_room ON reviews(room_id)');

    // Seed Data if empty or missing nationwide hotels
    await seedInitialData();
  });
}

async function seedInitialData() {
  // 1. Seed Locations
  const locCount = await dbGet('SELECT COUNT(*) as count FROM locations');
  if (locCount.count === 0) {
    const locs = [
      ['loc_phuquoc', 'Phú Quốc', 'Miền Nam', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80'],
      ['loc_danang', 'Đà Nẵng', 'Miền Trung', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'],
      ['loc_dalat', 'Đà Lạt', 'Tây Nguyên', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'],
      ['loc_hcm', 'TP. Hồ Chí Minh', 'Miền Nam', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
      ['loc_hanoi', 'Hà Nội', 'Miền Bắc', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
      ['loc_nhatrang', 'Nha Trang', 'Miền Trung', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
      ['loc_sapa', 'Sapa', 'Miền Bắc', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'],
      ['loc_vungtau', 'Vũng Tàu', 'Miền Nam', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80']
    ];
    for (const l of locs) {
      await dbRun('INSERT INTO locations (id, city_name, region, image_url) VALUES (?, ?, ?, ?)', l);
    }
  }

  // 2. Seed Vouchers
  const vchCount = await dbGet('SELECT COUNT(*) as count FROM vouchers');
  if (vchCount.count === 0) {
    const vouchers = [
      ['vch_1', 'VNSTAY2026', 200000, 1500000, 1],
      ['vch_2', 'SUMMERFUN', 350000, 2000000, 1],
      ['vch_3', 'FIRSTSTAY', 100000, 500000, 1]
    ];
    for (const v of vouchers) {
      await dbRun('INSERT INTO vouchers (id, code, discount_amount, min_spend, is_active) VALUES (?, ?, ?, ?, ?)', v);
    }
  }

  // 3. Seed Users
  const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('🌱 Seeding initial user data...');

    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userPasswordHash = await bcrypt.hash('user123', 10);

    const sampleUsers = [
      ['usr_admin', 'Quản Trị Viên (Admin)', 'admin@grandhorizon.com', adminPasswordHash, 'ADMIN', '0901234567'],
      ['usr_cust_01', 'Nguyễn Văn An', 'khachhang@gmail.com', userPasswordHash, 'CUSTOMER', '0987654321'],
      ['usr_cust_02', 'Trần Thị Bình', 'tran.thi.b@gmail.com', userPasswordHash, 'CUSTOMER', '0912345678'],
      ['usr_cust_03', 'Lê Văn Cường', 'le.van.c@gmail.com', userPasswordHash, 'CUSTOMER', '0934567890'],
      ['usr_cust_04', 'Phạm Thị Dung', 'pham.thi.d@gmail.com', userPasswordHash, 'CUSTOMER', '0978901234']
    ];

    for (const u of sampleUsers) {
      await dbRun('INSERT INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)', u);
    }
  }

  // 4. Seed Room Types
  const rtCount = await dbGet('SELECT COUNT(*) as count FROM room_types');
  if (rtCount.count === 0) {
    const roomTypes = [
      { id: 'rt_standard', name: 'Standard Room', description: 'Phòng tiêu chuẩn ấm cúng, đầy đủ tiện nghi cơ bản cho chuyến đi ngắn ngày.' },
      { id: 'rt_deluxe', name: 'Deluxe Ocean View', description: 'Phòng Deluxe sang trọng với ban công hướng biển tuyệt đẹp và thiết kế hiện đại.' },
      { id: 'rt_suite', name: 'Executive Suite', description: 'Hạng phòng Tổng thống đẳng cấp với phòng khách riêng, bồn tắm jacuzzi và dịch vụ 24/7.' },
      { id: 'rt_villa', name: 'Beachfront Pool Villa', description: 'Biệt thự cao cấp 2-3 phòng ngủ nằm sát biển với bể bơi vô cực riêng biệt.' }
    ];

    for (const rt of roomTypes) {
      await dbRun('INSERT INTO room_types (id, name, description) VALUES (?, ?, ?)', [rt.id, rt.name, rt.description]);
    }
  }

  // 5. Seed Nationwide Vietnam Hotels & Rooms
  const roomCount = await dbGet('SELECT COUNT(*) as count FROM rooms');
  if (roomCount.count < 8) {
    console.log('🌱 Seeding Nationwide Vietnam Hotels & Rooms...');

    const nationwideRooms = [
      // PHÚ QUỐC
      {
        id: 'rm_101',
        room_number: '101',
        room_type_id: 'rt_deluxe',
        name: 'Deluxe Ocean Sunset Suite - Grand Horizon Resort',
        hotel_name: 'Grand Horizon Beach Resort Phú Quốc',
        location: 'Phú Quốc',
        description: 'Tận hưởng bình minh và hoàng hôn tuyệt đẹp trên bãi biển Bãi Dài Phú Quốc ngay tại ban công riêng. Trang bị giường King-size cao cấp êm ái và bồn tắm kính phong cách resort 5 sao.',
        price_per_night: 2200000,
        capacity: 2,
        bed_count: 1,
        size_sqm: 45,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
        ]),
        amenities: JSON.stringify(['Wifi Tốc độ cao', 'Ban công Hướng biển Phú Quốc', 'Bồn tắm nằm', 'Điều hòa 2 chiều', 'TV 4K 55 inch', 'Ăn sáng miễn phí', 'Minibar miễn phí']),
        is_available: 1,
        rating: 4.9,
        review_count: 28
      },
      {
        id: 'rm_102',
        room_number: '102',
        room_type_id: 'rt_villa',
        name: 'Beachfront Infinity Pool Villa (2 Phòng Ngủ)',
        hotel_name: 'Phú Quốc Coral Bay Villa & Resort',
        location: 'Phú Quốc',
        description: 'Biệt thự nguyên căn sát biển với hồ bơi vô cực riêng ngắm hoàng hôn Phú Quốc. Thiết kế không gian mở hòa quyện cùng thiên nhiên bãi biển hoang sơ.',
        price_per_night: 7500000,
        capacity: 6,
        bed_count: 3,
        size_sqm: 160,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
        ]),
        amenities: JSON.stringify(['Hồ bơi vô cực riêng', 'Bãi biển riêng tư', 'Bếp nấu đầy đủ dụng cụ', 'Xe điện nội khu miễn phí', 'Ăn sáng buffet tại Villa']),
        is_available: 1,
        rating: 5.0,
        review_count: 42
      },

      // ĐÀ NẴNG
      {
        id: 'rm_201',
        room_number: '201',
        room_type_id: 'rt_deluxe',
        name: 'Deluxe Oceanfront My Khe Beach - Ocean Pearl Hotel',
        hotel_name: 'Ocean Pearl Beach Hotel Đà Nẵng',
        location: 'Đà Nẵng',
        description: 'Nằm ngay sát bãi biển Mỹ Khê Đà Nẵng quyến rũ nhất hành tinh. Cửa kính panorama kịch trần ngắm trọn toàn cảnh biển và bán đảo Sơn Trà.',
        price_per_night: 1850000,
        capacity: 2,
        bed_count: 1,
        size_sqm: 42,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
        ]),
        amenities: JSON.stringify(['Wifi miễn phí', 'Ban công view bãi biển Mỹ Khê', 'Bồn tắm ngầm', 'Đưa đón sân bay Đà Nẵng', 'Nhà hàng buffet']),
        is_available: 1,
        rating: 4.8,
        review_count: 36
      },
      {
        id: 'rm_202',
        room_number: '202',
        room_type_id: 'rt_suite',
        name: 'Presidential Dragon Bridge Suite - Danang Luxury Hotel',
        hotel_name: 'Danang Riverside Luxury Hotel',
        location: 'Đà Nẵng',
        description: 'Hạng phòng Suite cao cấp view sông Hàn ngắm Cầu Rồng phun lửa ngoạn mục. Phòng khách sang trọng, trang thiết bị mạ vàng hiện đại.',
        price_per_night: 3900000,
        capacity: 4,
        bed_count: 2,
        size_sqm: 78,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
        ]),
        amenities: JSON.stringify(['Wifi Tốc độ cao', 'View Cầu Rồng Sông Hàn', 'Bồn Jacuzzi riêng', 'Máy pha Cafe Nespresso', 'Phục vụ phòng 24/7']),
        is_available: 1,
        rating: 4.9,
        review_count: 51
      },

      // ĐÀ LẠT
      {
        id: 'rm_301',
        room_number: '301',
        room_type_id: 'rt_deluxe',
        name: 'Pine Hill Sunset Balcony Room - Pine Valley Resort',
        hotel_name: 'Pine Valley Boutique Resort Đà Lạt',
        location: 'Đà Lạt',
        description: 'Thưởng thức tách trà ấm giữa không gian se lạnh miền đồi thông Đà Lạt. Phòng được thiết kế gỗ ấm áp phong cách Scandinavian sành điệu.',
        price_per_night: 1650000,
        capacity: 2,
        bed_count: 1,
        size_sqm: 40,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
        ]),
        amenities: JSON.stringify(['Wifi miễn phí', 'Ban công view rừng thông sương mờ', 'Lò sưởi ấm áp', 'Trà & Cafe Atiso', 'Ăn sáng đặc sản Đà Lạt']),
        is_available: 1,
        rating: 4.9,
        review_count: 44
      },

      // TP. HỒ CHÍ MINH
      {
        id: 'rm_401',
        room_number: '401',
        room_type_id: 'rt_suite',
        name: 'Saigon Skyline Executive Suite - Landmark Hotel',
        hotel_name: 'Saigon Royal Tower Hotel TP.HCM',
        location: 'TP. Hồ Chí Minh',
        description: 'Tọa lạc ngay trung tâm Quận 1 năng động. Phòng Suite kịch trần ngắm trọn vẻ đẹp lung linh của thành phố về đêm và tòa nhà Landmark 81.',
        price_per_night: 3200000,
        capacity: 3,
        bed_count: 2,
        size_sqm: 65,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80'
        ]),
        amenities: JSON.stringify(['Wifi Tốc độ cao', 'Trung tâm Quận 1 TP.HCM', 'Bể bơi vô cực tầng thượng', 'Phòng Gym 24/7', 'Đưa đón xe riêng Sân bay Tân Sơn Nhất']),
        is_available: 1,
        rating: 4.8,
        review_count: 67
      },

      // HÀ NỘI
      {
        id: 'rm_501',
        room_number: '501',
        room_type_id: 'rt_deluxe',
        name: 'Old Quarter Heritage Suite - Hanoi Opera Hotel',
        hotel_name: 'Hanoi Heritage Grand Hotel',
        location: 'Hà Nội',
        description: 'Nằm ngay trung tâm Phố Cổ Hà Nội bước chân ra Hồ Hoàn Kiếm. Thiết kế mang phong cách Đông Dương (Indochine) tinh tế và hoài cổ.',
        price_per_night: 2100000,
        capacity: 2,
        bed_count: 1,
        size_sqm: 48,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
        ]),
        amenities: JSON.stringify(['Wifi miễn phí', 'Cách Hồ Gươm 3 phút đi bộ', 'Ăn sáng Phở Hà Nội chuẩn vị', 'Phòng xông hơi khô', 'Dịch vụ tour Phố Cổ']),
        is_available: 1,
        rating: 4.9,
        review_count: 58
      },

      // NHA TRANG
      {
        id: 'rm_601',
        room_number: '601',
        room_type_id: 'rt_villa',
        name: 'Nha Trang Bay Luxury Ocean Villa',
        hotel_name: 'Nha Trang Pearl Bay Villa & Spa',
        location: 'Nha Trang',
        description: 'Biệt thự sát biển vịnh Nha Trang với lối đi riêng ra bãi cát vàng. Tích hợp bồn tắm ngoài trời ngắm bình minh và hồ bơi vô cực 50m².',
        price_per_night: 5800000,
        capacity: 5,
        bed_count: 3,
        size_sqm: 140,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
        ]),
        amenities: JSON.stringify(['Hồ bơi riêng ngoài trời', 'View Vịnh Nha Trang', 'Bếp nướng BBQ sân vườn', 'Dịch vụ Spa tại biệt thự', 'Cano lướt sóng']),
        is_available: 1,
        rating: 4.9,
        review_count: 29
      },

      // SAPA
      {
        id: 'rm_701',
        room_number: '701',
        room_type_id: 'rt_deluxe',
        name: 'Muong Hoa Valley Cloud View Room',
        hotel_name: 'Sapa Horizon Mountain Resort',
        location: 'Sapa',
        description: 'Phòng nghỉ độc đáo nằm trên đỉnh đồi ngắm trọn biển mây bồng bềnh và thung lũng Mường Hoa. Trải nghiệm tắm lá thuốc người Dao Đỏ thư giãn.',
        price_per_night: 1750000,
        capacity: 2,
        bed_count: 1,
        size_sqm: 42,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
        ]),
        amenities: JSON.stringify(['Wifi miễn phí', 'Ban công ngắm biển mây Sapa', 'Bồn tắm lá thuốc người Dao', 'Sưởi sàn ấm áp', 'Hướng dẫn viên trekking']),
        is_available: 1,
        rating: 4.8,
        review_count: 38
      },

      // VŨNG TÀU
      {
        id: 'rm_801',
        room_number: '801',
        room_type_id: 'rt_suite',
        name: 'Vũng Tàu Back Beach Ocean Penthouse',
        hotel_name: 'Vũng Tàu Imperial Seaview Hotel',
        location: 'Vũng Tàu',
        description: 'Căn Penthouse tầng cao bãi Sau Vũng Tàu với view 360 độ ngắm biển cả mênh mông và ngọn Hải Đăng. Lựa chọn lý tưởng cho kỳ nghỉ cuối tuần.',
        price_per_night: 2900000,
        capacity: 4,
        bed_count: 2,
        size_sqm: 80,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
        ]),
        amenities: JSON.stringify(['Wifi Tốc độ cao', 'Ban công rộng view Bãi Sau Vũng Tàu', 'Hồ bơi tràn bờ', 'Dịch vụ hải sản tươi', 'Chỉ 2 tiếng từ TP.HCM']),
        is_available: 1,
        rating: 4.7,
        review_count: 45
      }
    ];

    for (const r of nationwideRooms) {
      await dbRun(
        `INSERT OR REPLACE INTO rooms (id, room_number, room_type_id, name, hotel_name, location, description, price_per_night, capacity, bed_count, size_sqm, images, amenities, is_available, rating, review_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [r.id, r.room_number, r.room_type_id, r.name, r.hotel_name, r.location, r.description, r.price_per_night, r.capacity, r.bed_count, r.size_sqm, r.images, r.amenities, r.rating, r.review_count]
      );
    }

    // Seed authentic verified customer reviews
    const revCount = await dbGet('SELECT COUNT(*) as count FROM reviews');
    if (revCount.count === 0) {
      const seedReviews = [
        { id: 'rev_1', room_id: 'rm_101', user_name: 'Nguyễn Thị Hoàng Anh (Hà Nội)', rating: 5, comment: 'Phòng cực kỳ sạch sẽ, view ngắm hoàng hôn Phú Quốc đẹp vượt kỳ vọng. Lễ tân phục vụ tận tình, buffet sáng hải sản tươi ngon!' },
        { id: 'rev_2', room_id: 'rm_201', user_name: 'Trần Quốc Huy (TP.HCM)', rating: 5, comment: 'Vị trí đắc địa ngay sát bãi biển Mỹ Khê Đà Nẵng, đi bộ 2 phút là ra tới bãi tắm. Cửa kính lớn nhìn bao quát toàn vịnh biển.' },
        { id: 'rev_3', room_id: 'rm_301', user_name: 'Lê Phương Thảo (Hải Phòng)', rating: 5, comment: 'Đà Lạt mùa này thời tiết tuyệt vời. Resort rợp bóng thông và hoa tươi rất thơ mộng. Dịch vụ trà gừng nóng đón khách rất tinh tế.' },
        { id: 'rev_4', room_id: 'rm_401', user_name: 'Đặng Minh Tuấn (Đà Nẵng)', rating: 4, comment: 'Căn hộ giữa trung tâm Quận 1 TP.HCM rất tiện di chuyển làm việc. Hồ bơi tầng thượng nhìn trọn cảnh Landmark 81 cực đẹp.' },
        { id: 'rev_5', room_id: 'rm_501', user_name: 'Phạm Thu Trang (Quảng Ninh)', rating: 5, comment: 'Khách sạn Phố Cổ Hà Nội mang phong cách Indochine hoài cổ tinh tế. Buổi sáng ăn Phở bò chuẩn vị ngay tại nhà hàng rất thích!' }
      ];
      for (const rev of seedReviews) {
        await dbRun('INSERT INTO reviews (id, room_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)', [rev.id, rev.room_id, rev.user_name, rev.rating, rev.comment]);
      }
    }

    console.log('✅ Initial seed data for All-Vietnam travel destinations completed successfully!');
  }
}

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet,
  initDB
};
