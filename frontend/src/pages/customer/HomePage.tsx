import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Coffee, Wifi } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import { roomsApi } from '../../services/api';
import type { Room } from '../../types';

const HERO_BG = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=90';

const FEATURES = [
  { icon: Shield, label: 'Secure Booking', desc: 'Safe & encrypted transactions' },
  { icon: Star, label: 'Premium Service', desc: 'World-class hospitality' },
  { icon: Coffee, label: 'Complimentary Breakfast', desc: 'Daily breakfast included' },
  { icon: Wifi, label: 'Free High-Speed WiFi', desc: 'Stay connected everywhere' },
];

function RoomCard({ room }: { room: Room }) {
  return (
    <Link to={`/rooms/${room.id}`} className="group block bg-white overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={room.display_image || `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600`}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-charcoal-950 text-white font-sans text-xs tracking-widest uppercase px-3 py-1">
            {room.category}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-xl text-charcoal-950">{room.name}</h3>
          <span className="font-sans text-sm text-charcoal-500">Room {room.room_number}</span>
        </div>
        <p className="font-sans text-sm text-charcoal-500 line-clamp-2 mb-4">{room.description}</p>
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <div>
            <span className="font-display text-2xl text-charcoal-950">${room.price_per_night}</span>
            <span className="font-sans text-xs text-charcoal-400 ml-1">/ night</span>
          </div>
          <span className="font-sans text-xs text-charcoal-500 tracking-wide flex items-center gap-1 group-hover:gap-2 transition-all">
            View Room <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);

  useEffect(() => {
    roomsApi.list({ is_available: 'true', page_size: '3' })
      .then(res => setFeaturedRooms((res.data.results || res.data).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Hero */}
      <section className="relative h-screen min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Hotel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal-950/55" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-2xl animate-fade-in">
            <p className="font-sans text-gold-400 text-xs tracking-[0.3em] uppercase mb-5">
              Luxury Redefined
            </p>
            <h1 className="font-display text-5xl lg:text-7xl text-white leading-tight mb-6">
              Where Every Stay<br />
              <em className="text-gold-400">Becomes a Memory</em>
            </h1>
            <p className="font-sans text-white/70 text-lg mb-10 leading-relaxed">
              Experience unparalleled luxury at Lumière Hotel. From intimate standard rooms
              to our grand Presidential Suite — every space crafted for the extraordinary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/rooms" className="btn-gold inline-flex items-center gap-2 text-center justify-center">
                Explore Rooms <ArrowRight size={16} />
              </Link>
              <Link to="/rooms" className="border border-white/50 text-white font-sans text-sm font-medium px-6 py-3 hover:bg-white hover:text-charcoal-950 transition-colors text-center">
                Check Availability
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-stone-50 to-transparent" />
      </section>

      {/* Features strip */}
      <section className="bg-charcoal-950 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-gold-400" />
              </div>
              <div>
                <p className="font-sans text-white text-sm font-medium">{label}</p>
                <p className="font-sans text-white/50 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-sans text-gold-600 text-xs tracking-[0.25em] uppercase mb-3">
              Our Collection
            </p>
            <h2 className="font-display text-4xl lg:text-5xl text-charcoal-950">
              Featured Rooms
            </h2>
          </div>
          <Link to="/rooms" className="hidden md:flex items-center gap-2 font-sans text-sm text-charcoal-600 hover:text-charcoal-950 transition-colors">
            View all rooms <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRooms.length > 0
            ? featuredRooms.map(room => <RoomCard key={room.id} room={room} />)
            : Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white overflow-hidden">
                  <div className="aspect-[4/3] skeleton" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 skeleton w-3/4" />
                    <div className="h-4 skeleton w-full" />
                    <div className="h-4 skeleton w-2/3" />
                  </div>
                </div>
              ))
          }
        </div>
        <div className="mt-8 md:hidden text-center">
          <Link to="/rooms" className="btn-outline inline-block">View All Rooms</Link>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-charcoal-950 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-sans text-gold-400 text-xs tracking-[0.3em] uppercase mb-4">Special Offer</p>
          <h2 className="font-display text-4xl lg:text-5xl text-white mb-6">
            Stay 3 Nights,<br />
            <em className="text-gold-400">Pay for 2</em>
          </h2>
          <p className="font-sans text-white/60 text-base mb-8">
            Book any room for 3 or more nights and receive one night complimentary.
            Valid for all room categories.
          </p>
          <Link to="/rooms" className="btn-gold inline-block">Book Now</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal-950 border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-xl text-white">Lumière Hotel</span>
          <p className="font-sans text-white/40 text-sm">
            © {new Date().getFullYear()} Lumière Hotel. All rights reserved.
          </p>
          <Link to="/admin/login" className="font-sans text-white/30 text-xs hover:text-white/60 transition-colors">
            Staff Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
