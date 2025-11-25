
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('vda_user');
    if (stored) {
        setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = (email: string, name: string) => {
    const mockUser: User = {
        id: '1',
        name: name || 'Kullanıcı',
        email,
        company: 'LogiTech A.Ş.',
        role: 'ADMIN',
        title: 'Lojistik Yöneticisi',
        phone: '+90 555 123 4567'
    };
    setUser(mockUser);
    localStorage.setItem('vda_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vda_user');
  };

  const updateProfile = (data: Partial<User>) => {
      if (!user) return;
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('vda_user', JSON.stringify(updated));
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
