import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, BedDouble, CalendarCheck, DollarSign,
  Clock, Users, ArrowRight, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { dashboardApi, bookingsApi } from '../../services/api';
import type { DashboardStats, BookingStats } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  checked_in: '#10b981',
  checked_out: '#6b7280',
  cancelled: '#ef4444',
};

function StatCard({ icon: Icon, label, value, sub, color = 'gold' }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    gold: 'text-gold-500 bg-gold-50',
    green: 'text-emerald-500 bg-emerald-50',
    blue: 'text-blue-500 bg-blue-50',
    purple: 'text-purple-500 bg-purple-50',
  };
  return (
    <div className="bg-white border border-stone-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="font-display text-3xl text-charcoal-950 mb-1">{value}</p>
      <p className="font-sans text-sm text-charcoal-500">{label}</p>
      {sub && <p className="font-sans text-xs text-charcoal-400 mt-1">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    checked_in: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    checked_out: 'bg-stone-50 text-stone-600 border-stone-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-sans font-medium border ${styles[status] || 'bg-stone-50 text-stone-600 border-stone-200'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      bookingsApi.stats('monthly'),
    ]).then(([s, bs]) => {
      setStats(s.data);
      setBookingStats(bs.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 space-y-6">
      <div className="h-8 skeleton w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 skeleton" />)}
      </div>
    </div>
  );

  if (!stats) return null;

  return (
    <div className="p-6 lg:p-8 max-w-screen-xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-charcoal-950">Dashboard</h1>
        <p className="font-sans text-sm text-charcoal-500 mt-1">Overview of your hotel's performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.total_revenue.toLocaleString()}`}
          sub={`$${stats.monthly_revenue.toLocaleString()} this month`} color="gold" />
        <StatCard icon={CalendarCheck} label="Total Bookings" value={stats.total_bookings}
          sub={`${stats.pending_bookings} pending`} color="blue" />
        <StatCard icon={BedDouble} label="Available Rooms" value={`${stats.available_rooms}/${stats.total_rooms}`}
          sub={`${stats.occupancy_rate}% occupied`} color="green" />
        <StatCard icon={TrendingUp} label="Active Bookings" value={stats.active_bookings}
          sub="Currently checked in" color="purple" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue trend */}
        <div className="lg:col-span-2 bg-white border border-stone-100 p-6">
          <h3 className="font-display text-lg text-charcoal-950 mb-5">Revenue Trend</h3>
          {bookingStats?.revenue_trend && bookingStats.revenue_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={bookingStats.revenue_trend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f0b429" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f0b429" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
                <Tooltip
                  contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, border: '1px solid #e5e5e5' }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f0b429" strokeWidth={2}
                  fill="url(#revGrad)" dot={{ fill: '#f0b429', strokeWidth: 0, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-charcoal-300 font-sans text-sm">
              No data yet
            </div>
          )}
        </div>

        {/* Bookings by status */}
        <div className="bg-white border border-stone-100 p-6">
          <h3 className="font-display text-lg text-charcoal-950 mb-5">By Status</h3>
          {bookingStats?.by_status && bookingStats.by_status.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={bookingStats.by_status} layout="vertical" barSize={12}>
                  <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'DM Sans' }} />
                  <YAxis type="category" dataKey="status" tick={{ fontSize: 10, fontFamily: 'DM Sans' }}
                    width={75} tickFormatter={s => s.replace('_', ' ')} />
                  <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 12 }} />
                  <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                    {bookingStats.by_status.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {bookingStats.by_status.map(({ status, count }) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
                      <span className="font-sans text-xs text-charcoal-600 capitalize">{status.replace('_', ' ')}</span>
                    </div>
                    <span className="font-sans text-xs font-medium text-charcoal-800">{count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-charcoal-300 font-sans text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white border border-stone-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h3 className="font-display text-lg text-charcoal-950">Recent Bookings</h3>
          <Link to="/admin/bookings" className="font-sans text-xs text-charcoal-500 hover:text-charcoal-950 flex items-center gap-1 transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                {['Reference', 'Guest', 'Room', 'Check In', 'Check Out', 'Total', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-xs text-charcoal-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recent_bookings.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center font-sans text-sm text-charcoal-400">No bookings yet</td></tr>
              ) : stats.recent_bookings.map(b => (
                <tr key={b.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-charcoal-700">{b.booking_reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-sans text-sm text-charcoal-800">{b.guest_name}</p>
                    <p className="font-sans text-xs text-charcoal-400">{b.guest_email}</p>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-charcoal-600">{b.room_details?.room_number}</td>
                  <td className="px-4 py-3 font-sans text-sm text-charcoal-600">{b.check_in}</td>
                  <td className="px-4 py-3 font-sans text-sm text-charcoal-600">{b.check_out}</td>
                  <td className="px-4 py-3 font-sans text-sm font-medium text-charcoal-800">${b.total_price}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending alert */}
      {stats.pending_bookings > 0 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="font-sans text-sm text-amber-800">
            You have <strong>{stats.pending_bookings}</strong> pending booking{stats.pending_bookings > 1 ? 's' : ''} awaiting confirmation.
          </p>
          <Link to="/admin/bookings?status=pending" className="ml-auto font-sans text-xs text-amber-700 font-medium hover:underline flex items-center gap-1">
            Review <ArrowRight size={11} />
          </Link>
        </div>
      )}
    </div>
  );
}
