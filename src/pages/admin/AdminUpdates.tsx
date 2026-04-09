import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getUpdates, saveUpdate, deleteUpdate, generateId } from '../../utils/storage';
import type { Update } from '../../types';

const emptyForm = (): Omit<Update, 'id'> => ({
  title: '',
  content: '',
  image: '',
  publishedAt: new Date().toISOString().split('T')[0],
  draft: false,
});

export default function AdminUpdates() {
  const [updates, setUpdates] = useState<Update[]>(getUpdates);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  function refresh() { setUpdates(getUpdates()); }

  function openNew() {
    setForm(emptyForm());
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(u: Update) {
    setForm({ title: u.title, content: u.content, image: u.image, publishedAt: u.publishedAt.split('T')[0], draft: u.draft });
    setEditId(u.id);
    setShowForm(true);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('התמונה גדולה מדי (מקס 2MB)'); return; }
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, image: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function handleSubmit(draft: boolean) {
    if (!form.title.trim()) { toast.error('יש להזין כותרת'); return; }
    if (!form.content.trim()) { toast.error('יש להזין תוכן'); return; }
    const update: Update = {
      id: editId || generateId(),
      title: form.title,
      content: form.content,
      image: form.image,
      publishedAt: new Date(form.publishedAt).toISOString(),
      draft,
    };
    saveUpdate(update);
    toast.success(draft ? 'נשמר כטיוטה' : 'פורסם בהצלחה');
    setShowForm(false);
    refresh();
  }

  function handleDelete(id: string) {
    if (!confirm('מחק עדכון זה?')) return;
    deleteUpdate(id);
    toast.success('העדכון נמחק');
    refresh();
  }

  const inputClass = "w-full px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#39FF14] transition-colors placeholder-gray-600";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
            ניהול עדכונים
          </h1>
          <p className="text-gray-400 text-sm mt-1">{updates.length} עדכונים</p>
        </div>
        <button onClick={openNew} className="neon-btn px-5 py-2.5 rounded-xl font-bold text-sm">
          + פרסם עדכון חדש
        </button>
      </div>

      {/* Table */}
      <div className="glass-card border border-[#2a2a2a] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-sm text-right min-w-[600px]">
            <thead className="bg-[#1a1a1a] border-b border-[#2a2a2a]">
              <tr>
                {['כותרת', 'תאריך', 'סטטוס', 'פעולות'].map(h => (
                  <th key={h} className="px-4 py-3 text-gray-400 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {updates.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-500">אין עדכונים עדיין</td></tr>
              ) : (
                updates.map(u => (
                  <tr key={u.id} className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#1a1a1a]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.image && (
                          <img src={u.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <span className="text-white font-medium">{u.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.publishedAt).toLocaleDateString('he-IL')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${u.draft
                        ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                        : 'text-[#39FF14] bg-[#39FF14]/10 border-[#39FF14]/30'}`}>
                        {u.draft ? 'טיוטה' : 'פורסם'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="text-sm hover:text-blue-400 transition-colors">✏️</button>
                        <button onClick={() => handleDelete(u.id)} className="text-sm hover:text-red-400 transition-colors">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowForm(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#111111] border border-[#2a2a2a] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-[#2a2a2a] flex justify-between">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  {editId ? 'ערוך עדכון' : 'עדכון חדש'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">כותרת *</label>
                  <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputClass} placeholder="כותרת העדכון" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">תוכן / תיאור *</label>
                  <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className={`${inputClass} h-28 resize-none`} placeholder="תוכן העדכון..." />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">תמונה</label>
                  {form.image && (
                    <div className="mb-2 relative">
                      <img src={form.image} alt="" className="w-full h-32 object-cover rounded-lg" />
                      <button onClick={() => setForm(f => ({ ...f, image: '' }))} className="absolute top-2 left-2 bg-black/70 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 transition-colors">✕</button>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#39FF14] file:text-black hover:file:bg-[#2BC410]" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">תאריך פרסום</label>
                  <input type="date" value={form.publishedAt} onChange={e => setForm(f => ({ ...f, publishedAt: e.target.value }))} className={`${inputClass} [color-scheme:dark]`} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => handleSubmit(false)} className="neon-btn flex-1 py-2.5 rounded-xl font-bold text-sm">פרסם</button>
                  <button onClick={() => handleSubmit(true)} className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-[#2a2a2a] text-gray-400 hover:border-yellow-500 hover:text-yellow-400 transition-all">שמור כטיוטה</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
