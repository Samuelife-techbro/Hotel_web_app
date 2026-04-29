import React, { useEffect, useState, useCallback } from 'react';
import { Search, Download, ChevronDown, Eye } from 'lucide-react';
import { bookingsApi } from '../../services/api';
import type { Booking, BookingStatus } from '../../types';
import toast from 'react-hot-toast';
import BookingDetailModal from '../../components/admin/BookingDetailModal';

const STATUS_OPTIONS: BookingStatus[] = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];
const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  checked_in: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  checked_out: 'bg-stone-50 text-stone-600 border-stone-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-sans font-medium border ${STATUS_STYLES[status] || ''}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function StatusDropdown({ booking, onUpdate }: { booking: Booking; onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const change = async (status: BookingStatus) => {
    setOpen(false);
    setLoading(true);
    try {
      await bookingsApi.updateStatus(booking.id, status);
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      onUpdate();
    } catch { toast.error('Failed to update status'); }
    setLoading(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1 text-xs"
      >
        <StatusBadge status={booking.status} />
        <ChevronDown size={10} className="text-charcoal-400" />
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-stone-200 shadow-lg min-w-[140px]">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => change(s)}
              className={`block w-full text-left px-3 py-2 font-sans text-xs hover:bg-stone-50 transition-colors ${
                s === booking.status ? 'text-charcoal-950 font-medium' : 'text-charcoal-600'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [exportFilter, setExportFilter] = useState('monthly');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await bookingsApi.list(params);
      setBookings(res.data.results || res.data);
    } catch { setBookings([]); }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleExport = async () => {
    try {
      const res = await bookingsApi.exportCSV(exportFilter);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `bookings_${exportFilter}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch { toast.error('Export failed'); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-screen-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-charcoal-950">Bookings</h1>
          <p className="font-sans text-sm text-charcoal-500 mt-1">{bookings.length} total bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={exportFilter}
            onChange={e => setExportFilter(e.target.value)}
            className="border border-stone-200 font-sans text-sm px-3 py-2 bg-white focus:outline-none focus:border-charcoal-950"
          >
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="all">All Time</option>
          </select>
          <button onClick={handleExport} className="btn-outline flex items-center gap-2 py-2">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, reference..."
            className="pl-9 pr-4 py-2.5 border border-stone-200 font-sans text-sm bg-white w-full focus:outline-none focus:border-charcoal-950"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`font-sans text-xs px-3 py-2 border transition-colors ${
                statusFilter === s
                  ? 'bg-charcoal-950 text-white border-charcoal-950'
                  : 'bg-white text-charcoal-600 border-stone-200 hover:border-charcoal-400'
              }`}
            >
              {s ? s.replace('_', ' ') : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                {['Reference', 'Guest', 'Room', 'Dates', 'Guests', 'Total', 'Status', 'Booked', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-xs text-charcoal-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-stone-50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 skeleton" /></td>
                    ))}
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center font-sans text-sm text-charcoal-400">No bookings found</td></tr>
              ) : bookings.map(b => (
                <tr key={b.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-charcoal-700 whitespace-nowrap">{b.booking_reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-sans text-sm text-charcoal-800 whitespace-nowrap">{b.guest_name}</p>
                    <p className="font-sans text-xs text-charcoal-400">{b.guest_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-sans text-sm text-charcoal-700 whitespace-nowrap">{b.room_details?.name}</p>
                    <p className="font-sans text-xs text-charcoal-400">#{b.room_details?.room_number}</p>
                  </td>
                  <td className="px-4 py-3 font-sans text-xs text-charcoal-600 whitespace-nowrap">
                    {b.check_in} → {b.check_out}
                    <p className="text-charcoal-400">{b.duration_nights} night{b.duration_nights !== 1 ? 's' : ''}</p>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-charcoal-600 text-center">{b.num_guests}</td>
                  <td className="px-4 py-3 font-sans text-sm font-medium text-charcoal-800 whitespace-nowrap">${b.total_price}</td>
                  <td className="px-4 py-3">
                    <StatusDropdown booking={b} onUpdate={fetchBookings} />
                  </td>
                  <td className="px-4 py-3 font-sans text-xs text-charcoal-400 whitespace-nowrap">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="text-charcoal-300 hover:text-charcoal-700 transition-colors"
                      title="View details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
