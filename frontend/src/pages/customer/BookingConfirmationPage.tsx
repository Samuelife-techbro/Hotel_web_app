import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Users, Home, ArrowRight } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import { bookingsApi } from '../../services/api';
import type { Booking } from '../../types';

export default function BookingConfirmationPage() {
  const { reference } = useParams<{ reference: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsApi.list({ search: reference || '' })
      .then(res => {
        const results = res.data.results || res.data;
        const found = results.find((b: Booking) => b.booking_reference === reference);
        setBooking(found || null);
      })
      .finally(() => setLoading(false));
  }, [reference]);

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-20 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center animate-slide-up">
          {/* Success icon */}
          <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-emerald-500" />
          </div>

          <h1 className="font-display text-4xl text-charcoal-950 mb-3">Booking Confirmed!</h1>
          <p className="font-sans text-charcoal-500 mb-8">
            Your reservation has been successfully made. A confirmation will be sent to your email.
          </p>

          {/* Reference box */}
          <div className="bg-charcoal-950 text-white p-6 mb-8">
            <p className="font-sans text-xs text-white/50 uppercase tracking-widest mb-2">Booking Reference</p>
            <p className="font-display text-3xl text-gold-400 tracking-widest">{reference}</p>
          </div>

          {/* Booking details */}
          {booking && (
            <div className="bg-white border border-stone-200 p-6 mb-8 text-left space-y-4">
              <div className="flex items-start gap-3">
                <Home size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-sans text-xs text-charcoal-400 uppercase tracking-wide mb-0.5">Room</p>
                  <p className="font-sans text-sm font-medium text-charcoal-800">
                    {booking.room_details?.name} — Room {booking.room_details?.room_number}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-sans text-xs text-charcoal-400 uppercase tracking-wide mb-0.5">Dates</p>
                  <p className="font-sans text-sm font-medium text-charcoal-800">
                    {booking.check_in} → {booking.check_out}
                    <span className="font-normal text-charcoal-500 ml-2">({booking.duration_nights} nights)</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-sans text-xs text-charcoal-400 uppercase tracking-wide mb-0.5">Guest</p>
                  <p className="font-sans text-sm font-medium text-charcoal-800">
                    {booking.guest_name}
                    <span className="font-normal text-charcoal-500 ml-2">({booking.num_guests} guest{booking.num_guests > 1 ? 's' : ''})</span>
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                <span className="font-sans text-sm text-charcoal-600">Total Amount</span>
                <span className="font-display text-xl text-charcoal-950">${booking.total_price}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary inline-flex items-center justify-center gap-2">
              <Home size={14} /> Return Home
            </Link>
            <Link to="/rooms" className="btn-outline inline-flex items-center justify-center gap-2">
              Browse More Rooms <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
