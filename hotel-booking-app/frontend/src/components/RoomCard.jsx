import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Bed, Maximize2, Star, CheckCircle2, ArrowRight, MapPin, ShieldCheck, Coffee, Sparkles } from 'lucide-react';

export default function RoomCard({ room }) {
  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Convert 5.0 scale to 10-point Agoda/Booking review score
  const reviewScore10 = ((room.rating || 4.8) * 2).toFixed(1);

  // Trạng thái phòng: CÒN TRỐNG hay ĐÃ KÍN
  const isMaintenance = room.is_available === 0;
  const isOccupiedToday = room.occupancy_status === 'OCCUPIED' || room.is_occupied;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group ${
      isMaintenance 
        ? 'border-amber-200 hover:border-amber-300' 
        : isOccupiedToday 
        ? 'border-amber-200 hover:border-amber-400 hover:-translate-y-1' 
        : 'border-slate-200 hover:border-blue-500 hover:-translate-y-1'
    }`}>
      
      {/* Image Container with Vignette Gradient */}
      <div className="relative h-60 overflow-hidden bg-slate-100">
        <img
          src={room.images?.[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'}
          alt={room.name}
          className={`w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out ${
            isMaintenance || isOccupiedToday ? 'filter brightness-95' : ''
          }`}
        />
        
        {/* Subtle dark gradient overlay top and bottom */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {/* City Location Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-blue-600/95 text-white shadow-sm flex items-center gap-1 backdrop-blur-md">
            <MapPin className="w-3 h-3 text-sky-200" />
            <span>{room.location || 'Phú Quốc'}</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/95 text-slate-800 backdrop-blur-md border border-white/40 shadow-xs">
            {room.room_type_name || 'Phòng Khách Sạn'}
          </span>
        </div>

        {/* Trạng Thái Còn Trống / Đã Kín Hôm Nay */}
        <div className="absolute top-3 right-3 z-10">
          {isMaintenance ? (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-600/95 text-white shadow-md flex items-center gap-1.5 border border-rose-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>ĐANG BẢO TRÌ</span>
            </span>
          ) : isOccupiedToday ? (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-600/95 text-white shadow-md flex items-center gap-1.5 border border-amber-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>HÔM NAY CÓ KHÁCH</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-600/95 text-white shadow-md flex items-center gap-1.5 border border-emerald-300 backdrop-blur-md animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>CÒN TRỐNG</span>
            </span>
          )}
        </div>

        {/* Agoda / Booking style 10-point rating score */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950/85 text-white backdrop-blur-md border border-white/10 shadow-sm z-10">
          <div className="text-right">
            <span className="text-[10px] font-bold block text-sky-300 leading-none">Tuyệt vời</span>
            <span className="text-[9px] text-slate-300 font-medium">{room.review_count || 128} đánh giá</span>
          </div>
          <span className="text-xs font-black bg-blue-600 text-white px-2 py-0.5 rounded-md font-mono shadow-xs">
            {reviewScore10}
          </span>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          {/* Hotel Name & Stars */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider truncate">
              {room.hotel_name || 'VnStay Resort & Hotel'}
            </span>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
          </div>

          {/* Room Name */}
          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
            {room.name}
          </h3>

          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3">
            {room.description}
          </p>

          {/* Authentic Travel Badges & Status */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px] font-bold">
            {isMaintenance ? (
              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                🛠️ Tạm ngưng đón khách
              </span>
            ) : isOccupiedToday ? (
              <span className="bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                🔴 Hôm nay có khách (nhận đặt ngày khác)
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                🟢 Sẵn sàng nhận khách
              </span>
            )}
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Miễn phí hủy phòng</span>
            </span>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
              <Coffee className="w-3 h-3 text-amber-600" />
              <span>Tặng kèm ăn sáng</span>
            </span>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-3 gap-1.5 py-2 px-3 bg-slate-50/90 rounded-xl border border-slate-100 text-[11px] text-slate-700 font-semibold">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{room.capacity} Khách</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{room.bed_count} Giường</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{room.size_sqm} m²</span>
            </div>
          </div>
        </div>

        {/* Free Cancellation & Price */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <span className="inline-block bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md mr-1.5">
                -20%
              </span>
              <span className="text-[11px] text-slate-400 line-through font-medium">
                {formatVND(room.price_per_night * 1.25)}
              </span>
              <span className="text-[10px] text-slate-500 block font-medium mt-0.5">Giá 1 đêm (đã gồm Thuế & Phí)</span>
            </div>

            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black text-blue-700 leading-none block">
                {formatVND(room.price_per_night)}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          {isMaintenance ? (
            <Link
              to={`/rooms/${room.id}`}
              className="w-full py-2.5 px-3.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-300 shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Phòng Đang Tạm Đóng Bảo Trì</span>
            </Link>
          ) : isOccupiedToday ? (
            <Link
              to={`/rooms/${room.id}`}
              className="w-full py-2.5 px-3.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 border border-amber-300 shadow-xs flex items-center justify-center gap-1.5 group/btn transition-all cursor-pointer"
            >
              <span>Xem Lịch & Đặt Ngày Khác</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-700 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link
              to={`/rooms/${room.id}`}
              className="w-full py-2.5 px-3.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg flex items-center justify-center gap-1.5 group/btn transition-all cursor-pointer"
            >
              <span>Giữ Phòng Giá Tốt Ngay</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
