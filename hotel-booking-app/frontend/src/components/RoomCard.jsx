import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Bed, Maximize2, Star, CheckCircle2, ArrowRight, MapPin, ShieldCheck } from 'lucide-react';

export default function RoomCard({ room }) {
  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Convert 5.0 scale to 10-point Agoda/Booking review score
  const reviewScore10 = ((room.rating || 4.8) * 2).toFixed(1);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-400 transition-all duration-300 flex flex-col group">
      
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img
          src={room.images?.[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* City Location Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white shadow-xs flex items-center gap-1">
            <MapPin className="w-3 h-3 text-white" />
            {room.location || 'Phú Quốc'}
          </span>
          <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white/95 text-slate-800 backdrop-blur-xs border border-slate-200">
            {room.room_type_name || 'Phòng Khách Sạn'}
          </span>
        </div>

        {/* Agoda / Booking style 10-point rating score */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-900/90 text-white backdrop-blur-xs shadow-xs">
          <div className="text-right">
            <span className="text-[10px] font-bold block text-blue-200 leading-none">Tuyệt vời</span>
            <span className="text-[9px] text-slate-300 font-medium">{room.review_count} đánh giá</span>
          </div>
          <span className="text-sm font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-md font-mono">
            {reviewScore10}
          </span>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          {/* Hotel Name & Stars */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wide truncate">
              {room.hotel_name || 'VnStay Resort'}
            </span>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400" />
              ))}
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
            {room.name}
          </h3>

          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3">
            {room.description}
          </p>

          {/* Authentic Travel Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px] font-bold">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Miễn phí hủy phòng
            </span>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
              ☕ Thắt kèm ăn sáng
            </span>
            <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-md">
              🔥 Còn 2 phòng tốt
            </span>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-700 font-medium">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-600 shrink-0" />
              <span>{room.capacity} Khách</span>
            </div>
            <div className="flex items-center gap-1">
              <Bed className="w-3 h-3 text-blue-600 shrink-0" />
              <span>{room.bed_count} Giường</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-blue-600 shrink-0" />
              <span>{room.size_sqm} m²</span>
            </div>
          </div>
        </div>

        {/* Free Cancellation & Price */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-end justify-between">
            <div>
              <span className="inline-block bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-xs mr-1.5">
                -20%
              </span>
              <span className="text-[11px] text-slate-400 line-through font-medium">
                {formatVND(room.price_per_night * 1.25)}
              </span>
              <span className="text-[10px] text-slate-500 block font-medium mt-0.5">Giá 1 đêm (đã gồm Thuế & Phí)</span>
            </div>

            <div className="text-right">
              <span className="text-xl font-black text-blue-700 leading-none block">
                {formatVND(room.price_per_night)}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            to={`/rooms/${room.id}`}
            className="w-full py-2.5 px-3 rounded-lg font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-xs flex items-center justify-center gap-1.5 group/btn transition-all"
          >
            <span>Giữ Phòng Giá Tốt Ngay</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
