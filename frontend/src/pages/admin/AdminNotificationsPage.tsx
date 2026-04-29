import React, { useEffect } from 'react';
import { Bell, BookOpen, AlertTriangle, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS: Record<string, React.ElementType> = {
  new_booking: Bell,
  booking_cancelled: BookOpen,
  low_stock: AlertTriangle,
  system: Bell,
};
const TYPE_COLORS: Record<string, string> = {
  new_booking: 'text-blue-500 bg-blue-50',
  booking_cancelled: 'text-red-500 bg-red-50',
  low_stock: 'text-amber-500 bg-amber-50',
  system: 'text-charcoal-500 bg-stone-100',
};

export default function AdminNotificationsPage() {
  const { notifications, markRead, markAllRead, fetchNotifications } = useNotifications();

  useEffect(() => { fetchNotifications(); }, []);

  return (
    <div className="p-6 lg:p-8 max-w-screen-lg">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-charcoal-950">Notifications</h1>
          <p className="font-sans text-sm text-charcoal-500 mt-1">{notifications.length} notifications</p>
        </div>
        <button onClick={markAllRead} className="btn-outline flex items-center gap-2 py-2">
          <CheckCheck size={14} /> Mark All Read
        </button>
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={40} className="text-charcoal-200 mx-auto mb-3" />
            <p className="font-display text-2xl text-charcoal-300 mb-1">All caught up!</p>
            <p className="font-sans text-sm text-charcoal-400">No notifications yet.</p>
          </div>
        ) : notifications.map(n => {
          const Icon = TYPE_ICONS[n.notification_type] || Bell;
          const colorClass = TYPE_COLORS[n.notification_type] || TYPE_COLORS.system;
          return (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className={`flex items-start gap-4 p-4 border transition-colors cursor-pointer ${
                n.is_read
                  ? 'bg-white border-stone-100 opacity-60 hover:opacity-80'
                  : 'bg-white border-stone-200 hover:border-charcoal-300'
              }`}
            >
              <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-sans text-sm font-medium text-charcoal-800">{n.title}</p>
                  {!n.is_read && (
                    <span className="w-2 h-2 bg-gold-500 rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="font-sans text-sm text-charcoal-500 leading-relaxed">{n.message}</p>
                <p className="font-sans text-xs text-charcoal-400 mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
              {!n.is_read && (
                <span className="font-sans text-xs text-charcoal-400 hover:text-charcoal-700 mt-0.5 flex-shrink-0">
                  Mark read
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
