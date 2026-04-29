import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, CalendarDays } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import { roomsApi, bookingsApi } from '../../services/api';
import type { Room, BookingCreate } from '../../types';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState<BookingCreate>({
    room: parseInt(id || '0'),
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: params.get('check_in') || '',
    check_out: params.get('check_out') || '',
    num_guests: 1,
    special_requests: '',
  });

  useEffect(() => {
    if (!id) return;
    roomsApi.get(parseInt(id))
      .then(res => setRoom(res.data))
      .catch(() => navigate('/rooms'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const nights = form.check_in && form.check_out
    ? Math.max(0, Math.floor((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / 86400000))
    : 0;

  const total = room ? (parseFloat(room.price_per_night) * nights).toFixed(2) : '0.00';

  const update = (field: keyof BookingCreate, value: string | number) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.guest_name.trim()) errs.guest_name = 'Name is required';
    if (!form.guest_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.guest_email = 'Valid email required';
    if (!form.check_in) errs.check_in = 'Check-in date required';
    if (!form.check_out) errs.check_out = 'Check-out date required';
    if (nights <= 0) errs.check_out = 'Check-out must be after check-in';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const res = await bookingsApi.create(form as unknown as Record<string, unknown>);
      toast.success('Booking confirmed!');
      navigate(`/booking-confirmation/${res.data.booking_reference}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      if (axiosErr.response?.data) {
        const apiErrs: Record<string, string> = {};
        Object.entries(axiosErr.response.data).forEach(([k, v]) => {
          apiErrs[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setErrors(apiErrs);
        toast.error('Please fix the errors below.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!room) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-6 lg:px-12 py-12">
        <Link to={`/rooms/${room.id}`} className="inline-flex items-center gap-2 font-sans text-sm text-charcoal-500 hover:text-charcoal-950 mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to room
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <h1 className="font-display text-3xl text-charcoal-950 mb-2">Complete Your Booking</h1>
            <p className="font-sans text-charcoal-500 text-sm mb-8">Fill in your details to reserve {room.name}.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input value={form.guest_name} onChange={e => update('guest_name', e.target.value)}
                  placeholder="Your full name" className={`input-field ${errors.guest_name ? 'border-red-400' : ''}`} />
                {errors.guest_name && <p className="font-sans text-xs text-red-500 mt-1">{errors.guest_name}</p>}
              </div>
              <div>
                <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                <input type="email" value={form.guest_email} onChange={e => update('guest_email', e.target.value)}
                  placeholder="you@example.com" className={`input-field ${errors.guest_email ? 'border-red-400' : ''}`} />
                {errors.guest_email && <p className="font-sans text-xs text-red-500 mt-1">{errors.guest_email}</p>}
              </div>
              <div>
                <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input value={form.guest_phone} onChange={e => update('guest_phone', e.target.value)}
                  placeholder="+1 (555) 000-0000" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Check In *</label>
                  <input type="date" value={form.check_in} min={today}
                    onChange={e => update('check_in', e.target.value)}
                    className={`input-field ${errors.check_in ? 'border-red-400' : ''}`} />
                  {errors.check_in && <p className="font-sans text-xs text-red-500 mt-1">{errors.check_in}</p>}
                </div>
                <div>
                  <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Check Out *</label>
                  <input type="date" value={form.check_out} min={form.check_in || today}
                    onChange={e => update('check_out', e.target.value)}
                    className={`input-field ${errors.check_out ? 'border-red-400' : ''}`} />
                  {errors.check_out && <p className="font-sans text-xs text-red-500 mt-1">{errors.check_out}</p>}
                </div>
              </div>
              <div>
                <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">
                  Number of Guests (max {room.capacity})
                </label>
                <select value={form.num_guests} onChange={e => update('num_guests', parseInt(e.target.value))}
                  className="input-field bg-white">
                  {Array.from({ length: room.capacity }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Special Requests</label>
                <textarea value={form.special_requests}
                  onChange={e => update('special_requests', e.target.value)}
                  rows={3} placeholder="Any special requests or notes..."
                  className="input-field resize-none" />
              </div>
              {errors.room && (
                <div className="bg-red-50 border border-red-200 p-3 font-sans text-sm text-red-600">{errors.room}</div>
              )}
              <button type="submit" disabled={submitting || nights === 0} className="btn-gold w-full flex items-center justify-center gap-2 text-base py-4">
                {submitting ? 'Processing...' : `Confirm Booking · $${total}`}
              </button>
              <p className="font-sans text-xs text-charcoal-400 text-center">
                No payment required now. Your booking will be confirmed instantly.
              </p>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-stone-200 overflow-hidden sticky top-24">
              <img
                src={room.display_image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'}
                alt={room.name} className="w-full h-40 object-cover"
              />
              <div className="p-5">
                <span className="font-sans text-xs tracking-widest uppercase text-charcoal-400">{room.category}</span>
                <h3 className="font-display text-xl text-charcoal-950 mt-1 mb-1">{room.name}</h3>
                <p className="font-sans text-xs text-charcoal-500 mb-4">Room {room.room_number} · Floor {room.floor}</p>

                <div className="space-y-2.5 text-sm font-sans border-t border-stone-100 pt-4">
                  {form.check_in && (
                    <div className="flex items-center justify-between text-charcoal-600">
                      <span className="flex items-center gap-1.5"><CalendarDays size={13} /> Check In</span>
                      <span className="font-medium">{form.check_in}</span>
                    </div>
                  )}
                  {form.check_out && (
                    <div className="flex items-center justify-between text-charcoal-600">
                      <span className="flex items-center gap-1.5"><CalendarDays size={13} /> Check Out</span>
                      <span className="font-medium">{form.check_out}</span>
                    </div>
                  )}
                  {nights > 0 && (
                    <div className="flex items-center justify-between text-charcoal-600">
                      <span className="flex items-center gap-1.5"><Users size={13} /> Duration</span>
                      <span className="font-medium">{nights} night{nights > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {nights > 0 && (
                  <div className="border-t border-stone-100 mt-4 pt-4 space-y-2">
                    <div className="flex justify-between font-sans text-sm text-charcoal-600">
                      <span>${room.price_per_night} × {nights} nights</span>
                      <span>${total}</span>
                    </div>
                    <div className="flex justify-between font-sans text-base font-semibold text-charcoal-950 pt-1">
                      <span>Total</span>
                      <span>${total}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
