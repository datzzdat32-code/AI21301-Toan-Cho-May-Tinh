const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'hotel.db');
const dbWalPath = path.resolve(__dirname, 'hotel.db-wal');
const dbShmPath = path.resolve(__dirname, 'hotel.db-shm');

console.log('🔄 Đang tiến hành tái cấu trúc & làm sạch Cơ sở dữ liệu SQLite...');

[dbPath, dbWalPath, dbShmPath].forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`🗑️ Đã xóa file cũ: ${path.basename(file)}`);
    } catch (err) {
      console.warn(`⚠️ Không thể xóa file ${path.basename(file)} (file đang mở):`, err.message);
    }
  }
});

const { initDB } = require('./database');

initDB().then(() => {
  console.log('✨ Tái cấu trúc & Khởi tạo CSDL SQLite mới thành công 100%!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Lỗi khi khởi tạo CSDL:', err);
  process.exit(1);
});
