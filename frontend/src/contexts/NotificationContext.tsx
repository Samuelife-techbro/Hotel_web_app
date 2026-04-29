import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { notificationsApi } from '../services/api';
import type { Notification } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data.results || res.data);
      const countRes = await notificationsApi.unreadCount();
      setUnreadCount(countRes.data.count);
    } catch { /* silent */ }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();

    // WebSocket for real-time notifications
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`ws://${window.location.host}/ws/notifications/`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'booking_notification') {
          const booking = data.data;
          toast.success(
            `New booking! ${booking.guest_name} — Room ${booking.room_number}`,
            { duration: 6000, icon: '🏨' }
          );
          fetchNotifications();
        }
      };
      ws.onerror = () => { /* silent fallback */ };
    } catch { /* no WS support */ }

    return () => { ws?.close(); };
  }, [isAuthenticated, fetchNotifications]);

  const markRead = async (id: number) => {
    await notificationsApi.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
