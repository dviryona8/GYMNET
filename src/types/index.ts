export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  password: string;
  createdAt: string;
  isAdmin: boolean;
  subscription: Subscription | null;
  purchaseHistory: Purchase[];
  healthQuestionnaire: HealthQuestionnaire | null;
}

export interface Subscription {
  type: 'single' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  expiryDate: string;
  status: 'active' | 'suspended' | 'expired';
}

export interface Purchase {
  id: string;
  planType: 'single' | 'monthly' | 'quarterly' | 'yearly';
  planName: string;
  amount: number;
  date: string;
}

export interface HealthQuestionnaire {
  completedAt: string;
  answers: {
    heartDisease: boolean;
    bloodPressure: boolean;
    spineKneeJoints: boolean;
    currentMedicalTreatment: boolean;
    pregnant: boolean;
    dizzinessPainBreathlessness: boolean;
  };
  hasWarnings: boolean;
  confirmedWarning: boolean;
}

export interface Plan {
  id: 'single' | 'monthly' | 'quarterly' | 'yearly';
  name: string;
  price: number;
  period: string;
  description: string;
  badge?: string;
  features: string[];
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface Update {
  id: string;
  title: string;
  content: string;
  image: string;
  publishedAt: string;
  draft: boolean;
}

export interface GymSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
}

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  register: (data: RegisterData) => { success: boolean; message: string };
  logout: () => void;
  updateUser: (user: User) => void;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  password: string;
}
