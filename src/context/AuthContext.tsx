import React, { createContext, useContext, useState } from 'react';
import type { User, AuthState, WhatsAppConfig } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => boolean;
  register: (fullName: string, email: string, pass: string) => boolean;
  logout: () => void;
  whatsAppConfig: WhatsAppConfig;
  updateWhatsAppConfig: (config: Partial<WhatsAppConfig>) => void;
}

const DEFAULT_WHATSAPP: WhatsAppConfig = {
  phoneNumber: '923001234567',
  displayPhone: '+92 300 1234567',
  defaultMessage: 'Hello Aftab Clinic, I would like to inquire about laboratory diagnostic testing services.',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem('aftab_clinic_user');
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      isAuthenticated: !!savedUser,
      isLoading: false,
    };
  });

  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(() => {
    const savedWA = localStorage.getItem('aftab_clinic_wa');
    return savedWA ? JSON.parse(savedWA) : DEFAULT_WHATSAPP;
  });

  const login = (email: string): boolean => {
    const mockUser: User = {
      id: 'usr_' + Date.now(),
      fullName: email.split('@')[0].toUpperCase(),
      email: email,
    };
    localStorage.setItem('aftab_clinic_user', JSON.stringify(mockUser));
    setAuthState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  };

  const register = (fullName: string, email: string): boolean => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      fullName,
      email,
    };
    localStorage.setItem('aftab_registered_' + email, JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    localStorage.removeItem('aftab_clinic_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateWhatsAppConfig = (newConfig: Partial<WhatsAppConfig>) => {
    const updated = { ...whatsAppConfig, ...newConfig };
    setWhatsAppConfig(updated);
    localStorage.setItem('aftab_clinic_wa', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        whatsAppConfig,
        updateWhatsAppConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
