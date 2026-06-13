'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

/* ─── Static users ─────────────────────────────────────── */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'designer' | 'pm' | 'devops' | 'qa';
  avatar: string; // initials
  avatarColor: string;
}

export const STATIC_USERS: Record<string, { password: string; user: User }> = {
  'admin@talentforge.in': {
    password: 'tf2025',
    user: { id: 'u1', name: 'administrator', email: 'admin@talentforge.in', role: 'admin', avatar: 'AK', avatarColor: 'av-orange' },
  },
  'dev@talentforge.in': {
    password: 'tf2025',
    user: { id: 'u2', name: 'Rohan', email: 'dev@talentforge.in', role: 'developer', avatar: 'PS', avatarColor: 'av-teal' },
  },
  'designer@talentforge.in': {
    password: 'kt2025',
    user: { id: 'u3', name: 'Karthikeyan', email: 'kt@talentforge.in', role: 'pm', avatar: 'RM', avatarColor: 'av-purple' },
  },
  'pm@talentforge.in': {
    password: 'tf2025',
    user: { id: 'u4', name: 'Sneha Iyer', email: 'pm@talentforge.in', role: 'pm', avatar: 'SI', avatarColor: 'av-amber' },
  },
  'devops@talentforge.in': {
    password: 'tf2025',
    user: { id: 'u5', name: 'Vikram Reddy', email: 'devops@talentforge.in', role: 'devops', avatar: 'VR', avatarColor: 'av-blue' },
  },
  'qa@talentforge.in': {
    password: 'tf2025',
    user: { id: 'u6', name: 'Meera Nair', email: 'qa@talentforge.in', role: 'qa', avatar: 'MN', avatarColor: 'av-orange' },
  },
};

export const TEAM_MEMBERS: User[] = Object.values(STATIC_USERS).map((u) => u.user);

/* ─── Auth context ─────────────────────────────────────── */
interface AuthCtx {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => string | null; // returns error or null
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  isLoading: true,
  login: () => 'Not initialized',
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tf_auth');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): string | null => {
    const entry = STATIC_USERS[email.toLowerCase().trim()];
    if (!entry) return 'User not found';
    if (entry.password !== password) return 'Incorrect password';
    setUser(entry.user);
    localStorage.setItem('tf_auth', JSON.stringify(entry.user));
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tf_auth');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
