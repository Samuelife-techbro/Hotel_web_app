import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, Users, ArrowRight, Search, X } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import { roomsApi } from '../../services/api';
import type { Room, RoomFilters } from '../../types';

const CATEGORIES = ['all', 'standard', 'deluxe', 'suite', 'presidential'];
const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Rooms', standard: 'Standard', deluxe: 'Deluxe', suite: 'Suite', presidential: 'Presidential'
};

function RoomCard({ room }: { room: Room }) {
  return (
    <div className="group bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in">
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
        <img
          src={room.display_image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-charcoal-950 text-white font-sans text-xs tracking-widest uppercase px-3 py-1">
            {room.category}
          </span>
          {!room.is_available && (
            <span className="bg-red-500 text-white font-sans text-xs tracking-wide uppercase px-3 py-1">
              Unavailable
            </span>
          )}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-xl text-charcoal-950 group-hover:text-charcoal-700 transition-colors">
            {room.name}
          </h3>
          <span className="font-sans text-xs text-charcoal-400 mt-1">#{room.room_number}</span>
        </div>
        <p className="font-sans text-sm text-charcoal-500 line-clamp-2 mb-4 leading-relaxed">
          {room.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {room.amenities.slice(0, 4).map(a => (
            <span key={a} className="font-sans text-xs bg-stone-100 text-charcoal-600 px-2.5 py-1">
              {a}
            </span>
          ))}
          {room.amenities.length > 4 && (
            <span className="font-sans text-xs text-charcoal-400 px-2 py-1">
              +{room.amenities.length - 4} more
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-charcoal-500 font-sans mb-5">
          <span className="flex items-center gap-1"><Users size={12} /> Up to {room.capacity} guests</span>
          <span>•</span>
          <span>Floor {room.floor}</span>
          <span>•</span>
          <span>{room.size_sqm} m²</span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <div>
            <span className="font-display text-2xl text-charcoal-950">${room.price_per_night}</span>
            <span className="font-sans text-xs text-charcoal-400 ml-1">/ night</span>
          </div>
          <Link
            to={room.is_available ? `/book/${room.id}` : `/rooms/${room.id}`}
            className={`inline-flex items-center gap-2 font-sans text-sm font-medium px-5 py-2.5 transition-colors ${
              room.is_available
                ? 'bg-charcoal-950 text-white hover:bg-charcoal-800'
                : 'bg-stone-100 text-charcoal-400 cursor-not-allowed'
            }`}
          >
            {room.is_available ? 'Book Now' : 'View Details'} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RoomFilters>({ is_available: undefined });
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.min_capacity) params.min_capacity = filters.min_capacity;
      if (search) params.search = search;
      if (checkIn && checkOut) {
        const res = await roomsApi.available({ ...params, check_in: checkIn, check_out: checkOut });
        setRooms(res.data);
      } else {
        const res = await roomsApi.list(params);
        setRooms(res.data.results || res.data);
      }
    } catch { setRooms([]); }
    setLoading(false);
  }, [activeCategory, filters, search, checkIn, checkOut]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const clearFilters = () => {
    setFilters({});
    setActiveCategory('all');
    setSearch('');
    setCheckIn('');
    setCheckOut('');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Header */}
      <div className="bg-charcoal-950 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-sans text-gold-400 text-xs tracking-[0.3em] uppercase mb-3">Our Collection</p>
          <h1 className="font-display text-4xl lg:text-5xl text-white mb-6">Rooms & Suites</h1>

          {/* Availability Search */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 lg:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
            <div>
              <label className="block font-sans text-xs text-white/60 uppercase tracking-wider mb-2">Check In</label>
              <input type="date" value={checkIn} min={today}
                onChange={e => setCheckIn(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white font-sans text-sm px-3 py-2.5 focus:outline-none focus:border-gold-400 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-white/60 uppercase tracking-wider mb-2">Check Out</label>
              <input type="date" value={checkOut} min={checkIn || today}
                onChange={e => setCheckOut(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white font-sans text-sm px-3 py-2.5 focus:outline-none focus:border-gold-400 [color-scheme:dark]"
              />
            </div>
            <div className="flex items-end">
              <button onClick={fetchRooms} className="w-full bg-gold-500 text-charcoal-950 font-sans text-sm font-medium py-2.5 hover:bg-gold-400 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        {/* Category tabs + Filter controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-sans text-sm px-4 py-2 transition-colors ${
                  activeCategory === cat
                    ? 'bg-charcoal-950 text-white'
                    : 'bg-white text-charcoal-600 border border-stone-200 hover:border-charcoal-400'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search rooms..."
                className="pl-9 pr-4 py-2 border border-stone-200 font-sans text-sm bg-white focus:outline-none focus:border-charcoal-950 w-48"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 border font-sans text-sm px-4 py-2 transition-colors ${
                showFilters ? 'bg-charcoal-950 text-white border-charcoal-950' : 'bg-white border-stone-200 text-charcoal-600 hover:border-charcoal-400'
              }`}
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            {(activeCategory !== 'all' || search || checkIn || filters.min_price) && (
              <button onClick={clearFilters} className="flex items-center gap-1 font-sans text-xs text-charcoal-500 hover:text-charcoal-950">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-white border border-stone-100 p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
            <div>
              <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-2">Min Price / night</label>
              <input type="number" placeholder="$0"
                value={filters.min_price || ''}
                onChange={e => setFilters(f => ({ ...f, min_price: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-2">Max Price / night</label>
              <input type="number" placeholder="$1000"
                value={filters.max_price || ''}
                onChange={e => setFilters(f => ({ ...f, max_price: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-2">Min Capacity</label>
              <input type="number" placeholder="1"
                value={filters.min_capacity || ''}
                onChange={e => setFilters(f => ({ ...f, min_capacity: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex items-end">
              <button onClick={fetchRooms} className="btn-primary w-full">Apply</button>
            </div>
          </div>
        )}

        {/* Results count */}
        <p className="font-sans text-sm text-charcoal-500 mb-6">
          {loading ? 'Searching...' : `${rooms.length} room${rooms.length !== 1 ? 's' : ''} found`}
          {(checkIn && checkOut) && ` · Available ${checkIn} → ${checkOut}`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white overflow-hidden">
                <div className="skeleton" style={{ aspectRatio: '16/10' }} />
                <div className="p-6 space-y-3">
                  <div className="h-5 skeleton w-3/4" />
                  <div className="h-4 skeleton w-full" />
                  <div className="h-4 skeleton w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-3xl text-charcoal-300 mb-3">No rooms found</p>
            <p className="font-sans text-charcoal-400 mb-6">Try adjusting your filters or dates.</p>
            <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => <RoomCard key={room.id} room={room} />)}
          </div>
        )}
      </div>
    </div>
  );
}
