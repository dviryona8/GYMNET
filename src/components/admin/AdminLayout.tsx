import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/admin', label: 'דשבורד', icon: '📊', end: true },
  { path: '/admin/members', label: 'ניהול מנויים', icon: '👥', end: false },
  { path: '/admin/updates', label: 'ניהול עדכונים', icon: '📢', end: false },
  { path: '/admin/hours', label: 'שעות פתיחה', icon: '⏰', end: false },
  { path: '/admin/pricing', label: 'מחירים', icon: '💰', end: false },
  { path: '/admin/settings', label: 'הגדרות', icon: '⚙️', end: false },
];

export default function AdminLayout() {
  const { logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAdmin) {
    navigate('/login');
    return null;
  }

  function handleLogout() {
    logout();
    toast.success('התנתקת בהצלחה');
    navigate('/');
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30'
        : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
    }`;

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-6 border-b border-[#2a2a2a]">
        <span className="text-2xl font-black" style={{ fontFamily: 'Oswald, sans-serif' }}>
          GYM<span style={{ color: '#39FF14' }}>NET</span>
        </span>
        <p className="text-gray-500 text-xs mt-1">פאנל ניהול</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#39FF14]/10 text-[#39FF14]">
            {user?.firstName[0]}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-gray-500 text-xs">מנהל מערכת</p>
          </div>
        </div>
        <NavLink to="/" className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs text-gray-500 hover:text-white transition-colors mb-1">
          ← חזור לאתר
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-all"
        >
          🚪 התנתק
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-[#111111] border-l border-[#2a2a2a] flex-col">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/70 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed right-0 top-0 h-full w-72 bg-[#111111] border-l border-[#2a2a2a] z-50 flex flex-col"
            >
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 bg-[#111111] border-b border-[#2a2a2a] flex-shrink-0">
          <span className="text-xl font-black" style={{ fontFamily: 'Oswald, sans-serif' }}>
            GYM<span style={{ color: '#39FF14' }}>NET</span>
          </span>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="p-2 text-white"
            aria-label="תפריט"
          >
            <div className="w-5 flex flex-col gap-1">
              <span className="block h-0.5 bg-current" />
              <span className="block h-0.5 bg-current" />
              <span className="block h-0.5 bg-current" />
            </div>
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
