import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (u: string, p: string) => Promise<void>;
  register: (u: string, p: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active user on mount
    const activeUser = getCurrentUser();
    setUser(activeUser);
    setIsLoading(false);
  }, []);

  const login = async (u: string, p: string) => {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            try {
                const loggedUser = loginUser(u, p);
                setUser(loggedUser);
                // Need to reload to refresh all storageService keys
                window.location.href = '/'; 
                resolve();
            } catch (e) {
                reject(e);
            }
        }, 500); // Fake delay
    });
  };

  const register = async (u: string, p: string) => {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            try {
                const newUser = registerUser(u, p);
                setUser(newUser);
                window.location.href = '/';
                resolve();
            } catch (e) {
                reject(e);
            }
        }, 500);
    });
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};