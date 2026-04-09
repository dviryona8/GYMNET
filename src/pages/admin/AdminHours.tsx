import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { getHours, saveHours } from '../../utils/storage';
import type { OpeningHours } from '../../types';

export default function AdminHours() {
  const [hours, setHours] = useState<OpeningHours[]>(getHours);

  function updateDay(index: number, field: keyof OpeningHours, value: string | boolean) {
    setHours(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
  }

  function handleSave() {
    saveHours(hours);
    toast.success('שעות הפתיחה עודכנו בהצלחה');
  }

  const inputClass = "px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#39FF14] transition-colors disabled:opacity-40";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
          שעות פתיחה
        </h1>
        <p className="text-gray-400 text-sm mt-1">עדכן את לוח הזמנים השבועי</p>
      </div>

      <div className="glass-card border border-[#2a2a2a] rounded-2xl overflow-hidden mb-6">
        <table className="text-sm text-right w-full">
          <thead className="bg-[#1a1a1a] border-b border-[#2a2a2a]">
            <tr>
              <th className="px-6 py-3 text-gray-400 font-medium text-xs">יום</th>
              <th className="px-6 py-3 text-gray-400 font-medium text-xs">פתיחה</th>
              <th className="px-6 py-3 text-gray-400 font-medium text-xs">סגירה</th>
              <th className="px-6 py-3 text-gray-400 font-medium text-xs">סגור</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((row, i) => (
              <tr key={row.day} className="border-b border-[#2a2a2a] last:border-0">
                <td className="px-6 py-4 text-white font-semibold">{row.day}</td>
                <td className="px-6 py-4">
                  <input
                    type="time"
                    value={row.open}
                    onChange={e => updateDay(i, 'open', e.target.value)}
                    disabled={row.closed}
                    className={`${inputClass} [color-scheme:dark] w-28`}
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="time"
                    value={row.close}
                    onChange={e => updateDay(i, 'close', e.target.value)}
                    disabled={row.closed}
                    className={`${inputClass} [color-scheme:dark] w-28`}
                  />
                </td>
                <td className="px-6 py-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={row.closed}
                      onChange={e => updateDay(i, 'closed', e.target.checked)}
                      className="accent-red-500 w-4 h-4"
                    />
                    <span className={`text-xs font-medium ${row.closed ? 'text-red-400' : 'text-gray-500'}`}>
                      {row.closed ? 'סגור' : 'פתוח'}
                    </span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={handleSave} className="neon-btn px-8 py-3 rounded-xl font-bold text-base">
        שמור שינויים
      </button>
    </div>
  );
}
