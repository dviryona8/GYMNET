import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getUsers } from '../../utils/storage';

const MONTH_NAMES = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border border-[#2a2a2a] rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>{value}</p>
      {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const users = getUsers();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const activeSubscribers = users.filter(u =>
      u.subscription?.status === 'active'
    ).length;

    const monthlyRevenue = users.reduce((sum, u) => {
      if (!u.subscription || u.subscription.status !== 'active') return sum;
      const prices: Record<string, number> = { single: 40, monthly: 200, quarterly: 185, yearly: 170 };
      return sum + (prices[u.subscription.type] || 0);
    }, 0);

    const singleEntries = users.filter(u => {
      const sub = u.subscription;
      if (!sub || sub.type !== 'single') return false;
      const d = new Date(sub.startDate);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    // Monthly signups (last 6 months)
    const chartData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(thisYear, thisMonth - 5 + i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const count = users.filter(u => {
        const joined = new Date(u.createdAt);
        return joined.getMonth() === m && joined.getFullYear() === y;
      }).length;
      return { name: MONTH_NAMES[m], count };
    });

    return { activeSubscribers, monthlyRevenue, singleEntries, chartData };
  }, [users]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
          דשבורד ניהול
        </h1>
        <p className="text-gray-400 text-sm mt-1">סקירה כללית של פעילות החדר</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👥" label="סה״כ מנויים רשומים" value={users.length} />
        <StatCard
          icon="✅"
          label="מנויים פעילים החודש"
          value={stats.activeSubscribers}
        />
        <StatCard
          icon="💰"
          label="הכנסה חודשית משוערת"
          value={`₪${stats.monthlyRevenue.toLocaleString('he-IL')}`}
          sub="מבוסס על מנויים פעילים"
        />
        <StatCard
          icon="🎫"
          label="כניסות חד-פעמיות"
          value={stats.singleEntries}
          sub="החודש הנוכחי"
        />
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card border border-[#2a2a2a] rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold text-white mb-6" style={{ fontFamily: 'Oswald, sans-serif' }}>
          הצטרפויות חדשות — 6 חודשים אחרונים
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: '#111',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                cursor={{ fill: 'rgba(57,255,20,0.05)' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [`${v} חברים`, 'הצטרפויות']}
              />
              <Bar dataKey="count" fill="#39FF14" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
