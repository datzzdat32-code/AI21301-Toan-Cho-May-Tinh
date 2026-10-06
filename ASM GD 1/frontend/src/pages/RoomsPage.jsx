import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import RoomCard from '../components/RoomCard';
import { Search, Filter, SlidersHorizontal, RefreshCw, Layers, Users, DollarSign, Star, AlertCircle, MapPin } from 'lucide-react';

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

      setRooms(roomsRes.data);
      setCategories(catRes.data);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <span className="text-blue-600 text-xs font-bold uppercase tracking-widest block mb-1">
              Tìm Khách Sạn & Resort Toàn Quốc
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {location ? `Khách Sạn & Phòng Đặt Tại ${location}` : 'Tất Cả Khách Sạn & Phòng Tại Việt Nam'}
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-2 md:mt-0 font-medium">
            Tìm thấy <strong className="text-blue-600 font-bold">{rooms.length}</strong> kết quả phù hợp
          </p>
        </div>

        {/* Quick Location Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          <button
            onClick={() => setLocation('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
              location === '' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
            }`}
          >
            🗺️ Tất Cả Việt Nam
          </button>
          {vietnamCities.map((city) => (
            <button
              key={city}
              onClick={() => setLocation(city)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                location === city ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
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
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl sticky top-24 space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span>Bộ Lọc Tìm Kiếm</span>
                </div>
                <button
                  onClick={handleResetFilter}
                  className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Đặt lại
                </button>
              </div>

              <form onSubmit={handleApplyFilter} className="space-y-4 text-xs">
                
                {/* Location Select */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Thành Phố / Địa Điểm
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 outline-none cursor-pointer font-bold"
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
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Từ Khóa / Tên Khách Sạn</label>
                  <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
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
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Loại Phòng
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 outline-none cursor-pointer font-medium"
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
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Số Khách Tối Đa
                  </label>
                  <select
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 outline-none cursor-pointer font-medium"
                  >
                    <option value="">Không giới hạn</option>
                    <option value="2">Từ 2 khách trở lên</option>
                    <option value="4">Từ 4 khách trở lên</option>
                    <option value="6">Từ 6 khách trở lên (Villa)</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-blue-600" />
                    Sắp Xếp Theo
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 outline-none cursor-pointer font-medium"
                  >
                    <option value="price_asc">Giá: Thấp đến Cao</option>
                    <option value="price_desc">Giá: Cao đến Thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>
                </div>

                {/* Apply Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all mt-2"
                >
                  Áp Dụng Bộ Lọc
                </button>
              </form>
            </div>
          </div>

          {/* ROOM GRID */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 4].map((i) => (
                  <div key={i} className="bg-white h-96 rounded-2xl animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
                <AlertCircle className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Không Tìm Thấy Khách Sạn Tại Địa Điểm Này</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Hiện tại không có phòng nào phù hợp tại địa điểm bạn chọn. Vui lòng chọn địa điểm khác hoặc đặt lại bộ lọc.
                </p>
                <button
                  onClick={handleResetFilter}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm"
                >
                  Xem Tất Cả Khách Sạn Toàn Quốc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms.map((room) => (
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
