import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';

  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Already logged in — redirect
  if (isLoggedIn) {
    navigate(from, { replace: true });
    return null;
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'כתובת אימייל לא תקינה';
    if (!form.password) errs.password = 'שדה חובה';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const result = login(form.email, form.password);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      // Check if admin
      if (form.email.toLowerCase() === 'admin@gymnet.co.il') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } else {
      toast.error(result.message);
      setErrors({ general: result.message });
    }
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 bg-[#1a1a1a] border rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#39FF14] transition-colors ${
      errors[field] ? 'border-red-500' : 'border-[#2a2a2a]'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/">
            <span className="text-4xl font-black" style={{ fontFamily: 'Oswald, sans-serif' }}>
              GYM<span style={{ color: '#39FF14' }}>NET</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4 mb-1" style={{ fontFamily: 'Oswald, sans-serif' }}>
            התחברות לחשבון
          </h1>
          <p className="text-gray-400 text-sm">ברוך הבא בחזרה</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-[#2a2a2a]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                {errors.general}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">אימייל</label>
              <input
                type="email"
                placeholder="your@email.com"
                className={inputClass('email')}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                dir="ltr"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">סיסמה</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass('password')}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                dir="ltr"
                autoComplete="current-password"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                className="accent-[#39FF14]"
              />
              <span className="text-gray-400 text-sm">זכור אותי</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="neon-btn w-full py-3.5 rounded-xl font-black text-base disabled:opacity-60"
            >
              {loading ? 'מתחבר...' : 'התחברות'}
            </button>

            <p className="text-center text-gray-500 text-sm pt-2">
              עדיין לא חבר?{' '}
              <Link to="/register" className="text-[#39FF14] font-semibold hover:underline">
                הצטרף עכשיו
              </Link>
            </p>
          </form>
        </div>

        {/* Admin hint */}
        <div className="mt-4 p-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-gray-600 text-center">
          כניסת מנהל: admin@gymnet.co.il / Admin1234!
        </div>
      </motion.div>
    </div>
  );
}
