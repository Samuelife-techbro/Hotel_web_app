import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, BedDouble, Package,
  Bell, BarChart3, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/admin/rooms', icon: BedDouble, label: 'Rooms' },
  { to: '/admin/inventory', icon: Package, label: 'Inventory' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications', badge: true },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-charcoal-950 ${mobile ? 'w-full' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <h1 className="font-display text-xl text-white">Lumière</h1>
          <p className="font-sans text-xs text-white/40 tracking-widest uppercase">Admin</p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 font-sans text-sm transition-colors group relative ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gold-400" />}
                <Icon size={16} className={isActive ? 'text-gold-400' : ''} />
                <span className="flex-1">{label}</span>
                {badge && unreadCount > 0 && (
                  <span className="bg-gold-500 text-charcoal-950 text-xs font-bold font-sans w-5 h-5 flex items-center justify-center rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                <ChevronRight size={12} className={`opacity-0 group-hover:opacity-40 transition-opacity ${isActive ? 'opacity-40' : ''}`} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gold-500 flex items-center justify-center flex-shrink-0">
            <span className="font-sans text-xs font-bold text-charcoal-950">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm text-white truncate">{user?.username}</p>
            <p className="font-sans text-xs text-white/40 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 font-sans text-xs text-white/50 hover:text-white/80 transition-colors py-1.5 px-2"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 flex-shrink-0 animate-slide-in">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-charcoal-950/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-100">
          <button onClick={() => setSidebarOpen(true)} className="text-charcoal-700">
            <Menu size={20} />
          </button>
          <span className="font-display text-lg text-charcoal-950">Lumière Admin</span>
          <div className="relative">
            <Bell size={20} className="text-charcoal-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold-500 text-charcoal-950 text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full text-[10px]">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
