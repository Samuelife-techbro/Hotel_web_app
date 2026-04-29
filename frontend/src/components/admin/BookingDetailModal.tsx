import React from 'react';
import {
  X, User, Mail, Phone, CalendarDays, Users, MessageSquare,
  Hash, BedDouble, DollarSign, Clock
} from 'lucide-react';
import type { Booking } from '../../types';
import { formatDate, formatDateTime, formatCurrency } from '../../utils';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  checked_in: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  checked_out: 'bg-stone-50 text-stone-600 border-stone-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
}

function InfoRow({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: string | number | React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-stone-50 last:border-0">
      <div className="w-8 h-8 bg-stone-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-charcoal-500" />
      </div>
      <div className="flex-1">
        <p className="font-sans text-xs text-charcoal-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="font-sans text-sm text-charcoal-800">{value}</p>
      </div>
    </div>
  );
}

export default function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  const nights = booking.duration_nights;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/60 p-4">
      <div
        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-charcoal-950">
          <div>
            <p className="font-sans text-xs text-white/50 uppercase tracking-widest mb-0.5">
              Booking Reference
            </p>
            <h2 className="font-display text-xl text-gold-400 tracking-widest">
              {booking.booking_reference}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-sans font-medium border ${STATUS_STYLES[booking.status] || ''}`}>
              {booking.status.replace('_', ' ')}
            </span>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Room info */}
        {booking.room_details && (
          <div className="px-6 py-4 bg-stone-50 border-b border-stone-100 flex items-center gap-4">
            <div className="w-16 h-16 overflow-hidden flex-shrink-0">
              <img
                src={
                  booking.room_details.display_image ||
                  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=120'
                }
                alt={booking.room_details.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-sans text-xs text-charcoal-400 uppercase tracking-wider">
                  {booking.room_details.category}
                </span>
              </div>
              <p className="font-display text-base text-charcoal-950 truncate">
                {booking.room_details.name}
              </p>
              <p className="font-sans text-xs text-charcoal-500">
                Room #{booking.room_details.room_number} · Floor {booking.room_details.floor}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-lg text-charcoal-950">
                {formatCurrency(booking.room_details.price_per_night)}
              </p>
              <p className="font-sans text-xs text-charcoal-400">per night</p>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="px-6 py-2">
          <p className="font-sans text-xs text-charcoal-400 uppercase tracking-wider mb-1 mt-3">
            Guest Information
          </p>
          <InfoRow icon={User} label="Full Name" value={booking.guest_name} />
          <InfoRow icon={Mail} label="Email" value={booking.guest_email} />
          {booking.guest_phone && (
            <InfoRow icon={Phone} label="Phone" value={booking.guest_phone} />
          )}
          <InfoRow icon={Users} label="Number of Guests" value={`${booking.num_guests} guest${booking.num_guests > 1 ? 's' : ''}`} />

          <p className="font-sans text-xs text-charcoal-400 uppercase tracking-wider mb-1 mt-4">
            Stay Details
          </p>
          <InfoRow
            icon={CalendarDays}
            label="Check In"
            value={formatDate(booking.check_in)}
          />
          <InfoRow
            icon={CalendarDays}
            label="Check Out"
            value={formatDate(booking.check_out)}
          />
          <InfoRow
            icon={BedDouble}
            label="Duration"
            value={`${nights} night${nights !== 1 ? 's' : ''}`}
          />

          {booking.special_requests && (
            <>
              <p className="font-sans text-xs text-charcoal-400 uppercase tracking-wider mb-1 mt-4">
                Special Requests
              </p>
              <InfoRow
                icon={MessageSquare}
                label="Requests"
                value={booking.special_requests}
              />
            </>
          )}

          <p className="font-sans text-xs text-charcoal-400 uppercase tracking-wider mb-1 mt-4">
            Billing
          </p>
          <div className="bg-stone-50 border border-stone-100 p-4 mb-4">
            <div className="flex justify-between font-sans text-sm text-charcoal-600 mb-2">
              <span>
                {formatCurrency(booking.room_details?.price_per_night || 0)} × {nights} night{nights !== 1 ? 's' : ''}
              </span>
              <span>{formatCurrency(booking.total_price)}</span>
            </div>
            <div className="flex justify-between font-sans text-base font-semibold text-charcoal-950 pt-2 border-t border-stone-200">
              <span>Total</span>
              <span className="font-display text-xl">{formatCurrency(booking.total_price)}</span>
            </div>
          </div>

          <div className="pb-4">
            <InfoRow
              icon={Clock}
              label="Booking Created"
              value={formatDateTime(booking.created_at)}
            />
            {booking.updated_at !== booking.created_at && (
              <InfoRow
                icon={Clock}
                label="Last Updated"
                value={formatDateTime(booking.updated_at)}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex justify-end">
          <button onClick={onClose} className="btn-outline py-2">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
