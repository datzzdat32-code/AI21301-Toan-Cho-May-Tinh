import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import RoomCard from '../components/RoomCard';
import { Search, Filter, SlidersHorizontal, RefreshCw, Layers, Users, DollarSign, Star, AlertCircle, MapPin, Sparkles, Building2 } from 'lucide-react';

export default function RoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [capacity, setCapacity] = useState(searchParams.get('capacity') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, AVAILABLE, OCCUPIED

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (location) params.append('location', location);
      if (category) params.append('roomTypeId', category);
      if (capacity) params.append('capacity', capacity);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sortBy', sortBy);

      const [roomsRes, catRes] = await Promise.all([
        axios.get(`/api/rooms?${params.toString()}`),
        axios.get('/api/categories')
      ]);

      setRooms(roomsRes.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [location, category, capacity, sortBy]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchRooms();
  };

  const handleResetFilter = () => {
    setSearch('');
    setLocation('');
    setCategory('');
    setCapacity('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('price_asc');
    setSearchParams({});
  };

  const vietnamCities = ['Đà Nẵng', 'Phú Quốc', 'Đà Lạt', 'TP. Hồ Chí Minh', 'Hà Nội', 'Nha Trang', 'Sapa', 'Vũng Tàu'];

  const availableRoomsCount = rooms.filter(r => r.occupancy_status === 'AVAILABLE' || (!r.is_occupied && r.is_available !== 0)).length;
  const occupiedRoomsCount = rooms.filter(r => r.occupancy_status === 'OCCUPIED' || r.is_occupied || r.is_available === 0).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div>
            <span className="text-blue-600 text-xs font-extrabold uppercase tracking-widest block mb-1">
              Khách Sạn & Resort Toàn Quốc
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {location ? `Khách Sạn & Phòng Đặt Tại ${location}` : 'Tất Cả Khách Sạn & Phòng Tại Việt Nam'}
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold">
            Tìm thấy <strong className="text-blue-600 font-extrabold text-base">{rooms.length}</strong> khách sạn phù hợp
          </p>
        </div>

        {/* Quick Location Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setLocation('')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer border ${
              location === '' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-sm shadow-blue-500/20' 
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
            }`}
          >
            🗺️ Tất Cả Việt Nam
          </button>
          {vietnamCities.map((city) => (
            <button
              key={city}
              onClick={() => setLocation(city)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer border ${
                location === city 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-sm shadow-blue-500/20' 
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
              }`}
            >
              📍 {city}
            </button>
          ))}
        </div>

        {/* Main Layout: Sidebar Filter + Room Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* FILTER SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl sticky top-24 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span>Bộ Lọc Tìm Kiếm</span>
                </div>
                <button
                  onClick={handleResetFilter}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Đặt lại</span>
                </button>
              </div>

              <form onSubmit={handleApplyFilter} className="space-y-4 text-xs">
                
                {/* Location Select */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Thành Phố / Địa Điểm</span>
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 outline-none cursor-pointer font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Tất cả địa điểm Việt Nam</option>
                    {vietnamCities.map((c) => (
                      <option key={c} value={c}>
                        📍 {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Text */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-600 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    <span>Từ Khóa / Tên Khách Sạn</span>
                  </label>
                  <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                    <input
                      type="text"
                      placeholder="Tên khách sạn, resort, view..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="bg-transparent text-xs text-slate-800 outline-none w-full font-medium"
                    />
                  </div>
                </div>

                {/* Category Select */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-600 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Loại Phòng</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 outline-none cursor-pointer font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Tất cả loại phòng</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacity */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Số Khách Tối Đa</span>
                  </label>
                  <select
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 outline-none cursor-pointer font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Không giới hạn</option>
                    <option value="2">Từ 2 khách trở lên</option>
                    <option value="4">Từ 4 khách trở lên</option>
                    <option value="6">Từ 6 khách trở lên (Villa)</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-600 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sắp Xếp Theo</span>
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 outline-none cursor-pointer font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="price_asc">Giá: Thấp đến Cao</option>
                    <option value="price_desc">Giá: Cao đến Thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>
                </div>

                {/* Apply Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer mt-2"
                >
                  Áp Dụng Bộ Lọc
                </button>
              </form>
            </div>
          </div>

          {/* ROOM GRID & STATUS FILTER */}
          <div className="lg:col-span-3 space-y-6">

            {/* Quick Status Availability Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Tình trạng phòng:</span>
                </span>
                
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    statusFilter === 'ALL'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🏢 Tất Cả ({rooms.length})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('AVAILABLE')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    statusFilter === 'AVAILABLE'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>🟢 Còn Trống ({availableRoomsCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('OCCUPIED')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    statusFilter === 'OCCUPIED'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>🔴 Đã Kín ({occupiedRoomsCount})</span>
                </button>
              </div>

              <div className="text-[11px] font-bold text-slate-500">
                Hiển thị <span className="text-blue-700">{rooms.filter(r => {
                  const isOcc = r.occupancy_status === 'OCCUPIED' || r.is_occupied || r.is_available === 0;
                  if (statusFilter === 'AVAILABLE') return !isOcc;
                  if (statusFilter === 'OCCUPIED') return isOcc;
                  return true;
                }).length}</span> phòng
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 4].map((i) => (
                  <div key={i} className="bg-white h-96 rounded-2xl animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : rooms.filter(r => {
                const isOcc = r.occupancy_status === 'OCCUPIED' || r.is_occupied || r.is_available === 0;
                if (statusFilter === 'AVAILABLE') return !isOcc;
                if (statusFilter === 'OCCUPIED') return isOcc;
                return true;
              }).length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3.5 shadow-xs">
                <AlertCircle className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Không Tìm Thấy Khách Sạn Phù Hợp</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Hiện tại không có phòng nào phù hợp với điều kiện và tình trạng bạn chọn.
                </p>
                <button
                  onClick={() => {
                    handleResetFilter();
                    setStatusFilter('ALL');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  Xem Tất Cả Khách Sạn Toàn Quốc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms
                  .filter(r => {
                    const isOcc = r.occupancy_status === 'OCCUPIED' || r.is_occupied || r.is_available === 0;
                    if (statusFilter === 'AVAILABLE') return !isOcc;
                    if (statusFilter === 'OCCUPIED') return isOcc;
                    return true;
                  })
                  .map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
