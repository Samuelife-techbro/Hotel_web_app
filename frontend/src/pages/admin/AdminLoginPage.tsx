import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { toast.error('Please enter credentials'); return; }
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch {
      toast.error('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=90"
          alt="Hotel"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 flex flex-col justify-end p-16">
          <p className="font-sans text-gold-400 text-xs tracking-[0.3em] uppercase mb-4">
            Staff Portal
          </p>
          <h1 className="font-display text-5xl text-white mb-4">
            Lumière<br />Hotel
          </h1>
          <p className="font-sans text-white/50 text-base leading-relaxed max-w-xs">
            Manage bookings, rooms, and operations from your unified dashboard.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <h1 className="font-display text-3xl text-white mb-1">Lumière Hotel</h1>
            <p className="font-sans text-white/40 text-sm">Staff Portal</p>
          </div>

          <h2 className="font-display text-2xl text-white mb-2">Sign In</h2>
          <p className="font-sans text-white/40 text-sm mb-8">Enter your credentials to access the dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-sans text-xs text-white/50 uppercase tracking-wider mb-2">Username</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                className="w-full bg-white/10 border border-white/20 text-white font-sans text-sm px-4 py-3 focus:outline-none focus:border-gold-400 transition-colors placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-white/50 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/10 border border-white/20 text-white font-sans text-sm px-4 py-3 pr-12 focus:outline-none focus:border-gold-400 transition-colors placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 text-charcoal-950 font-sans font-medium text-sm py-3.5 hover:bg-gold-400 transition-colors mt-2 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 border border-white/10 bg-white/5">
            <p className="font-sans text-xs text-white/40 mb-1">Demo credentials</p>
            <p className="font-mono text-xs text-white/60">admin / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
