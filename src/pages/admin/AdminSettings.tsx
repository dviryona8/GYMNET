import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { getSettings, saveSettings } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';
import type { GymSettings } from '../../types';

export default function AdminSettings() {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState<GymSettings>(getSettings);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  function handleSaveSettings() {
    saveSettings(settings);
    toast.success('ההגדרות נשמרו בהצלחה');
  }

  function handleChangePassword() {
    setPwError('');
    if (!user) return;
    if (user.password !== passwords.current) { setPwError('הסיסמה הנוכחית שגויה'); return; }
    if (passwords.newPass.length < 8) { setPwError('הסיסמה חייבת להכיל לפחות 8 תווים'); return; }
    if (passwords.newPass !== passwords.confirm) { setPwError('הסיסמאות אינן תואמות'); return; }
    updateUser({ ...user, password: passwords.newPass });
    setPasswords({ current: '', newPass: '', confirm: '' });
    toast.success('הסיסמה עודכנה בהצלחה');
  }

  const inputClass = "w-full px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#39FF14] transition-colors placeholder-gray-600";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
          הגדרות
        </h1>
        <p className="text-gray-400 text-sm mt-1">ניהול פרטי החדר ורשתות חברתיות</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gym info */}
        <div className="glass-card border border-[#2a2a2a] rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
            פרטי החדר
          </h2>
          {[
            { key: 'name' as keyof GymSettings, label: 'שם החדר' },
            { key: 'address' as keyof GymSettings, label: 'כתובת' },
            { key: 'phone' as keyof GymSettings, label: 'טלפון' },
            { key: 'email' as keyof GymSettings, label: 'אימייל' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-gray-500 text-xs mb-1 block">{label}</label>
              <input
                value={settings[key]}
                onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                className={inputClass}
              />
            </div>
          ))}
          <button onClick={handleSaveSettings} className="neon-btn w-full py-2.5 rounded-xl font-bold text-sm mt-2">
            שמור פרטי החדר
          </button>
        </div>

        {/* Social media */}
        <div className="glass-card border border-[#2a2a2a] rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
            רשתות חברתיות
          </h2>
          {[
            { key: 'instagram' as keyof GymSettings, label: 'Instagram', icon: '📸' },
            { key: 'facebook' as keyof GymSettings, label: 'Facebook', icon: '👍' },
            { key: 'tiktok' as keyof GymSettings, label: 'TikTok', icon: '🎵' },
          ].map(({ key, label, icon }) => (
            <div key={key}>
              <label className="text-gray-500 text-xs mb-1 block">{icon} {label}</label>
              <input
                value={settings[key]}
                onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                className={inputClass}
                dir="ltr"
                placeholder={`https://${label.toLowerCase()}.com/gymnet`}
              />
            </div>
          ))}
          <button onClick={handleSaveSettings} className="neon-btn w-full py-2.5 rounded-xl font-bold text-sm mt-2">
            שמור רשתות חברתיות
          </button>
        </div>

        {/* Change admin password */}
        <div className="glass-card border border-[#2a2a2a] rounded-2xl p-6 space-y-4 lg:col-span-2">
          <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
            שינוי סיסמת מנהל
          </h2>
          {pwError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {pwError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'current', label: 'סיסמה נוכחית', placeholder: '••••••••' },
              { key: 'newPass', label: 'סיסמה חדשה', placeholder: 'לפחות 8 תווים' },
              { key: 'confirm', label: 'אישור סיסמה חדשה', placeholder: '••••••••' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-gray-500 text-xs mb-1 block">{label}</label>
                <input
                  type="password"
                  value={passwords[key as keyof typeof passwords]}
                  onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                  className={inputClass}
                  placeholder={placeholder}
                  dir="ltr"
                />
              </div>
            ))}
          </div>
          <button onClick={handleChangePassword} className="neon-btn px-6 py-2.5 rounded-xl font-bold text-sm">
            עדכן סיסמה
          </button>
        </div>
      </div>
    </div>
  );
}
