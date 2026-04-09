import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'שדה חובה';
    if (!form.lastName.trim()) errs.lastName = 'שדה חובה';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'כתובת אימייל לא תקינה';
    if (!form.phone.match(/^0\d{8,9}$/)) errs.phone = 'מספר טלפון לא תקין (לדוגמה: 0501234567)';
    if (!form.birthDate) errs.birthDate = 'שדה חובה';
    if (form.password.length < 8) errs.password = 'הסיסמה חייבת להכיל לפחות 8 תווים';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'הסיסמאות אינן תואמות';
    if (!form.agreed) errs.agreed = 'יש לאשר את התקנון';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const result = register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      birthDate: form.birthDate,
      password: form.password,
    });

    setLoading(false);
    if (result.success) {
      toast.success(result.message);
      navigate('/login');
    } else {
      toast.error(result.message);
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
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/">
            <span className="text-4xl font-black" style={{ fontFamily: 'Oswald, sans-serif' }}>
              GYM<span style={{ color: '#39FF14' }}>NET</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4 mb-1" style={{ fontFamily: 'Oswald, sans-serif' }}>
            הצטרפות לחדר הכושר
          </h1>
          <p className="text-gray-400 text-sm">מלא את הפרטים ותהיה חלק מהמשפחה</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-[#2a2a2a]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">שם פרטי *</label>
                <input
                  type="text"
                  placeholder="ישראל"
                  className={inputClass('firstName')}
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                />
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">שם משפחה *</label>
                <input
                  type="text"
                  placeholder="ישראלי"
                  className={inputClass('lastName')}
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                />
                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">אימייל *</label>
              <input
                type="email"
                placeholder="israel@example.com"
                className={inputClass('email')}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                dir="ltr"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">מספר טלפון *</label>
              <input
                type="tel"
                placeholder="0501234567"
                className={inputClass('phone')}
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                dir="ltr"
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Birth date */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">תאריך לידה *</label>
              <input
                type="date"
                className={`${inputClass('birthDate')} [color-scheme:dark]`}
                value={form.birthDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
              />
              {errors.birthDate && <p className="text-red-400 text-xs mt-1">{errors.birthDate}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">סיסמה *</label>
              <input
                type="password"
                placeholder="לפחות 8 תווים"
                className={inputClass('password')}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                dir="ltr"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">אישור סיסמה *</label>
              <input
                type="password"
                placeholder="חזור על הסיסמה"
                className={inputClass('confirmPassword')}
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                dir="ltr"
              />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={e => setForm(f => ({ ...f, agreed: e.target.checked }))}
                  className="mt-0.5 accent-[#39FF14]"
                />
                <span className="text-gray-400 text-sm leading-relaxed">
                  קראתי ואני מסכים/ה{' '}
                  <button type="button" className="text-[#39FF14] underline hover:no-underline">
                    לתקנון
                  </button>
                  {' '}ולמדיניות הפרטיות של GYMNET
                </span>
              </label>
              {errors.agreed && <p className="text-red-400 text-xs mt-1">{errors.agreed}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="neon-btn w-full py-3.5 rounded-xl font-black text-base mt-2 disabled:opacity-60"
            >
              {loading ? 'נרשם...' : 'הצטרפות'}
            </button>

            <p className="text-center text-gray-500 text-sm pt-2">
              כבר רשום?{' '}
              <Link to="/login" className="text-[#39FF14] font-semibold hover:underline">
                התחברות
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
