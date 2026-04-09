import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { generateId } from '../utils/storage';

const PLAN_CONFIG: Record<string, { name: string; price: number; days?: number; hours?: number }> = {
  single:    { name: 'כניסה חד-פעמית', price: 40,   hours: 12 },
  monthly:   { name: 'מנוי חודשי',     price: 200,  days: 30  },
  quarterly: { name: 'מנוי רבעוני',    price: 555,  days: 90  },
  yearly:    { name: 'מנוי שנתי',      price: 2040, days: 365 },
};

export default function SuccessPage() {
  const [params] = useSearchParams();
  const planId = params.get('plan') || 'monthly';
  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (!user || user.isAdmin) return;
    const config = PLAN_CONFIG[planId];
    if (!config) return;

    const now = new Date();
    const expiry = new Date(now);
    if (config.hours) expiry.setHours(expiry.getHours() + config.hours);
    else if (config.days) expiry.setDate(expiry.getDate() + config.days);

    updateUser({
      ...user,
      subscription: {
        type: planId as 'single' | 'monthly' | 'quarterly' | 'yearly',
        startDate: now.toISOString(),
        expiryDate: expiry.toISOString(),
        status: 'active',
      },
      purchaseHistory: [
        { id: generateId(), planType: planId as 'single' | 'monthly' | 'quarterly' | 'yearly', planName: config.name, amount: config.price, date: now.toISOString() },
        ...user.purchaseHistory,
      ],
    });
    toast.success('המנוי עודכן בהצלחה!');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} className="text-center max-w-lg">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(57,255,20,0.1)', border: '2px solid #39FF14' }}>
          <span className="text-5xl" style={{ color: '#39FF14' }}>✓</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
          ההרשמה הושלמה בהצלחה! 🎉
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg mb-2">
          המנוי שלך פעיל
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-[#39FF14] font-bold text-xl mb-8" style={{ fontFamily: 'Oswald, sans-serif' }}>
          {PLAN_CONFIG[planId]?.name}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard" className="neon-btn px-8 py-3 rounded-xl font-bold text-base">לאזור האישי</Link>
          <Link to="/" className="px-8 py-3 rounded-xl font-bold text-base border border-[#2a2a2a] text-white hover:border-[#39FF14] transition-all">לדף הבית</Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
