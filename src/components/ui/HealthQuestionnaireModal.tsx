import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HealthQuestionnaire, Plan } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  plan: Plan;
  onClose: () => void;
  onProceed: () => void;
}

const QUESTIONS: { key: keyof HealthQuestionnaire['answers']; text: string }[] = [
  { key: 'heartDisease', text: 'האם אובחנת אי פעם עם מחלת לב או בעיה קרדיווסקולרית?' },
  { key: 'bloodPressure', text: 'האם אתה/את סובל/ת מלחץ דם גבוה או נמוך?' },
  { key: 'spineKneeJoints', text: 'האם אתה/את סובל/ת מבעיות בעמוד השדרה, ברכיים או מפרקים?' },
  { key: 'currentMedicalTreatment', text: 'האם אתה/את עובר/ת טיפול רפואי כלשהו כרגע?' },
  { key: 'pregnant', text: 'האם אתה/את בהריון?' },
  { key: 'dizzinessPainBreathlessness', text: 'האם חווית סחרחורת, כאבים בחזה או קוצר נשימה בזמן פעילות גופנית?' },
];

type Answers = HealthQuestionnaire['answers'];

export default function HealthQuestionnaireModal({ plan, onClose, onProceed }: Props) {
  const { user, updateUser } = useAuth();

  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [confirmedWarning, setConfirmedWarning] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = QUESTIONS.every(q => answers[q.key] !== undefined);
  const hasWarnings = QUESTIONS.some(q => answers[q.key] === true);

  function handleAnswer(key: keyof Answers, value: boolean) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!allAnswered) return;
    if (hasWarnings && !confirmedWarning) return;
    setSubmitted(true);
  }

  function handleProceed() {
    if (!user) return;

    const questionnaire: HealthQuestionnaire = {
      completedAt: new Date().toISOString(),
      answers: answers as Answers,
      hasWarnings,
      confirmedWarning,
    };

    updateUser({ ...user, healthQuestionnaire: questionnaire });
    onProceed();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#111111] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#111111] border-b border-[#2a2a2a] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
              שאלון בריאות
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">חובה למילוי לפני ההצטרפות</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {!submitted ? (
            <>
              {/* Plan reminder */}
              <div className="mb-6 p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-between">
                <span className="text-gray-300 text-sm">מנוי נבחר:</span>
                <span className="text-[#39FF14] font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  {plan.name} — ₪{plan.price}
                </span>
              </div>

              {/* Questions */}
              <div className="space-y-5">
                {QUESTIONS.map((q, i) => (
                  <div key={q.key} className="p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
                    <p className="text-white text-sm mb-3 leading-relaxed">
                      <span className="text-[#39FF14] font-bold ml-2">{i + 1}.</span>
                      {q.text}
                    </p>
                    <div className="flex gap-4">
                      {[{ val: false, label: 'לא' }, { val: true, label: 'כן' }].map(({ val, label }) => (
                        <button
                          key={label}
                          onClick={() => handleAnswer(q.key, val)}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                            answers[q.key] === val
                              ? val
                                ? 'bg-red-500/20 border-red-500 text-red-400'
                                : 'bg-[#39FF14]/10 border-[#39FF14] text-[#39FF14]'
                              : 'border-[#2a2a2a] text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning if any yes */}
              <AnimatePresence>
                {hasWarnings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/50"
                  >
                    <p className="text-yellow-400 text-sm leading-relaxed mb-3">
                      ⚠️ אנו ממליצים להתייעץ עם רופא לפני תחילת פעילות גופנית.
                      ניתן להמשיך בהרשמה תוך נטילת אחריות אישית.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmedWarning}
                        onChange={e => setConfirmedWarning(e.target.checked)}
                        className="mt-0.5 accent-yellow-400"
                      />
                      <span className="text-yellow-300 text-sm">
                        אני מודע/ת לאמור לעיל ומאשר/ת המשך בהרשמה
                      </span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || (hasWarnings && !confirmedWarning)}
                className={`mt-6 w-full py-3 rounded-xl font-bold text-sm transition-all ${
                  allAnswered && (!hasWarnings || confirmedWarning)
                    ? 'neon-btn'
                    : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed border border-[#2a2a2a]'
                }`}
              >
                המשך לתשלום →
              </button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              {hasWarnings ? (
                <div className="text-yellow-400 text-4xl mb-4">⚠️</div>
              ) : (
                <div className="text-[#39FF14] text-5xl mb-4">✓</div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
                {hasWarnings ? 'שאלון הושלם' : 'מצוין!'}
              </h3>
              <p className="text-gray-400 text-sm mb-8">
                {hasWarnings
                  ? 'אישרת שאתה מודע לאמור. ניתן להמשיך לתשלום.'
                  : 'אתה/את מוכן/ה להתחיל לאמן. ניתן להמשיך לתשלום.'}
              </p>
              <button
                onClick={handleProceed}
                className="neon-btn px-8 py-3 rounded-xl font-bold text-base"
              >
                עבור לתשלום →
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
