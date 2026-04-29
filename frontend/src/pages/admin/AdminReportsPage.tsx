import React, { useEffect, useState } from 'react';
import { Download, BarChart2, TrendingUp, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { bookingsApi, inventoryApi } from '../../services/api';
import type { BookingStats } from '../../types';
import toast from 'react-hot-toast';

const COLORS = ['#f0b429', '#3b82f6', '#10b981', '#6b7280', '#ef4444'];

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    bookingsApi.stats(period)
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, [period]);

  const exportBookings = async () => {
    try {
      const res = await bookingsApi.exportCSV(period);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `bookings_${period}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Bookings CSV downloaded');
    } catch { toast.error('Export failed'); }
  };

  const exportInventory = async () => {
    try {
      const res = await inventoryApi.exportCSV();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'inventory.csv'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Inventory CSV downloaded');
    } catch { toast.error('Export failed'); }
  };

  const totalRevenue = stats?.revenue_trend?.reduce((sum, d) => sum + d.revenue, 0) || 0;
  const totalBookingsInPeriod = stats?.by_status?.reduce((sum, d) => sum + d.count, 0) || 0;

  return (
    <div className="p-6 lg:p-8 max-w-screen-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-charcoal-950">Reports</h1>
          <p className="font-sans text-sm text-charcoal-500 mt-1">Analytics and data exports</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportBookings} className="btn-outline flex items-center gap-2 py-2">
            <Download size={14} /> Bookings CSV
          </button>
          <button onClick={exportInventory} className="btn-outline flex items-center gap-2 py-2">
            <Download size={14} /> Inventory CSV
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-8">
        {(['daily', 'weekly', 'monthly'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`font-sans text-sm px-5 py-2.5 capitalize transition-colors ${
              period === p ? 'bg-charcoal-950 text-white' : 'bg-white border border-stone-200 text-charcoal-600 hover:border-charcoal-400'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-stone-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign size={16} className="text-gold-500" />
            <span className="font-sans text-xs text-charcoal-500 uppercase tracking-wider">Period Revenue</span>
          </div>
          <p className="font-display text-3xl text-charcoal-950">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-stone-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <BarChart2 size={16} className="text-blue-500" />
            <span className="font-sans text-xs text-charcoal-500 uppercase tracking-wider">Period Bookings</span>
          </div>
          <p className="font-display text-3xl text-charcoal-950">{totalBookingsInPeriod}</p>
        </div>
        <div className="bg-white border border-stone-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="font-sans text-xs text-charcoal-500 uppercase tracking-wider">Avg per Booking</span>
          </div>
          <p className="font-display text-3xl text-charcoal-950">
            ${totalBookingsInPeriod > 0 ? (totalRevenue / totalBookingsInPeriod).toFixed(0) : '0'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-72 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue trend */}
          <div className="lg:col-span-2 bg-white border border-stone-100 p-6">
            <h3 className="font-display text-lg text-charcoal-950 mb-5">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats?.revenue_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
                <Tooltip
                  contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, border: '1px solid #e5e5e5' }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#f0b429" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bookings by status */}
          <div className="bg-white border border-stone-100 p-6">
            <h3 className="font-display text-lg text-charcoal-950 mb-5">Bookings by Status</h3>
            {stats?.by_status && stats.by_status.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.by_status}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, count }) => `${status.replace('_', ' ')}: ${count}`}
                    labelLine={false}
                  >
                    {stats.by_status.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 12 }}
                    formatter={(value: any, name: string) => [value as React.ReactNode, name.replace('_', ' ')]} />
                  <Legend formatter={(v: string) => v.replace('_', ' ')} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-charcoal-300 font-sans text-sm">No data</div>
            )}
          </div>

          {/* Revenue by room type */}
          <div className="bg-white border border-stone-100 p-6">
            <h3 className="font-display text-lg text-charcoal-950 mb-5">Revenue by Room Type</h3>
            {stats?.by_room_type && stats.by_room_type.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.by_room_type}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="room__category" tick={{ fontSize: 11, fontFamily: 'DM Sans' }}
                    tickFormatter={s => s.charAt(0).toUpperCase() + s.slice(1)} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
                  <Tooltip
                    contentStyle={{ fontFamily: 'DM Sans', fontSize: 12 }}
                    formatter={(v: number) => [`$${Number(v).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" radius={[2, 2, 0, 0]}>
                    {stats.by_room_type.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-charcoal-300 font-sans text-sm">No data</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
