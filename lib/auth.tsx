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
    user: { id: 'u2', name: 'Rohan', email: 'Rohan@talentforge.in', role: 'developer', avatar: 'PS', avatarColor: 'av-teal' },
  },
  'designer@talentforge.in': {
    password: 'tf2025',
    user: { id: 'u3', name: 'Karthikeyan', email: 'kt@talentforge.in', role: 'pm', avatar: 'RM', avatarColor: 'av-purple' },
  },
  'pm@talentforge.in': {
    password: 'tf2025',
    user: { id: 'u4', name: 'sathya', email: 'sathya@talentforge.in', role: 'pm', avatar: 'NS', avatarColor: 'av-amber' },
  },
  'devops@talentforge.in': {
    password: 'tf2025',
    user: { id: 'u5', name: 'Ganesh', email: 'ganesh@talentforge.in', role: 'devops', avatar: 'GR', avatarColor: 'av-blue' },
  }
  
};

export const TEAM_MEMBERS: User[] = Object.values(STATIC_USERS).map((u) => u.user);

/* ─── Auth context ─────────────────────────────────────── */
interface AuthCtx {
  user: User | null;
  users: User[];
  isLoading: boolean;
  login: (email: string, password: string) => string | null; // returns error or null
  logout: () => void;
  addUser: (name: string, email: string, role: User['role'], password?: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (id: string, name: string, email: string, role: User['role'], password?: string) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  users: TEAM_MEMBERS,
  isLoading: true,
  login: () => 'Not initialized',
  logout: () => {},
  addUser: async () => ({ success: false, error: 'Not initialized' }),
  updateUser: async () => ({ success: false, error: 'Not initialized' }),
  deleteUser: async () => ({ success: false, error: 'Not initialized' }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users from database
  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
          return data.users as User[];
        }
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    }
    return null;
  };

  // Hydrate from localStorage first, then sync users
  useEffect(() => {
    let activeUser: User | null = null;
    try {
      const stored = localStorage.getItem('tf_auth');
      if (stored) {
        activeUser = JSON.parse(stored);
        setUser(activeUser);
      }
    } catch { /* ignore */ }

    refreshUsers().then((fetchedUsers) => {
      if (fetchedUsers && activeUser) {
        // Update active user in session if their role/name changed in db
        const updatedActive = fetchedUsers.find(u => u.id === activeUser?.id);
        if (updatedActive) {
          setUser(updatedActive);
          localStorage.setItem('tf_auth', JSON.stringify(updatedActive));
        }
      }
      setIsLoading(false);
    });
  }, []);

  const login = (email: string, password: string): string | null => {
    const cleanedEmail = email.toLowerCase().trim();
    // Search in dynamic users
    const matchedUser = users.find((u) => u.email.toLowerCase() === cleanedEmail);
    if (!matchedUser) {
      // Fallback check in static configuration if not fetched yet
      const entry = STATIC_USERS[cleanedEmail];
      if (!entry) return 'User not found';
      if (entry.password !== password) return 'Incorrect password';
      setUser(entry.user);
      localStorage.setItem('tf_auth', JSON.stringify(entry.user));
      return null;
    }

    const dbPassword = (matchedUser as any).password || 'tf2025';
    if (dbPassword !== password) return 'Incorrect password';

    setUser(matchedUser);
    localStorage.setItem('tf_auth', JSON.stringify(matchedUser));
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tf_auth');
  };

  const addUser = async (name: string, email: string, role: User['role'], password = 'tf2025') => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to add user' };
      }
      await refreshUsers();
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const updateUser = async (id: string, name: string, email: string, role: User['role'], password?: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, email, role, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update user' };
      }
      await refreshUsers();
      
      // If updating current logged in user, refresh their session
      if (user && user.id === id) {
        const updatedUser = data.user;
        setUser(updatedUser);
        localStorage.setItem('tf_auth', JSON.stringify(updatedUser));
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to delete user' };
      }
      await refreshUsers();
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, users: users.length > 0 ? users : TEAM_MEMBERS, isLoading, login, logout, addUser, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

