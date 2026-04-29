import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Maximize, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import { roomsApi } from '../../services/api';
import type { Room } from '../../types';

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!id) return;
    roomsApi.get(parseInt(id))
      .then(res => setRoom(res.data))
      .catch(() => navigate('/rooms'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const checkAvailability = async () => {
    if (!room || !checkIn || !checkOut) return;
    setChecking(true);
    try {
      const res = await roomsApi.checkAvailability(room.id, checkIn, checkOut);
      setAvailable(res.data.available);
    } catch { setAvailable(false); }
    setChecking(false);
  };

  const nights = checkIn && checkOut
    ? Math.max(0, Math.floor((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  const today = new Date().toISOString().split('T')[0];

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!room) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-20">
        {/* Hero image */}
        <div className="relative h-[50vh] lg:h-[60vh] overflow-hidden">
          <img
            src={room.display_image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200'}
            alt={room.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal-950/30" />
          <Link to="/rooms" className="absolute top-6 left-6 flex items-center gap-2 text-white font-sans text-sm bg-charcoal-950/50 backdrop-blur-sm px-4 py-2 hover:bg-charcoal-950 transition-colors">
            <ArrowLeft size={14} /> Back to Rooms
          </Link>
          <div className="absolute bottom-6 left-6">
            <span className="bg-charcoal-950 text-white font-sans text-xs tracking-widest uppercase px-3 py-1.5">
              {room.category}
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: details */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="font-display text-4xl text-charcoal-950 mb-1">{room.name}</h1>
                  <p className="font-sans text-charcoal-500 text-sm">Room {room.room_number} · Floor {room.floor}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl text-charcoal-950">${room.price_per_night}</p>
                  <p className="font-sans text-xs text-charcoal-400">per night</p>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-stone-200">
                <div className="flex items-center gap-2 font-sans text-sm text-charcoal-600">
                  <Users size={16} className="text-gold-600" />
                  Up to {room.capacity} guests
                </div>
                <div className="flex items-center gap-2 font-sans text-sm text-charcoal-600">
                  <Maximize size={16} className="text-gold-600" />
                  {room.size_sqm} m²
                </div>
              </div>

              <p className="font-sans text-charcoal-600 leading-relaxed mb-10">{room.description}</p>

              {/* Amenities */}
              <div>
                <h3 className="font-display text-xl text-charcoal-950 mb-5">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities.map(amenity => (
                    <div key={amenity} className="flex items-center gap-2.5 font-sans text-sm text-charcoal-700">
                      <CheckCircle size={14} className="text-gold-500 flex-shrink-0" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: booking widget */}
            <div>
              <div className="bg-white border border-stone-200 p-6 sticky top-24">
                <h3 className="font-display text-xl text-charcoal-950 mb-5">Check Availability</h3>
                <div className="space-y-4 mb-5">
                  <div>
                    <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Check In</label>
                    <input type="date" value={checkIn} min={today}
                      onChange={e => { setCheckIn(e.target.value); setAvailable(null); }}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Check Out</label>
                    <input type="date" value={checkOut} min={checkIn || today}
                      onChange={e => { setCheckOut(e.target.value); setAvailable(null); }}
                      className="input-field"
                    />
                  </div>
                </div>

                {nights > 0 && (
                  <div className="bg-stone-50 border border-stone-100 p-4 mb-4 space-y-2">
                    <div className="flex justify-between font-sans text-sm text-charcoal-600">
                      <span>${room.price_per_night} × {nights} night{nights > 1 ? 's' : ''}</span>
                      <span>${(parseFloat(room.price_per_night) * nights).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-sans text-sm font-semibold text-charcoal-950 pt-2 border-t border-stone-200">
                      <span>Total</span>
                      <span>${(parseFloat(room.price_per_night) * nights).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {available !== null && (
                  <div className={`p-3 mb-4 font-sans text-sm text-center ${
                    available ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {available ? '✓ Available for selected dates' : '✗ Not available for selected dates'}
                  </div>
                )}

                {checkIn && checkOut ? (
                  available === true ? (
                    <Link
                      to={`/book/${room.id}?check_in=${checkIn}&check_out=${checkOut}`}
                      className="btn-gold w-full flex items-center justify-center gap-2"
                    >
                      Book This Room <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <button
                      onClick={checkAvailability}
                      disabled={checking}
                      className="btn-primary w-full"
                    >
                      {checking ? 'Checking...' : 'Check Availability'}
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {}}
                    disabled
                    className="btn-primary w-full opacity-50 cursor-not-allowed"
                  >
                    Select Dates First
                  </button>
                )}

                <p className="font-sans text-xs text-charcoal-400 text-center mt-3">No credit card required to check</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
