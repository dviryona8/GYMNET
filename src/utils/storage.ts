import type { User, Plan, OpeningHours, Update, GymSettings } from '../types';

const KEYS = {
  USERS: 'gymnet_users',
  CURRENT_USER: 'gymnet_current_user',
  PLANS: 'gymnet_plans',
  HOURS: 'gymnet_hours',
  UPDATES: 'gymnet_updates',
  SETTINGS: 'gymnet_settings',
  INITIALIZED: 'gymnet_initialized_v2',
};

// ─── Users ───────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  const raw = localStorage.getItem(KEYS.USERS);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function saveUser(user: User): void {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  saveUsers(users);
}

export function deleteUser(id: string): void {
  saveUsers(getUsers().filter(u => u.id !== id));
}

// ─── Current Session ──────────────────────────────────────────────────────────

export function getCurrentUserId(): string | null {
  return localStorage.getItem(KEYS.CURRENT_USER);
}

export function setCurrentUserId(id: string | null): void {
  if (id) localStorage.setItem(KEYS.CURRENT_USER, id);
  else localStorage.removeItem(KEYS.CURRENT_USER);
}

// ─── Plans ────────────────────────────────────────────────────────────────────

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'single',
    name: 'כניסה חד-פעמית',
    price: 40,
    period: 'כניסה',
    description: 'כניסה בודדת לחדר הכושר — ללא התחייבות',
    features: [
      'גישה לכל ציוד הכושר',
      'שימוש בסאונה',
      'ללא התחייבות',
      'תקף ליום אחד',
    ],
  },
  {
    id: 'monthly',
    name: 'מנוי חודשי',
    price: 200,
    period: 'חודש',
    description: 'מנוי חודשי גמיש — ללא התחייבות שנתית',
    features: [
      'גישה בלתי מוגבלת',
      'השתתפות בחוגי הסטודיו',
      'שימוש בסאונה',
      'צ\'יפ אלקטרוני לכניסה',
      'בניית תכנית אימונים אישית',
    ],
  },
  {
    id: 'quarterly',
    name: 'מנוי רבעוני',
    price: 185,
    period: 'חודש (3 חודשים)',
    description: 'מנוי ל-3 חודשים — חסכון משמעותי לעומת חודשי',
    badge: 'פופולרי',
    features: [
      'גישה בלתי מוגבלת',
      'השתתפות בחוגי הסטודיו',
      'שימוש בסאונה',
      'צ\'יפ אלקטרוני לכניסה',
      'בניית תכנית אימונים אישית',
    ],
  },
  {
    id: 'yearly',
    name: 'מנוי שנתי',
    price: 170,
    period: 'חודש (שנה)',
    description: 'המנוי המשתלם ביותר — 170 ש"ח בלבד לחודש',
    badge: 'הכי משתלם',
    features: [
      'גישה בלתי מוגבלת',
      'השתתפות בחוגי הסטודיו',
      'שימוש בסאונה',
      'צ\'יפ אלקטרוני לכניסה',
      'בניית תכנית אימונים אישית',
      'עדיפות בהרשמה לקורסים',
    ],
  },
];

export function getPlans(): Plan[] {
  const raw = localStorage.getItem(KEYS.PLANS);
  if (!raw) return DEFAULT_PLANS;
  try { return JSON.parse(raw); } catch { return DEFAULT_PLANS; }
}

export function savePlans(plans: Plan[]): void {
  localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
}

// ─── Opening Hours ────────────────────────────────────────────────────────────

const DEFAULT_HOURS: OpeningHours[] = [
  { day: 'ראשון',       open: '07:00', close: '23:00', closed: false },
  { day: 'שני',         open: '07:00', close: '23:00', closed: false },
  { day: 'שלישי',       open: '07:00', close: '23:00', closed: false },
  { day: 'רביעי',       open: '07:00', close: '23:00', closed: false },
  { day: 'חמישי',       open: '07:00', close: '23:00', closed: false },
  { day: 'שישי',        open: '07:00', close: '14:00', closed: false },
  { day: 'שבת',         open: '00:00', close: '00:00', closed: true  },
  { day: 'מוצאי שבת',   open: 'צאת השבת + חצי שעה', close: '23:00', closed: false },
];

export function getHours(): OpeningHours[] {
  const raw = localStorage.getItem(KEYS.HOURS);
  if (!raw) return DEFAULT_HOURS;
  try { return JSON.parse(raw); } catch { return DEFAULT_HOURS; }
}

export function saveHours(hours: OpeningHours[]): void {
  localStorage.setItem(KEYS.HOURS, JSON.stringify(hours));
}

// ─── Updates ──────────────────────────────────────────────────────────────────

export function getUpdates(): Update[] {
  const raw = localStorage.getItem(KEYS.UPDATES);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveUpdate(update: Update): void {
  const updates = getUpdates();
  const idx = updates.findIndex(u => u.id === update.id);
  if (idx >= 0) updates[idx] = update;
  else updates.unshift(update);
  localStorage.setItem(KEYS.UPDATES, JSON.stringify(updates));
}

export function deleteUpdate(id: string): void {
  const updates = getUpdates().filter(u => u.id !== id);
  localStorage.setItem(KEYS.UPDATES, JSON.stringify(updates));
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: GymSettings = {
  name: 'GYMNET',
  address: 'רחוב הגפן 1, שכונת נווה נוי, נתיבות',
  phone: '08-9934612',
  email: 'gym@netivimcn.org.il',
  instagram: 'https://instagram.com/gymnet',
  facebook: 'https://facebook.com/gymnet',
  tiktok: 'https://tiktok.com/@gymnet',
};

export function getSettings(): GymSettings {
  const raw = localStorage.getItem(KEYS.SETTINGS);
  if (!raw) return DEFAULT_SETTINGS;
  try { return JSON.parse(raw); } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(settings: GymSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// ─── Force-reset defaults if new version ─────────────────────────────────────
// Run once per browser to push updated defaults (clears plans/hours/settings only,
// keeps users + session intact).
export function initDefaults(): void {
  if (localStorage.getItem(KEYS.INITIALIZED)) return;
  localStorage.removeItem('gymnet_plans');
  localStorage.removeItem('gymnet_hours');
  localStorage.removeItem('gymnet_settings');
  localStorage.setItem(KEYS.INITIALIZED, '1');
}

// ─── ID Generator ─────────────────────────────────────────────────────────────

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
