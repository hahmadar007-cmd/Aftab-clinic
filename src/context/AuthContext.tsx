import React, { createContext, useContext, useState } from 'react';
import type { User, AuthState, WhatsAppConfig } from '../types';
import { cleanWhatsAppNumber } from '../utils/whatsapp';

export interface AuthResult {
  success: boolean;
  error?: string;
}

interface RegisteredAccount {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => AuthResult;
  register: (fullName: string, email: string, pass: string) => AuthResult;
  logout: () => void;
  whatsAppConfig: WhatsAppConfig;
  updateWhatsAppConfig: (config: Partial<WhatsAppConfig>) => void;
}

const ADMIN_EMAIL = 'aftabclinictestzone@gmail.com';
const ADMIN_PASSWORD = 'tayyab__666';

const getRegisteredUsers = (): Record<string, RegisteredAccount> => {
  try {
    const raw = localStorage.getItem('aftab_clinic_registered_users');
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
};

const DEFAULT_WHATSAPP: WhatsAppConfig = {
  phoneNumber: '923001234567',
  displayPhone: '+92 300 1234567',
  defaultMessage: 'Hello Aftab Clinic, I would like to inquire about laboratory diagnostic testing services.',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem('aftab_clinic_user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    return {
      user,
      isAuthenticated: !!savedUser,
      isLoading: false,
      isAdmin: user?.isAdmin || false,
    };
  });

  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(() => {
    const savedWA = localStorage.getItem('aftab_clinic_wa');
    return savedWA ? JSON.parse(savedWA) : DEFAULT_WHATSAPP;
  });

  const login = (emailInput: string, passwordInput: string): AuthResult => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    // Check if admin email
    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      if (cleanPassword === ADMIN_PASSWORD) {
        const adminUser: User = {
          id: 'admin_sys',
          fullName: 'Administrator',
          email: ADMIN_EMAIL,
          isAdmin: true,
        };
        localStorage.setItem('aftab_clinic_user', JSON.stringify(adminUser));
        setAuthState({
          user: adminUser,
          isAuthenticated: true,
          isLoading: false,
          isAdmin: true,
        });
        return { success: true };
      } else {
        return { success: false, error: 'Invalid Administrator password. Please check your credentials.' };
      }
    }

    // Check regular patient authentication
    const usersMap = getRegisteredUsers();
    const account = usersMap[cleanEmail];

    if (!account) {
      return {
        success: false,
        error: 'No account registered with this email address. Please click "Register here" to create an account.',
      };
    }

    if (account.passwordHash !== cleanPassword) {
      return { success: false, error: 'Incorrect password. Please verify your password and try again.' };
    }

    const patientUser: User = {
      id: account.id,
      fullName: account.fullName,
      email: account.email,
      isAdmin: false,
    };

    localStorage.setItem('aftab_clinic_user', JSON.stringify(patientUser));
    setAuthState({
      user: patientUser,
      isAuthenticated: true,
      isLoading: false,
      isAdmin: false,
    });

    return { success: true };
  };

  const register = (fullName: string, emailInput: string, passwordInput: string): AuthResult => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: 'This email address is reserved for Administrator access.' };
    }

    const usersMap = getRegisteredUsers();
    if (usersMap[cleanEmail]) {
      return { success: false, error: 'An account with this email address already exists. Please sign in instead.' };
    }

    const newAccount: RegisteredAccount = {
      id: 'usr_' + Date.now(),
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash: cleanPassword,
    };

    usersMap[cleanEmail] = newAccount;
    localStorage.setItem('aftab_clinic_registered_users', JSON.stringify(usersMap));

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('aftab_clinic_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
    });
  };

  const updateWhatsAppConfig = (newConfig: Partial<WhatsAppConfig>): boolean => {
    if (!authState.isAdmin) {
      console.warn('Unauthorized attempt: Only Admin can change WhatsApp configuration.');
      return false;
    }
    const updated = { ...whatsAppConfig, ...newConfig };
    if (updated.phoneNumber) {
      updated.phoneNumber = cleanWhatsAppNumber(updated.phoneNumber);
    }
    setWhatsAppConfig(updated);
    localStorage.setItem('aftab_clinic_wa', JSON.stringify(updated));
    return true;
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
