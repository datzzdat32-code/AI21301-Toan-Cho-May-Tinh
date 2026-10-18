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
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // =====================================================
        // 1. NGUOI DUNG (users)
        // =====================================================
        await dbRun(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            avatar VARCHAR(255),
            role VARCHAR(20) NOT NULL DEFAULT 'user',
            status VARCHAR(20) NOT NULL DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // =====================================================
        // 2. KHACH SAN (hotels, hotel_images, favorites)
        // =====================================================
        await dbRun(`
          CREATE TABLE IF NOT EXISTS hotels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(200) NOT NULL,
            address VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            email VARCHAR(150),
            star_rating INTEGER DEFAULT 5,
            description TEXT,
            check_in_time VARCHAR(10) DEFAULT '14:00',
            check_out_time VARCHAR(10) DEFAULT '12:00',
            status VARCHAR(20) NOT NULL DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await dbRun(`
          CREATE TABLE IF NOT EXISTS hotel_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hotel_id INTEGER NOT NULL,
            image_url VARCHAR(500) NOT NULL,
            is_cover BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
          )
        `);

        await dbRun(`
          CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            hotel_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, hotel_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
          )
        `);

        // =====================================================
        // 3. LOAI PHONG (room_types, rooms, room_type_images)
        // =====================================================
        await dbRun(`
          CREATE TABLE IF NOT EXISTS room_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hotel_id INTEGER NOT NULL,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            area_sqm DECIMAL(8,2),
            max_adults INTEGER NOT NULL DEFAULT 2,
            max_children INTEGER DEFAULT 0,
            bed_type VARCHAR(100),
            base_price DECIMAL(12,2) NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            cancellation_policy TEXT,
            status VARCHAR(20) NOT NULL DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
          )
        `);

        await dbRun(`
          CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_type_id INTEGER NOT NULL,
            room_number VARCHAR(30) NOT NULL,
            floor_number INTEGER,
            status VARCHAR(20) NOT NULL DEFAULT 'available',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(room_type_id, room_number),
            FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
          )
        `);

        await dbRun(`
          CREATE TABLE IF NOT EXISTS room_type_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_type_id INTEGER NOT NULL,
            image_url VARCHAR(500) NOT NULL,
            is_cover BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
          )
        `);

        // =====================================================
        // 4. TIEN ICH (amenities, hotel_amenities, room_type_amenities)
        // =====================================================
        await dbRun(`
          CREATE TABLE IF NOT EXISTS amenities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            icon VARCHAR(255),
            status VARCHAR(20) NOT NULL DEFAULT 'active'
          )
        `);

        await dbRun(`
          CREATE TABLE IF NOT EXISTS hotel_amenities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hotel_id INTEGER NOT NULL,
            amenity_id INTEGER NOT NULL,
            UNIQUE(hotel_id, amenity_id),
            FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
            FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
          )
        `);

        await dbRun(`
          CREATE TABLE IF NOT EXISTS room_type_amenities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_type_id INTEGER NOT NULL,
            amenity_id INTEGER NOT NULL,
            UNIQUE(room_type_id, amenity_id),
            FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
            FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
          )
        `);

        // =====================================================
        // 5. DAT PHONG (promotions, bookings, booking_details)
        // =====================================================
        await dbRun(`
          CREATE TABLE IF NOT EXISTS promotions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code VARCHAR(50) NOT NULL UNIQUE,
            description TEXT,
            discount_type VARCHAR(20) NOT NULL, -- 'fixed' or 'percentage'
            discount_value DECIMAL(12,2) NOT NULL,
            min_order_value DECIMAL(12,2) DEFAULT 0,
            start_date DATETIME,
            end_date DATETIME,
            usage_limit INTEGER,
            status VARCHAR(20) NOT NULL DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await dbRun(`
          CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            promotion_id INTEGER,
            booking_code VARCHAR(50) NOT NULL UNIQUE,
            check_in_date DATE NOT NULL,
            check_out_date DATE NOT NULL,
            total_guests INTEGER NOT NULL DEFAULT 1,
            total_amount DECIMAL(12,2) NOT NULL,
            discount_amount DECIMAL(12,2) DEFAULT 0,
            final_amount DECIMAL(12,2) NOT NULL,
            booking_status VARCHAR(30) NOT NULL DEFAULT 'pending',
            contact_name VARCHAR(100),
            contact_phone VARCHAR(20),
            contact_email VARCHAR(150),
            special_request TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL
          )
        `);

        await dbRun(`
          CREATE TABLE IF NOT EXISTS booking_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            room_id INTEGER NOT NULL,
            room_type_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            price_per_night DECIMAL(12,2) NOT NULL,
            number_of_nights INTEGER NOT NULL,
            subtotal DECIMAL(12,2) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
            FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
          )
        `);

        // =====================================================
        // 6. THANH TOAN (payments)
        // =====================================================
        await dbRun(`
          CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            payment_method VARCHAR(50) NOT NULL,
            transaction_code VARCHAR(100),
            payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
            paid_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
          )
        `);

        // =====================================================
        // 7. HOAN TIEN (refunds)
        // =====================================================
        await dbRun(`
          CREATE TABLE IF NOT EXISTS refunds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payment_id INTEGER NOT NULL,
            booking_id INTEGER NOT NULL,
            refund_code VARCHAR(50) NOT NULL UNIQUE,
            refund_amount DECIMAL(12,2) NOT NULL,
            refund_type VARCHAR(20) NOT NULL,
            refund_method VARCHAR(50),
            refund_status VARCHAR(30) NOT NULL DEFAULT 'pending',
            transaction_code VARCHAR(100),
            reason VARCHAR(255),
            requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            processed_at DATETIME,
            note TEXT,
            FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
          )
        `);

        // =====================================================
        // 8. DANH GIA (reviews)
        // =====================================================
        await dbRun(`
          CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            hotel_id INTEGER NOT NULL,
            booking_id INTEGER NOT NULL UNIQUE,
            rating INTEGER NOT NULL,
            comment TEXT,
            status VARCHAR(20) NOT NULL DEFAULT 'approved',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
          )
        `);

        // Indexes for High Performance
        await dbRun('CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city)');
        await dbRun('CREATE INDEX IF NOT EXISTS idx_room_types_hotel ON room_types(hotel_id)');
        await dbRun('CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON rooms(room_type_id)');
        await dbRun('CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id)');
        await dbRun('CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code)');
        await dbRun('CREATE INDEX IF NOT EXISTS idx_booking_details_booking ON booking_details(booking_id)');
        await dbRun('CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id)');
        await dbRun('CREATE INDEX IF NOT EXISTS idx_reviews_hotel ON reviews(hotel_id)');
        await dbRun('CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code)');

        // Seed data
        await seedInitialData();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function seedInitialData() {
  const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
  if (userCount.count > 0) {
    return; // Already seeded
  }

  console.log('🌱 Đang nạp dữ liệu mẫu khởi tạo cho 16 bảng CSDL chuẩn DBML...');

  // 1. Seed Users
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  await dbRun(`
    INSERT INTO users (id, full_name, email, password, phone, avatar, role, status) VALUES
    (1, 'Quản Trị Viên Hệ Thống', 'admin@grandhorizon.com', ?, '0901234567', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'admin', 'active'),
    (2, 'Nguyễn Văn An', 'khachhang@gmail.com', ?, '0987654321', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'user', 'active'),
    (3, 'Trần Thị Bình', 'tran.thi.b@gmail.com', ?, '0912345678', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 'user', 'active')
  `, [adminHash, userHash, userHash]);

  // 2. Seed Amenities (Tiện ích)
  const amenitiesData = [
    [1, 'Wifi 5G Miễn Phí', 'Tốc độ cao toàn khuôn viên', 'Wifi', 'active'],
    [2, 'Hồ Bơi Vô Cực', 'Hồ bơi tràn viền view hoàng hôn biển', 'Waves', 'active'],
    [3, 'Bữa Sáng Buffet Quốc Tế', 'Phục vụ ẩm thực Á - Âu thượng hạng', 'Coffee', 'active'],
    [4, 'Điều Hòa Inverter', 'Làm mát êm dịu, lọc không khí', 'Wind', 'active'],
    [5, 'Smart TV 4K 65 inch', 'Tích hợp Netflix, Youtube Premium', 'Tv', 'active'],
    [6, 'Bồn Tắm Nằm Thảo Dược', 'Bồn tắm view kính ngắm thiên nhiên', 'Bath', 'active'],
    [7, 'Phòng Tập Gym & Spa', 'Máy tập hiện đại, xông hơi đá muối', 'Dumbbell', 'active'],
    [8, 'Bãi Đỗ Xe Ô Tô Riêng', 'Bảo vệ an ninh 24/7 có trạm sạc điện', 'Car', 'active']
  ];
  for (const a of amenitiesData) {
    await dbRun('INSERT INTO amenities (id, name, description, icon, status) VALUES (?, ?, ?, ?, ?)', a);
  }

  // 3. Seed Hotels
  const hotelsData = [
    [
      1,
      'Grand Horizon Luxury Resort & Spa',
      'Đường Trần Phú, Bãi Trường',
      'Phú Quốc',
      '02973888999',
      'info@grandhorizon.vn',
      5,
      'Resort đẳng cấp 5 sao quốc tế tọa lạc bên bờ biển ngọc Phú Quốc với bãi cát trắng mịn, hồ bơi vô cực và dịch vụ cá nhân hóa thượng lưu.',
      '14:00',
      '12:00',
      'active'
    ],
    [
      2,
      'Danang Pearl Riverside Hotel',
      'Đường Bạch Đằng, Quận Hải Châu',
      'Đà Nẵng',
      '02363777888',
      'booking@danangpearl.vn',
      5,
      'Khách sạn bên bờ sông Hàn thơ mộng ngắm toàn cảnh Cầu Rồng phun lửa, dịch vụ chuẩn quốc tế giữa trung tâm thành phố Đà Nẵng.',
      '14:00',
      '12:00',
      'active'
    ],
    [
      3,
      'Dalat Misty Pine Valley Hotel & Spa',
      'Đường Lê Hồng Phong, Phường 4',
      'Đà Lạt',
      '02633666999',
      'contact@dalatpine.vn',
      4,
      'Biệt thự phong cách Pháp cổ điển ẩn mình giữa rừng thông bạt ngàn xứ sương mù, không gian yên bình tuyệt đối.',
      '14:00',
      '12:00',
      'active'
    ],
    [
      4,
      'Saigon Skyview Central Hotel',
      'Đường Đồng Khởi, Quận 1',
      'TP. Hồ Chí Minh',
      '02838222333',
      'reservation@saigonskyview.vn',
      5,
      'Tọa lạc tại vị trí vàng trung tâm Sài Gòn, sở hữu Rooftop Bar sôi động ngắm trọn vẹn tòa tháp Landmark 81 và Bitexco.',
      '14:00',
      '12:00',
      'active'
    ],
    [
      5,
      'Hanoi Heritage Opera Boutique Hotel',
      'Đường Tràng Tiền, Quận Hoàn Kiếm',
      'Hà Nội',
      '02439333444',
      'stay@hanoiheritage.vn',
      5,
      'Khách sạn boutique quý phái cách Nhà Hát Lớn và Hồ Gươm chỉ vài bước chân, phong cách Indochine hòa quyện tinh hoa Hà Nội nghìn năm.',
      '14:00',
      '12:00',
      'active'
    ],
    [
      6,
      'Nha Trang Ocean Blue Premium Resort',
      'Đường Phạm Văn Đồng, Vĩnh Hòa',
      'Nha Trang',
      '02583555666',
      'ocean@nhatrangblue.vn',
      5,
      'Khu nghỉ dưỡng ôm trọn vịnh biển Nha Trang xinh đẹp, bãi biển riêng biệt lập và các villa hướng biển tuyệt mỹ.',
      '14:00',
      '12:00',
      'active'
    ]
  ];

  for (const h of hotelsData) {
    await dbRun(`
      INSERT INTO hotels (id, name, address, city, phone, email, star_rating, description, check_in_time, check_out_time, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, h);
  }

  // 4. Seed Hotel Images
  const hotelImagesData = [
    [1, 1, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 1],
    [2, 1, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80', 0],
    [3, 2, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', 1],
    [4, 3, 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', 1],
    [5, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 1],
    [6, 5, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', 1],
    [7, 6, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 1]
  ];
  for (const img of hotelImagesData) {
    await dbRun('INSERT INTO hotel_images (id, hotel_id, image_url, is_cover) VALUES (?, ?, ?, ?)', img);
  }

  // 5. Seed Hotel Amenities (Gán tiện ích cho khách sạn)
  const hotelAmenitiesData = [
    [1, 1], [1, 2], [1, 3], [1, 7], [1, 8],
    [2, 1], [2, 2], [2, 3], [2, 8],
    [3, 1], [3, 3], [3, 6], [3, 7],
    [4, 1], [4, 3], [4, 5], [4, 7],
    [5, 1], [5, 3], [5, 6], [5, 7],
    [6, 1], [6, 2], [6, 3], [6, 7], [6, 8]
  ];
  for (const ha of hotelAmenitiesData) {
    await dbRun('INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES (?, ?)', ha);
  }

  // 6. Seed Room Types (Hạng phòng)
  const roomTypesData = [
    // Hotel 1 (Phú Quốc)
    [1, 1, 'Deluxe Ocean View King', 'Phòng sang trọng view toàn cảnh biển ngọc, ban công đón gió biển.', 45.0, 2, 1, '1 Giường King Size', 1850000, 5, 'Miễn phí hủy phòng trước 24 giờ', 'active'],
    [2, 1, 'Grand Suite Sunset Horizon', 'Suite thượng hạng tầng cao ngắm hoàng hôn, phòng khách riêng.', 75.0, 2, 2, '1 Giường Super King', 3200000, 3, 'Miễn phí hủy phòng trước 48 giờ', 'active'],
    [3, 1, 'Presidential Beachfront Villa', 'Biệt thự hồ bơi riêng biệt sát mép sóng biển, phục vụ quản gia 24/7.', 150.0, 4, 2, '2 Giường King Size', 6800000, 2, 'Hủy miễn phí trước 3 ngày', 'active'],
    // Hotel 2 (Đà Nẵng)
    [4, 2, 'Premier Han River View', 'Tầm nhìn bao quát Cầu Rồng và dòng sông Hàn thơ mộng lung linh về đêm.', 42.0, 2, 1, '1 Giường King Size', 1450000, 6, 'Miễn phí hủy phòng trước 24 giờ', 'active'],
    [5, 2, 'Executive Riverfront Suite', 'Suite cao cấp tầng 25 hướng cầu Rồng, bồn tắm kính sang trọng.', 65.0, 3, 1, '1 King + 1 Đơn', 2400000, 4, 'Miễn phí hủy phòng trước 48 giờ', 'active'],
    // Hotel 3 (Đà Lạt)
    [6, 3, 'Romantic Pine Forest Suite', 'Phòng phong cách Pháp cổ điển lò sưởi ấm cúng, view rừng thông mơ mộng.', 50.0, 2, 0, '1 Giường Queen Size', 1200000, 5, 'Miễn phí hủy trước 24 giờ', 'active'],
    [7, 3, 'Valley Villa Gia Đình', 'Biệt thự sân vườn ấm áp phù hợp gia đình nghỉ dưỡng giữa thiên nhiên.', 90.0, 4, 2, '2 Giường Đôi Lớn', 2600000, 2, 'Hủy trước 48 giờ', 'active'],
    // Hotel 4 (Sài Gòn)
    [8, 4, 'Metropolitan City View', 'Thiết kế hiện đại năng động giữa trung tâm quận 1, cách âm tuyệt đối.', 38.0, 2, 1, '1 Giường Queen Size', 1600000, 8, 'Miễn phí hủy trước 24 giờ', 'active'],
    // Hotel 5 (Hà Nội)
    [9, 5, 'Heritage Indochine King', 'Không gian đậm chất Đông Dương hoài niệm, nội thất gỗ gõ đỏ tinh xảo.', 40.0, 2, 1, '1 Giường King Size', 1750000, 5, 'Miễn phí hủy trước 24 giờ', 'active'],
    // Hotel 6 (Nha Trang)
    [10, 6, 'Oceanfront Panorama Deluxe', 'Ban công kính rộng mở 180 độ đón trọn bình minh vịnh Nha Trang.', 48.0, 2, 1, '1 Giường King Size', 1550000, 6, 'Miễn phí hủy trước 24 giờ', 'active']
  ];

  for (const rt of roomTypesData) {
    await dbRun(`
      INSERT INTO room_types (id, hotel_id, name, description, area_sqm, max_adults, max_children, bed_type, base_price, quantity, cancellation_policy, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, rt);
  }

  // 7. Seed Room Type Images
  const roomTypeImagesData = [
    [1, 1, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', 1],
    [2, 1, 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80', 0],
    [3, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', 1],
    [4, 2, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', 0],
    [5, 3, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', 1],
    [6, 4, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', 1],
    [7, 5, 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80', 1],
    [8, 6, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', 1],
    [9, 7, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', 1],
    [10, 8, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', 1],
    [11, 9, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 1],
    [12, 10, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', 1]
  ];
  for (const rti of roomTypeImagesData) {
    await dbRun('INSERT INTO room_type_images (id, room_type_id, image_url, is_cover) VALUES (?, ?, ?, ?)', rti);
  }

  // 8. Seed Room Type Amenities (Tiện nghi loại phòng)
  const roomTypeAmenitiesData = [
    [1, 1], [1, 3], [1, 4], [1, 5],
    [2, 1], [2, 3], [2, 4], [2, 5], [2, 6],
    [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
    [4, 1], [4, 3], [4, 4], [4, 5],
    [5, 1], [5, 3], [5, 4], [5, 5], [5, 6],
    [6, 1], [6, 3], [6, 4], [6, 6],
    [7, 1], [7, 3], [7, 4], [7, 5], [7, 6],
    [8, 1], [8, 3], [8, 4], [8, 5],
    [9, 1], [9, 3], [9, 4], [9, 5], [9, 6],
    [10, 1], [10, 3], [10, 4], [10, 5], [10, 6]
  ];
  for (const rta of roomTypeAmenitiesData) {
    await dbRun('INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES (?, ?)', rta);
  }

  // 9. Seed Physical Rooms (Phòng vật lý)
  const roomsData = [
    // Type 1: Deluxe Ocean View King (Hotel 1)
    [1, 1, '101', 1, 'available'],
    [2, 1, '102', 1, 'available'],
    [3, 1, '103', 1, 'available'],
    // Type 2: Grand Suite Sunset Horizon (Hotel 1)
    [4, 2, '201', 2, 'available'],
    [5, 2, '202', 2, 'available'],
    // Type 3: Presidential Beachfront Villa (Hotel 1)
    [6, 3, 'VILLA-01', 1, 'available'],
    [7, 3, 'VILLA-02', 1, 'available'],
    // Type 4: Premier Han River View (Hotel 2)
    [8, 4, '301', 3, 'available'],
    [9, 4, '302', 3, 'available'],
    // Type 5: Executive Riverfront Suite (Hotel 2)
    [10, 5, '501', 5, 'available'],
    // Type 6: Romantic Pine Forest Suite (Hotel 3)
    [11, 6, '105', 1, 'available'],
    // Type 7: Valley Villa Gia Đình (Hotel 3)
    [12, 7, 'VILLA-DALAT', 1, 'available'],
    // Type 8: Metropolitan City View (Hotel 4)
    [13, 8, '801', 8, 'available'],
    // Type 9: Heritage Indochine King (Hotel 5)
    [14, 9, '205', 2, 'available'],
    // Type 10: Oceanfront Panorama Deluxe (Hotel 6)
    [15, 10, '401', 4, 'available']
  ];

  for (const r of roomsData) {
    await dbRun('INSERT INTO rooms (id, room_type_id, room_number, floor_number, status) VALUES (?, ?, ?, ?, ?)', r);
  }

  // 10. Seed Promotions (Mã khuyến mại)
  const promotionsData = [
    [1, 'VNSTAY2026', 'Ưu đãi chào năm mới 2026', 'fixed', 200000, 1500000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 100, 'active'],
    [2, 'SUMMERFUN', 'Siêu giảm giá du lịch mùa hè', 'fixed', 350000, 2000000, '2026-04-01 00:00:00', '2026-09-30 23:59:59', 50, 'active'],
    [3, 'FIRSTSTAY', 'Giảm trực tiếp cho lần đặt phòng đầu tiên', 'fixed', 100000, 500000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 200, 'active'],
    [4, 'VIP10', 'Giảm 10% tối đa 500.000 VNĐ cho hội viên', 'percentage', 10, 1000000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 50, 'active']
  ];

  for (const p of promotionsData) {
    await dbRun(`
      INSERT INTO promotions (id, code, description, discount_type, discount_value, min_order_value, start_date, end_date, usage_limit, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, p);
  }

  // 11. Seed Bookings & Booking Details & Payments
  const booking1 = [
    1,
    2, // user_id: Nguyễn Văn An
    1, // promotion_id: VNSTAY2026
    'BK2026101801',
    '2026-10-25',
    '2026-10-27',
    2,
    3700000, // 2 nights * 1,850,000
    200000,
    3500000,
    'confirmed',
    'Nguyễn Văn An',
    '0987654321',
    'khachhang@gmail.com',
    'Yêu cầu phòng tầng cao view biển, chuẩn bị nôi em bé'
  ];

  await dbRun(`
    INSERT INTO bookings (id, user_id, promotion_id, booking_code, check_in_date, check_out_date, total_guests, total_amount, discount_amount, final_amount, booking_status, contact_name, contact_phone, contact_email, special_request)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, booking1);

  await dbRun(`
    INSERT INTO booking_details (id, booking_id, room_id, room_type_id, quantity, price_per_night, number_of_nights, subtotal)
    VALUES (1, 1, 1, 1, 1, 1850000, 2, 3700000)
  `);

  await dbRun(`
    INSERT INTO payments (id, booking_id, amount, payment_method, transaction_code, payment_status, paid_at)
    VALUES (1, 1, 3500000, 'VNPAY', 'TXN984321', 'success', CURRENT_TIMESTAMP)
  `);

  // 12. Seed Reviews
  await dbRun(`
    INSERT INTO reviews (id, user_id, hotel_id, booking_id, rating, comment, status)
    VALUES (1, 2, 1, 1, 5, 'Kỳ nghỉ tuyệt vời ngoài sức tưởng tượng! Nhân viên phục vụ rất chu đáo, view ngắm biển hoàng hôn từ ban công cực kỳ đẹp. Chắc chắn sẽ quay lại!', 'approved')
  `);

  // 13. Seed Favorites
  await dbRun('INSERT INTO favorites (id, user_id, hotel_id) VALUES (1, 2, 1)');
  await dbRun('INSERT INTO favorites (id, user_id, hotel_id) VALUES (2, 2, 2)');

  console.log('✅ Đã khởi tạo hoàn tất 16 bảng dữ liệu CSDL theo chuẩn DBML!');
}

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet,
  initDB
};
