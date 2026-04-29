import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const transparent = isHome && !scrolled && !menuOpen;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      transparent ? 'bg-transparent' : 'bg-white border-b border-stone-100 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <span className={`font-display text-2xl font-semibold tracking-tight transition-colors ${
              transparent ? 'text-white' : 'text-charcoal-950'
            }`}>
              Lumière
            </span>
            <span className={`font-sans text-xs tracking-[0.2em] uppercase transition-colors ${
              transparent ? 'text-white/60' : 'text-charcoal-400'
            }`}>
              Hotel
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {[['/', 'Home'], ['/rooms', 'Rooms'], ['/#amenities', 'Amenities'], ['/#contact', 'Contact']].map(([href, label]) => (
              <Link
                key={href}
                to={href}
                className={`font-sans text-sm tracking-wide transition-colors hover:opacity-70 ${
                  transparent ? 'text-white' : 'text-charcoal-700'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/rooms"
              className={`font-sans text-sm font-medium px-5 py-2.5 tracking-wide transition-colors ${
                transparent
                  ? 'border border-white/60 text-white hover:bg-white hover:text-charcoal-950'
                  : 'bg-charcoal-950 text-white hover:bg-charcoal-800'
              }`}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden transition-colors ${transparent ? 'text-white' : 'text-charcoal-900'}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 py-4 animate-slide-up">
            {[['/', 'Home'], ['/rooms', 'Rooms & Suites']].map(([href, label]) => (
              <Link
                key={href}
                to={href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 font-sans text-sm text-charcoal-700 hover:bg-stone-50"
              >
                {label}
              </Link>
            ))}
            <div className="px-4 pt-3">
              <Link to="/rooms" onClick={() => setMenuOpen(false)} className="block btn-primary text-center">
                Book Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
