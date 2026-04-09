import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { label: 'בית', href: '/' },
  { label: 'על החדר', href: '/#about' },
  { label: 'גלריה', href: '/#gallery' },
  { label: 'חוגים', href: '/#studios' },
  { label: 'מנויים', href: '/#plans' },
  { label: 'שעות פתיחה', href: '/#hours' },
  { label: 'עדכונים', href: '/#updates' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  function handleLogout() {
    logout();
    toast.success('התנתקת בהצלחה');
    navigate('/');
  }

  function handleNavLink(href: string) {
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  }

  return (
    <motion.nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-md border-b border-[#2a2a2a]' : 'bg-transparent'
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="GYMNET" className="h-10 w-auto" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }} />
            <span className="text-2xl font-black" style={{ fontFamily: 'Oswald, sans-serif' }}>
              GYM<span style={{ color: '#39FF14' }}>NET</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                onClick={() => handleNavLink(link.href)}
                className="text-gray-300 hover:text-[#39FF14] transition-colors font-medium text-sm tracking-wide"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-[#39FF14] text-sm font-semibold hover:underline"
                  >
                    פאנל ניהול
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  שלום, {user?.firstName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-[#2a2a2a] text-white text-sm rounded hover:border-[#39FF14] hover:text-[#39FF14] transition-all"
                >
                  התנתק
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-white text-sm font-medium hover:text-[#39FF14] transition-colors"
                >
                  התחברות
                </Link>
                <Link
                  to="/register"
                  className="neon-btn px-5 py-2 text-sm rounded font-bold"
                >
                  הצטרף עכשיו
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="תפריט"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/98 border-t border-[#2a2a2a] overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {NAV_LINKS.map(link => (
                <button
                  key={link.href}
                  onClick={() => handleNavLink(link.href)}
                  className="text-right text-gray-300 hover:text-[#39FF14] font-medium py-1 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <hr className="border-[#2a2a2a]" />
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="text-[#39FF14] font-semibold">פאנל ניהול</Link>
                  )}
                  <Link to="/dashboard" className="text-gray-300 font-medium">
                    שלום, {user?.firstName}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-right text-red-400 font-medium"
                  >
                    התנתק
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-white font-medium">התחברות</Link>
                  <Link
                    to="/register"
                    className="neon-btn px-5 py-2 text-sm rounded font-bold text-center"
                  >
                    הצטרף עכשיו
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
