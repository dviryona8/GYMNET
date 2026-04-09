import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getUsers, saveUser, deleteUser } from '../../utils/storage';
import type { User } from '../../types';

const PLAN_LABELS: Record<string, string> = {
  single: 'כניסה חד-פעמית', monthly: 'מנוי חודשי', yearly: 'מנוי שנתי',
};
const STATUS_LABELS: Record<string, string> = {
  active: 'פעיל', suspended: 'מושהה', expired: 'פג תוקף',
};

function statusColor(status: string) {
  if (status === 'active') return 'text-[#39FF14] bg-[#39FF14]/10 border-[#39FF14]/30';
  if (status === 'suspended') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  return 'text-red-400 bg-red-500/10 border-red-500/30';
}

export default function AdminMembers() {
  const [users, setUsers] = useState<User[]>(getUsers);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editPlanType, setEditPlanType] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');

  function refresh() {
    setUsers(getUsers());
  }

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q);
      const matchPlan = filterPlan === 'all' || u.subscription?.type === filterPlan || (filterPlan === 'none' && !u.subscription);
      return matchSearch && matchPlan;
    });
  }, [users, search, filterPlan]);

  function handleSuspend(user: User) {
    if (!user.subscription) return;
    const updated = {
      ...user,
      subscription: {
        ...user.subscription,
        status: user.subscription.status === 'suspended' ? 'active' as const : 'suspended' as const,
      },
    };
    saveUser(updated);
    toast.success(updated.subscription?.status === 'suspended' ? 'המנוי הושהה' : 'המנוי הופעל מחדש');
    refresh();
  }

  function handleDelete(id: string) {
    if (!confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) return;
    deleteUser(id);
    toast.success('המשתמש נמחק');
    refresh();
  }

  function openEdit(user: User) {
    setEditUser(user);
    setEditPlanType(user.subscription?.type || 'monthly');
    setEditExpiryDate(user.subscription?.expiryDate
      ? new Date(user.subscription.expiryDate).toISOString().split('T')[0]
      : '');
  }

  function saveEdit() {
    if (!editUser) return;
    const expiry = editExpiryDate ? new Date(editExpiryDate).toISOString() : new Date().toISOString();
    const updated: User = {
      ...editUser,
      subscription: {
        type: editPlanType as 'single' | 'monthly' | 'yearly',
        startDate: editUser.subscription?.startDate || new Date().toISOString(),
        expiryDate: expiry,
        status: 'active',
      },
    };
    saveUser(updated);
    toast.success('המנוי עודכן בהצלחה');
    setEditUser(null);
    refresh();
  }

  const inputClass = "w-full px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#39FF14] transition-colors";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
          ניהול מנויים
        </h1>
        <p className="text-gray-400 text-sm mt-1">{users.length} חברים רשומים</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="חיפוש לפי שם, אימייל, טלפון..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`${inputClass} flex-1`}
        />
        <select
          value={filterPlan}
          onChange={e => setFilterPlan(e.target.value)}
          className={`${inputClass} w-full sm:w-48`}
        >
          <option value="all">כל הסוגים</option>
          <option value="single">כניסה חד-פעמית</option>
          <option value="monthly">מנוי חודשי</option>
          <option value="yearly">מנוי שנתי</option>
          <option value="none">ללא מנוי</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card border border-[#2a2a2a] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-sm text-right min-w-[800px]">
            <thead className="bg-[#1a1a1a] border-b border-[#2a2a2a]">
              <tr>
                {['שם מלא', 'אימייל', 'טלפון', 'מנוי', 'תפוגה', 'שאלון', 'הצטרפות', 'פעולות'].map(h => (
                  <th key={h} className="px-4 py-3 text-gray-400 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">אין תוצאות</td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#1a1a1a]/50 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{user.firstName} {user.lastName}</td>
                    <td className="px-4 py-3 text-gray-400" dir="ltr">{user.email}</td>
                    <td className="px-4 py-3 text-gray-400">{user.phone}</td>
                    <td className="px-4 py-3">
                      {user.subscription ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${statusColor(user.subscription.status)}`}>
                          {PLAN_LABELS[user.subscription.type]}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">ללא מנוי</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {user.subscription?.expiryDate
                        ? user.subscription.type === 'single'
                          ? new Date(user.subscription.expiryDate).toLocaleString('he-IL', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
                          : new Date(user.subscription.expiryDate).toLocaleDateString('he-IL')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${user.healthQuestionnaire ? 'text-[#39FF14]' : 'text-gray-600'}`}>
                        {user.healthQuestionnaire ? 'מולא' : 'לא מולא'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedUser(user)} title="הצג פרופיל" className="text-base hover:text-[#39FF14] transition-colors">👁️</button>
                        <button onClick={() => openEdit(user)} title="ערוך מנוי" className="text-base hover:text-blue-400 transition-colors">✏️</button>
                        {user.subscription && (
                          <button onClick={() => handleSuspend(user)} title="השהה/הפעל" className="text-base hover:text-yellow-400 transition-colors">🚫</button>
                        )}
                        <button onClick={() => handleDelete(user.id)} title="מחק" className="text-base hover:text-red-400 transition-colors">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedUser(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#111111] border border-[#2a2a2a] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-[#2a2a2a] flex justify-between">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  פרופיל: {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="p-6 space-y-4 text-sm">
                {[
                  ['אימייל', selectedUser.email],
                  ['טלפון', selectedUser.phone],
                  ['תאריך לידה', selectedUser.birthDate ? new Date(selectedUser.birthDate).toLocaleDateString('he-IL') : '—'],
                  ['הצטרפות', new Date(selectedUser.createdAt).toLocaleDateString('he-IL')],
                  ['סוג מנוי', selectedUser.subscription ? PLAN_LABELS[selectedUser.subscription.type] : 'ללא מנוי'],
                  ['סטטוס', selectedUser.subscription ? STATUS_LABELS[selectedUser.subscription.status] : '—'],
                  ['תפוגה', selectedUser.subscription?.expiryDate
                    ? selectedUser.subscription.type === 'single'
                      ? new Date(selectedUser.subscription.expiryDate).toLocaleString('he-IL', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
                      : new Date(selectedUser.subscription.expiryDate).toLocaleDateString('he-IL')
                    : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-[#2a2a2a] pb-2">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-white">{v}</span>
                  </div>
                ))}

                {selectedUser.healthQuestionnaire && (
                  <div>
                    <p className="text-gray-400 font-semibold mb-2">שאלון בריאות:</p>
                    {[
                      ['מחלת לב', selectedUser.healthQuestionnaire.answers.heartDisease],
                      ['לחץ דם', selectedUser.healthQuestionnaire.answers.bloodPressure],
                      ['בעיות עמוד שדרה/ברכיים', selectedUser.healthQuestionnaire.answers.spineKneeJoints],
                      ['טיפול רפואי', selectedUser.healthQuestionnaire.answers.currentMedicalTreatment],
                      ['הריון', selectedUser.healthQuestionnaire.answers.pregnant],
                      ['סחרחורת/כאבים', selectedUser.healthQuestionnaire.answers.dizzinessPainBreathlessness],
                    ].map(([label, val]) => (
                      <div key={label as string} className="flex justify-between text-xs py-1">
                        <span className="text-gray-500">{label as string}</span>
                        <span className={val ? 'text-red-400' : 'text-[#39FF14]'}>{val ? 'כן' : 'לא'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setEditUser(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#111111] border border-[#2a2a2a] rounded-2xl w-full max-w-sm"
            >
              <div className="p-6 border-b border-[#2a2a2a] flex justify-between">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  עריכת מנוי
                </h2>
                <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">סוג מנוי</label>
                  <select value={editPlanType} onChange={e => setEditPlanType(e.target.value)} className={inputClass}>
                    <option value="single">כניסה חד-פעמית</option>
                    <option value="monthly">מנוי חודשי</option>
                    <option value="yearly">מנוי שנתי</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">תאריך תפוגה</label>
                  <input
                    type="date"
                    value={editExpiryDate}
                    onChange={e => setEditExpiryDate(e.target.value)}
                    className={`${inputClass} [color-scheme:dark]`}
                  />
                </div>
                <button onClick={saveEdit} className="neon-btn w-full py-3 rounded-xl font-bold">
                  שמור שינויים
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
