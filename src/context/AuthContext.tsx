import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType, RegisterData } from '../types';
import {
  getUsers, getUserByEmail, saveUser, generateId,
  getCurrentUserId, setCurrentUserId,
} from '../utils/storage';

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL = 'admin@gymnet.co.il';
const ADMIN_PASSWORD = 'Admin1234!';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore session on mount
  useEffect(() => {
    const id = getCurrentUserId();
    if (!id) return;

    // Handle admin session
    if (id === 'admin') {
      setUser(adminUser());
      return;
    }

    const users = getUsers();
    const found = users.find(u => u.id === id);
    if (found) setUser(found);
    else setCurrentUserId(null);
  }, []);

  function adminUser(): User {
    return {
      id: 'admin',
      firstName: 'מנהל',
      lastName: 'ראשי',
      email: ADMIN_EMAIL,
      phone: '',
      birthDate: '',
      password: ADMIN_PASSWORD,
      createdAt: new Date().toISOString(),
      isAdmin: true,
      subscription: null,
      purchaseHistory: [],
      healthQuestionnaire: null,
    };
  }

  function login(email: string, password: string): { success: boolean; message: string } {
    // Admin login
    if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const admin = adminUser();
      setUser(admin);
      setCurrentUserId('admin');
      return { success: true, message: 'ברוך הבא, מנהל!' };
    }

    const found = getUserByEmail(email);
    if (!found) return { success: false, message: 'משתמש לא נמצא' };
    if (found.password !== password) return { success: false, message: 'סיסמה שגויה' };

    setUser(found);
    setCurrentUserId(found.id);
    return { success: true, message: `ברוך הבא, ${found.firstName}!` };
  }

  function register(data: RegisterData): { success: boolean; message: string } {
    const existing = getUserByEmail(data.email);
    if (existing) return { success: false, message: 'כתובת האימייל כבר רשומה במערכת' };

    const newUser: User = {
      id: generateId(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate,
      password: data.password,
      createdAt: new Date().toISOString(),
      isAdmin: false,
      subscription: null,
      purchaseHistory: [],
      healthQuestionnaire: null,
    };

    saveUser(newUser);
    return { success: true, message: 'נרשמת בהצלחה! כעת תוכל להתחבר.' };
  }

  function logout(): void {
    setUser(null);
    setCurrentUserId(null);
  }

  function updateUser(updated: User): void {
    setUser(updated);
    saveUser(updated);
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isAdmin: user?.isAdmin ?? false,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
