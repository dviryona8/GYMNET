import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type MotionProps } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getPlans, getHours, getUpdates } from '../utils/storage';
import { simulateCheckout } from '../utils/stripe';
import HealthQuestionnaireModal from '../components/ui/HealthQuestionnaireModal';
import type { Plan } from '../types';

const FI: MotionProps = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: 'easeOut' },
};

export default function HomePage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const plans = getPlans();
  const hours = getHours();
  const updates = getUpdates().filter(u => !u.draft);

  function handlePurchase(plan: Plan) {
    if (!isLoggedIn) { navigate('/register'); return; }
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

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Real gym photo as background */}
        <div className="absolute inset-0">
          <img
            src="/images/gym-photo-2.png"
            alt="GYMNET חדר כושר"
            className="w-full h-full object-cover object-center"
            onError={e => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
              el.parentElement!.style.background = 'linear-gradient(135deg, #0a0a0a 0%, #0d1a0d 50%, #0a0a0a 100%)';
            }}
          />
          {/* Dark overlay so text stays readable */}
          <div className="absolute inset-0 bg-black/65" />
          {/* Subtle neon grid on top */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(57,255,20,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.3) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="mb-6">
            <img src="/logo.png" alt="GYMNET" className="h-24 md:h-32 mx-auto mb-4" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none" style={{ fontFamily: 'Oswald, sans-serif' }}>
              GYM<span style={{ color: '#39FF14', textShadow: '0 0 30px #39FF14, 0 0 60px #39FF14' }}>NET</span>
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="text-xl md:text-2xl text-gray-300 mb-4 font-light tracking-wide">
            לא רק חדר כושר. <span style={{ color: '#39FF14' }}>אורח חיים.</span>
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }} className="text-gray-400 text-base md:text-lg mb-10 max-w-xl mx-auto">
            ציוד מקצועי, מאמנים מנוסים, ואווירה שמדליקה אותך בכל אימון.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })} className="neon-btn px-8 py-4 text-lg rounded-lg font-black tracking-wide shadow-lg">
              הצטרף עכשיו
            </button>
            <button onClick={() => document.getElementById('hours')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 text-lg rounded-lg font-bold border border-white/30 text-white hover:border-[#39FF14] hover:text-[#39FF14] transition-all">
              שעות פתיחה
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 rounded-full" style={{ background: '#39FF14' }} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#111111] border-y border-[#2a2a2a] py-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {[{ num: '500+', label: 'חברים פעילים' }, { num: '250m²', label: 'שטח אימון' }, { num: '6', label: 'ימים בשבוע' }].map(s => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-black mb-1" style={{ fontFamily: 'Oswald, sans-serif', color: '#39FF14' }}>{s.num}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div {...FI}>
            <span className="text-[#39FF14] text-sm font-bold tracking-widest uppercase mb-3 block">על חדר הכושר</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6" style={{ fontFamily: 'Oswald, sans-serif' }}>
              הכושר שלך,<br />הדרך שלנו
            </h2>
            <p className="text-gray-300 text-base leading-relaxed mb-4">
              חדר הכושר <strong className="text-white">ג'ימנט</strong> מציע פעילות ספורט וכושר לכלל סוגי האוכלוסייה: אימוני בוקר לאוכלוסיית גיל הזהב בעלות סמלית, אימונים מותאמים לילדים ונוער, לנשים ולגברים.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              חדר הכושר, הממוקם במרכז הספורט שבעיר, הוא מהיפים בארץ ומאובזר בכ-60 מתקני כושר מהמובילים והמתקדמים בעולם — מכשירי ריצה, מכשירים אליפטיים, מכשיר Wave, מכשירי גמישות ועוד.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              בחדר הכושר מותקנות מערכות סאונד מתקדמות, טלוויזיה לכל מכשיר אירובי וצוות מדריכים מקצועי המלווה את המתאמנים בהשגת מטרות האימון. במרכז הספורט ישנם חדרי סטודיו עם מגוון חוגים, סאונה יבשה, תאים אישיים למתאמנים ומקלחות.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: '🏋️', title: '60+ מכשירים', sub: 'מהמתקדמים בעולם' },
              { icon: '🧖', title: 'סאונה יבשה', sub: 'לכל המתאמנים' },
              { icon: '👩‍🏫', title: 'מדריכים מקצועיים', sub: 'צוות מנוסה ומוסמך' },
              { icon: '🎵', title: 'חוגי סטודיו', sub: 'מגוון רחב של שיעורים' },
              { icon: '👴', title: 'לכל הגילאים', sub: 'אימונים מותאמים אישית' },
              { icon: '🚿', title: 'מקלחות ותאים', sub: 'נוחות מלאה' },
            ].map(item => (
              <div key={item.title} className="glass-card border border-[#2a2a2a] rounded-xl p-4 hover:border-[#39FF14]/30 transition-all">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-white font-semibold text-sm">{item.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.sub}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section id="gallery" className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div {...FI} className="text-center mb-12">
          <span className="text-[#39FF14] text-sm font-bold tracking-widest uppercase mb-3 block">גלריה</span>
          <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
            הציוד שלנו
          </h2>
          <p className="text-gray-400 mt-3">תראה בעצמך למה GYMNET הוא מהיפים בארץ</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* אופניי ספינינג — תמונה גדולה */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 relative rounded-2xl overflow-hidden aspect-video group cursor-pointer"
          >
            <img
              src="/images/gym-photo-1.png"
              alt="אופניי ספינינג GYMNET"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 right-4">
              <span className="px-3 py-1.5 rounded-lg text-sm font-bold text-black" style={{ background: '#39FF14' }}>
                אופניי ספינינג
              </span>
            </div>
          </motion.div>

          {/* חדרי הלבשה */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden aspect-video md:aspect-auto group cursor-pointer"
          >
            <img
              src="/images/gym-photo-2.png"
              alt="הליכונים GYMNET"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 right-4">
              <span className="px-3 py-1.5 rounded-lg text-sm font-bold text-black" style={{ background: '#39FF14' }}>
                הליכונים
              </span>
            </div>
          </motion.div>

          {/* חדר משקולות — רוחב מלא */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-3 relative rounded-2xl overflow-hidden group cursor-pointer"
            style={{ height: '360px' }}
          >
            <img
              src="/images/gym-photo-3.png"
              alt="חדר משקולות GYMNET"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 right-4">
              <span className="px-3 py-1.5 rounded-lg text-sm font-bold text-black" style={{ background: '#39FF14' }}>
                חדר משקולות
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Studios ── */}
      <section id="studios" className="py-20 bg-[#111111] border-y border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...FI} className="text-center mb-12">
            <span className="text-[#39FF14] text-sm font-bold tracking-widest uppercase mb-3 block">חוגים</span>
            <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>חוגים בסטודיו</h2>
            <p className="text-gray-400 mt-3">מגוון שיעורים לכל הרמות — בוקר וערב</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: 'סטודיו A',
                badge: 'לנשים מהמגזר החרדי',
                badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                hours: '15 שעות שבועיות',
                desc: 'מערכת אימונים הכוללת 15 שעות שבועיות של אימוני בוקר וערב בליווי מוזיקה והדרכה באווירה יהודית.',
                classes: ['פילאטיס', 'עיצוב הגוף', 'קיקבוקס', 'טבאטה', 'רצפת הגן'],
              },
              {
                name: 'סטודיו B',
                badge: 'לנשים',
                badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
                hours: '19 שעות שבועיות',
                desc: 'מערכת אימונים הכוללת 19 שעות שבועיות של אימוני בוקר וערב.',
                classes: ['זומבה', 'עיצוב הגוף', 'נשית', 'פילאטיס', 'אימוני HIT', 'אירובי מדרגה'],
              },
            ].map((studio, i) => (
              <motion.div
                key={studio.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass-card border border-[#2a2a2a] rounded-2xl p-7 hover:border-[#39FF14]/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>{studio.name}</h3>
                    <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${studio.badgeColor}`}>
                      {studio.badge}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-[#39FF14] font-bold text-sm">{studio.hours}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{studio.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {studio.classes.map(cls => (
                    <span key={cls} className="px-3 py-1 rounded-full text-xs font-medium bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20">
                      {cls}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section id="plans" className="py-24 px-4 max-w-7xl mx-auto">
        <motion.div {...FI} className="text-center mb-16">
          <span className="text-[#39FF14] text-sm font-bold tracking-widest uppercase mb-3 block">מנויים ומחירים</span>
          <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>בחר את המסלול שלך</h2>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
            כל המנויים כוללים: בניית תכנית אימונים אישית, צ'יפ אלקטרוני לכניסה, השתתפות בחוגי מרכז הכושר, שימוש בסאונה ובמתקני המכון.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 lg:p-8 flex flex-col border transition-all duration-300 hover:-translate-y-1 ${
                plan.id === 'yearly'
                  ? 'bg-[#0d1a0d] border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.15)]'
                  : 'bg-[#111111] border-[#2a2a2a] hover:border-[#39FF14]/40'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-6">
                  <span className="neon-btn px-3 py-1 text-xs rounded-full font-bold">★ {plan.badge}</span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Oswald, sans-serif' }}>{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>₪{plan.price}</span>
                  <span className="text-gray-400 text-sm">/ {plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-gray-300">
                    <span style={{ color: '#39FF14' }}>✓</span>{feat}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePurchase(plan)}
                className={`w-full py-3 rounded-xl font-bold text-base transition-all ${
                  plan.id === 'yearly' ? 'neon-btn' : 'border border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-black'
                }`}
              >
                רכישה
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Hours ── */}
      <section id="hours" className="py-24 bg-[#111111] border-y border-[#2a2a2a]">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div {...FI} className="text-center mb-12">
            <span className="text-[#39FF14] text-sm font-bold tracking-widest uppercase mb-3 block">שעות פעילות</span>
            <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>שעות פתיחה</h2>
          </motion.div>
          <motion.div {...FI} className="rounded-2xl border border-[#2a2a2a] overflow-hidden">
            {hours.map((row, i) => (
              <div key={row.day} className={`flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] last:border-0 ${i % 2 === 0 ? 'bg-[#111111]' : 'bg-[#0a0a0a]'}`}>
                <span className="text-white font-semibold">{row.day}</span>
                {row.closed
                  ? <span className="text-red-400 font-medium">סגור</span>
                  : <span style={{ color: '#39FF14' }} className="font-bold font-mono text-sm">{row.open} — {row.close}</span>
                }
              </div>
            ))}
          </motion.div>
          <motion.p {...FI} className="text-center text-gray-500 text-sm mt-6">* שעות הפתיחה עשויות להשתנות בחגים ואירועים מיוחדים</motion.p>
        </div>
      </section>

      {/* ── Updates ── */}
      <section id="updates" className="py-24 px-4 max-w-7xl mx-auto">
        <motion.div {...FI} className="text-center mb-12">
          <span className="text-[#39FF14] text-sm font-bold tracking-widest uppercase mb-3 block">מה חדש</span>
          <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>עדכונים ובשורות</h2>
        </motion.div>

        {updates.length === 0 ? (
          <motion.div {...FI} className="text-center py-16">
            <div className="text-5xl mb-4">📢</div>
            <p className="text-gray-400 text-lg">אין עדכונים להציג כרגע.</p>
            <p className="text-gray-600 text-sm mt-2">בקרוב יתווספו חדשות ועדכונים מהחדר!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {updates.map((update, i) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card rounded-2xl overflow-hidden hover:border-[#39FF14]/30 transition-all group"
              >
                {update.image && (
                  <div className="aspect-video overflow-hidden">
                    <img src={update.image} alt={update.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[#39FF14] text-xs font-semibold mb-2">
                    {new Date(update.publishedAt).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{update.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{update.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 text-center bg-[#111111] border-t border-[#2a2a2a]">
        <motion.div {...FI}>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>מוכן להתחיל?</h2>
          <p className="text-gray-400 mb-8 text-lg">הצטרף לאלפי חברים שכבר משנים את חייהם.</p>
          <button
            onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
            className="neon-btn px-10 py-4 rounded-xl text-xl font-black shadow-[0_0_30px_rgba(57,255,20,0.3)]"
          >
            הצטרף עכשיו
          </button>
        </motion.div>
      </section>

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
