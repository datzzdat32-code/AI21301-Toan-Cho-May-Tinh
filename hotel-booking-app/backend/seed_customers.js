const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'hotel.db');
const db = new sqlite3.Database(dbPath);

async function seedCustomers() {
  const passwordHash = await bcrypt.hash('user123', 10);

  const sampleCustomers = [
    {
      id: 'usr_cust_01',
      name: 'Lê Thị Hồng Hạnh',
      email: 'honghanh.le@gmail.com',
      phone: '0912345678',
      bookingId: 'bk_demo_101',
      roomId: 'rm_101',
      checkIn: '2026-09-29',
      checkOut: '2026-10-02',
      guestCount: 2,
      totalPrice: 6600000,
      status: 'CONFIRMED',
      paymentMethod: 'VNPAY'
    },
    {
      id: 'usr_cust_02',
      name: 'Trần Quốc Bảo',
      email: 'quocbao.tran@yahoo.com',
      phone: '0938889999',
      bookingId: 'bk_demo_102',
      roomId: 'rm_102',
      checkIn: '2026-09-29',
      checkOut: '2026-10-03',
      guestCount: 4,
      totalPrice: 19200000,
      status: 'CONFIRMED',
      paymentMethod: 'MOMO_QR'
    },
    {
      id: 'usr_cust_03',
      name: 'Nguyễn Hoàng Minh',
      email: 'hoangminh.tech@gmail.com',
      phone: '0909112233',
      bookingId: 'bk_demo_103',
      roomId: 'rm_103',
      checkIn: '2026-09-28',
      checkOut: '2026-10-01',
      guestCount: 6,
      totalPrice: 22500000,
      status: 'CONFIRMED',
      paymentMethod: 'CREDIT_CARD'
    },
    {
      id: 'usr_cust_04',
      name: 'Đặng Thùy Dương',
      email: 'thuyduong.design@gmail.com',
      phone: '0977654321',
      bookingId: 'bk_demo_105',
      roomId: 'rm_105',
      checkIn: '2026-09-30',
      checkOut: '2026-10-02',
      guestCount: 2,
      totalPrice: 5200000,
      status: 'PENDING',
      paymentMethod: 'PAY_AT_HOTEL'
    }
  ];

  db.serialize(async () => {
    for (const c of sampleCustomers) {
      // 1. Insert user
      db.run(
        'INSERT OR REPLACE INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [c.id, c.name, c.email, passwordHash, 'CUSTOMER', c.phone]
      );

      // 2. Insert booking
      db.run(
        `INSERT OR REPLACE INTO bookings (id, user_id, room_id, check_in, check_out, guest_count, total_price, status, guest_name, guest_email, guest_phone, special_requests)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.bookingId, c.id, c.roomId, c.checkIn, c.checkOut, c.guestCount, c.totalPrice, c.status, c.name, c.email, c.phone, 'Tầng cao view đẹp, chuẩn bị rượu vang chào mừng']
      );

      // 3. Insert payment
      if (c.status === 'CONFIRMED') {
        db.run(
          `INSERT OR REPLACE INTO payments (id, booking_id, method, transaction_id, amount, status, paid_at)
           VALUES (?, ?, ?, ?, ?, ?, DATETIME('now'))`,
          ['pay_' + c.bookingId, c.bookingId, c.paymentMethod, 'TXN' + Math.floor(100000 + Math.random() * 900000), c.totalPrice, 'SUCCESS']
        );
      }
    }
    console.log('✅ Successfully added 4 realistic sample customers and bookings!');
  });
}

seedCustomers();
