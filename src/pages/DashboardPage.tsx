import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getPlans } from '../utils/storage';
import { simulateCheckout } from '../utils/stripe';
import HealthQuestionnaireModal from '../components/ui/HealthQuestionnaireModal';
import type { Plan } from '../types';

const PLAN_LABELS: Record<string, string> = {
  single: 'כניסה חד-פעמית',
  monthly: 'מנוי חודשי',
  yearly: 'מנוי שנתי',
};

function statusBadge(status: string) {
  if (status === 'active') return 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30';
  if (status === 'suspended') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
  return 'bg-red-500/10 text-red-400 border-red-500/30';
}

function statusLabel(status: string) {
  if (status === 'active') return 'פעיל';
  if (status === 'suspended') return 'מושהה';
  return 'פג תוקף';
}

export default function DashboardPage() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const plans = getPlans();

  if (!isLoggedIn || !user) {
    navigate('/login', { state: { from: '/dashboard' } });
    return null;
  }

  function handleLogout() {
    logout();
    toast.success('התנתקת בהצלחה');
    navigate('/');
  }

  function handleUpgrade(plan: Plan) {
    setSelectedPlan(plan);
    setShowQuestionnaire(true);
  }

  async function handleProceedToStripe() {
    if (!selectedPlan) return;
    setShowQuestionnaire(false);
    const tid = toast.loading('מעביר לדף התשלום...');
    try {
      await simulateCheckout(
        selectedPlan.id,
        `${window.location.origin}/success?plan=${selectedPlan.id}`,
        `${window.location.origin}/cancel`
      );
    } catch {
      toast.dismiss(tid);
      toast.error('שגיאה בחיבור לתשלום. נסה שוב.');
    }
    toast.dismiss(tid);
  }

  const sub = user.subscription;

  return (
    <>
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
            שלום, <span style={{ color: '#39FF14' }}>{user.firstName}</span> 👋
          </h1>
          <p className="text-gray-400 mt-2">ברוך הבא לאזור האישי שלך</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Subscription */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 glass-card border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>סטטוס מנוי</h2>
            {sub ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadge(sub.status)}`}>{statusLabel(sub.status)}</span>
                  <span className="text-white font-semibold">{PLAN_LABELS[sub.type]}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">תחילת מנוי</p>
                    <p className="text-white text-sm font-medium">{new Date(sub.startDate).toLocaleDateString('he-IL')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">תפוגת מנוי</p>
                    <p className="text-white text-sm font-medium">{new Date(sub.expiryDate).toLocaleDateString('he-IL')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🏋️</div>
                <p className="text-gray-400 text-sm mb-4">אין לך מנוי פעיל כרגע</p>
                <button onClick={() => document.getElementById('plans') ? window.scrollTo({ top: 0 }) : navigate('/')} className="neon-btn px-6 py-2 rounded-lg text-sm font-bold">
                  רכוש מנוי עכשיו
                </button>
              </div>
            )}
          </motion.div>

          {/* Personal info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>פרטים אישיים</h2>
            <div className="space-y-3 text-sm">
              {[
                ['שם מלא', `${user.firstName} ${user.lastName}`],
                ['אימייל', user.email],
                ['טלפון', user.phone],
                ['חבר מאז', new Date(user.createdAt).toLocaleDateString('he-IL')],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-gray-500 text-xs">{k}</p>
                  <p className="text-white">{v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Health questionnaire */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card border border-[#2a2a2a] rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>שאלון בריאות</h2>
          {user.healthQuestionnaire ? (
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-2 ${user.healthQuestionnaire.hasWarnings ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30'}`}>
                {user.healthQuestionnaire.hasWarnings ? '⚠️ מולא עם הערות' : '✓ מולא — כשיר לפעילות'}
              </div>
              <p className="text-gray-500 text-xs">הושלם: {new Date(user.healthQuestionnaire.completedAt).toLocaleDateString('he-IL')}</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">שאלון הבריאות יידרש לפני הרכישה הראשונה.</p>
          )}
        </motion.div>

        {/* Purchase history */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card border border-[#2a2a2a] rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>היסטוריית רכישות</h2>
          {user.purchaseHistory.length === 0 ? (
            <p className="text-gray-400 text-sm">אין רכישות עדיין.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="text-sm text-right">
                <thead>
                  <tr className="text-gray-500 border-b border-[#2a2a2a]">
                    <th className="pb-3 font-medium">תוכנית</th>
                    <th className="pb-3 font-medium px-4">סכום</th>
                    <th className="pb-3 font-medium">תאריך</th>
                  </tr>
                </thead>
                <tbody>
                  {user.purchaseHistory.map(p => (
                    <tr key={p.id} className="border-b border-[#2a2a2a] last:border-0">
                      <td className="py-3 text-white">{p.planName}</td>
                      <td className="py-3 px-4 text-[#39FF14] font-mono">₪{p.amount}</td>
                      <td className="py-3 text-gray-400">{new Date(p.date).toLocaleDateString('he-IL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Upgrade plans */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card border border-[#2a2a2a] rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>שדרג / חדש מנוי</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map(plan => (
              <button key={plan.id} onClick={() => handleUpgrade(plan)} className="p-4 rounded-xl border border-[#2a2a2a] hover:border-[#39FF14]/50 text-right transition-all hover:bg-[#1a1a1a] group">
                <p className="text-white font-semibold text-sm group-hover:text-[#39FF14] transition-colors">{plan.name}</p>
                <p className="text-[#39FF14] font-black text-xl mt-1" style={{ fontFamily: 'Oswald, sans-serif' }}>₪{plan.price}</p>
                <p className="text-gray-500 text-xs">/ {plan.period}</p>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center">
          <button onClick={handleLogout} className="px-8 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-semibold text-sm">
            התנתק
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showQuestionnaire && selectedPlan && (
          <HealthQuestionnaireModal
            plan={selectedPlan}
            onClose={() => { setShowQuestionnaire(false); setSelectedPlan(null); }}
            onProceed={handleProceedToStripe}
          />
        )}
      </AnimatePresence>
    </>
  );
}
