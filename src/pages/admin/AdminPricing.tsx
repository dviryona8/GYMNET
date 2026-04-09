import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { getPlans, savePlans } from '../../utils/storage';
import type { Plan } from '../../types';

export default function AdminPricing() {
  const [plans, setPlans] = useState<Plan[]>(getPlans);

  function updatePlan(id: string, field: keyof Plan, value: string | number) {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  function updateFeature(planId: string, idx: number, value: string) {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const features = [...p.features];
      features[idx] = value;
      return { ...p, features };
    }));
  }

  function addFeature(planId: string) {
    setPlans(prev => prev.map(p =>
      p.id === planId ? { ...p, features: [...p.features, ''] } : p
    ));
  }

  function removeFeature(planId: string, idx: number) {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      return { ...p, features: p.features.filter((_, i) => i !== idx) };
    }));
  }

  function handleSave() {
    savePlans(plans);
    toast.success('המחירים עודכנו בהצלחה');
  }

  const inputClass = "w-full px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#39FF14] transition-colors placeholder-gray-600";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
          ניהול מחירים
        </h1>
        <p className="text-gray-400 text-sm mt-1">עדכן את תוכניות המנוי ומחיריהן</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {plans.map(plan => (
          <div key={plan.id} className="glass-card border border-[#2a2a2a] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
                {plan.name}
              </h2>
              <span className="text-[#39FF14] text-xs font-mono font-bold">/{plan.period}</span>
            </div>

            <div>
              <label className="text-gray-500 text-xs mb-1 block">שם תוכנית</label>
              <input
                value={plan.name}
                onChange={e => updatePlan(plan.id, 'name', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">מחיר (₪)</label>
              <input
                type="number"
                value={plan.price}
                onChange={e => updatePlan(plan.id, 'price', Number(e.target.value))}
                className={inputClass}
                min={0}
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">תיאור</label>
              <textarea
                value={plan.description}
                onChange={e => updatePlan(plan.id, 'description', e.target.value)}
                className={`${inputClass} h-16 resize-none`}
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">תג (אופציונלי)</label>
              <input
                value={plan.badge || ''}
                onChange={e => updatePlan(plan.id, 'badge', e.target.value)}
                placeholder="לדוגמה: הכי משתלם"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-2 block">יתרונות</label>
              <div className="space-y-2">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={feat}
                      onChange={e => updateFeature(plan.id, i, e.target.value)}
                      className={`${inputClass} flex-1`}
                      placeholder="יתרון..."
                    />
                    <button
                      onClick={() => removeFeature(plan.id, i)}
                      className="text-red-400 hover:text-red-300 text-sm px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addFeature(plan.id)}
                  className="text-xs text-[#39FF14] hover:underline"
                >
                  + הוסף יתרון
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSave} className="neon-btn px-8 py-3 rounded-xl font-bold text-base">
        שמור שינויים
      </button>
    </div>
  );
}
