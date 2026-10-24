import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import type { User, AuthState, WhatsAppConfig } from '../types';
import { auth, isLiveFirebaseConfigured, isDemoModeActive } from '../config/firebase';
import { cleanWhatsAppNumber } from '../utils/whatsapp';
import { purgeAllReportDataOnLogout } from '../utils/reportSecurity';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface RegisteredAccount {
  id: string;
  fullName: string;
  emailOrPhone: string;
  normalizedKey: string;
  passwordHash?: string;
  createdAt?: string;
  isAdmin?: boolean;
}

interface AuthContextType extends AuthState {
  login: (identifier: string, pass: string) => Promise<AuthResult>;
  register: (fullName: string, identifier: string, pass: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  whatsAppConfig: WhatsAppConfig;
  updateWhatsAppConfig: (config: Partial<WhatsAppConfig>) => void;
  getAllRegisteredAccounts: () => RegisteredAccount[];
  isCloudConnected: boolean;
}

const DEFAULT_WHATSAPP: WhatsAppConfig = {
  phoneNumber: '923001234567',
  displayPhone: '+92 300 1234567',
  defaultMessage: 'Hello Aftab Clinic, I would like to inquire about laboratory diagnostic testing services.',
};

// Demo sandbox accounts strictly for offline / local testing
const DEMO_SANDBOX_ACCOUNTS: Record<string, RegisteredAccount> = {
  'patient.a@example.com': {
    id: 'usr_patient_a',
    fullName: 'Ali Khan (Patient A)',
    emailOrPhone: 'patient.a@example.com',
    normalizedKey: 'patient.a@example.com',
    isAdmin: false,
    createdAt: '2026-10-15',
  },
  'patient.b@example.com': {
    id: 'usr_patient_b',
    fullName: 'Bilal Ahmed (Patient B)',
    emailOrPhone: 'patient.b@example.com',
    normalizedKey: 'patient.b@example.com',
    isAdmin: false,
    createdAt: '2026-10-18',
  },
  'admin@aftabclinic.com': {
    id: 'admin_master',
    fullName: 'Lab Administrator',
    emailOrPhone: 'admin@aftabclinic.com',
    normalizedKey: 'admin@aftabclinic.com',
    isAdmin: true,
    createdAt: '2026-10-01',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const savedUser = localStorage.getItem('aftab_clinic_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      return {
        user,
        isAuthenticated: !!savedUser,
        isLoading: true,
        isAdmin: user?.isAdmin || false,
      };
    } catch {
      return { user: null, isAuthenticated: false, isLoading: true, isAdmin: false };
    }
  });

  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(() => {
    try {
      const savedWA = localStorage.getItem('aftab_clinic_wa');
      return savedWA ? JSON.parse(savedWA) : DEFAULT_WHATSAPP;
    } catch {
      return DEFAULT_WHATSAPP;
    }
  });

  const isCloudConnected = isLiveFirebaseConfigured();

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (!isLiveFirebaseConfigured()) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch token result with forced refresh to verify server custom claims
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          const hasAdminClaim = Boolean(tokenResult.claims && tokenResult.claims.admin === true);

          const verifiedUser: User = {
            id: firebaseUser.uid,
            fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Patient',
            email: firebaseUser.email || '',
            isAdmin: hasAdminClaim,
          };

          localStorage.setItem('aftab_clinic_user', JSON.stringify(verifiedUser));
          setAuthState({
            user: verifiedUser,
            isAuthenticated: true,
            isLoading: false,
            isAdmin: hasAdminClaim,
          });
        } catch (err) {
          console.error('Error fetching auth token claims:', err);
          setAuthState({ user: null, isAuthenticated: false, isLoading: false, isAdmin: false });
        }
      } else {
        localStorage.removeItem('aftab_clinic_user');
        setAuthState({ user: null, isAuthenticated: false, isLoading: false, isAdmin: false });
      }
    });

    return () => unsubscribe();
  }, []);

  const resolveFirebaseEmail = (input: string): string => {
    const clean = input.trim().toLowerCase();
    if (clean.includes('@')) {
      return clean;
    }
    const digits = clean.replace(/[^0-9]/g, '');
    if (digits.length >= 7) {
      return `patient_${digits}@aftabclinic.com`;
    }
    return clean;
  };

  const login = async (identifierInput: string, passwordInput: string): Promise<AuthResult> => {
    const rawInput = identifierInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();
    const targetEmail = resolveFirebaseEmail(rawInput);

    // 1. Live Firebase Cloud Authentication
    if (isLiveFirebaseConfigured()) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, targetEmail, cleanPassword);
        const tokenResult = await userCredential.user.getIdTokenResult(true);
        const hasAdminClaim = Boolean(tokenResult.claims && tokenResult.claims.admin === true);

        const verifiedUser: User = {
          id: userCredential.user.uid,
          fullName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'Patient',
          email: userCredential.user.email || '',
          isAdmin: hasAdminClaim,
        };

        localStorage.setItem('aftab_clinic_user', JSON.stringify(verifiedUser));
        setAuthState({
          user: verifiedUser,
          isAuthenticated: true,
          isLoading: false,
          isAdmin: hasAdminClaim,
        });

        return { success: true };
      } catch (err: any) {
        let msg = err.message || 'Authentication failed. Please verify your credentials.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          msg = 'Invalid credentials. Please verify your email/phone and password.';
        } else if (err.code === 'auth/wrong-password') {
          msg = 'Incorrect password. Please verify your password and try again.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'Please enter a valid email address or phone number.';
        } else if (err.code === 'auth/operation-not-allowed') {
          msg = 'Email/Password sign-in is disabled in Firebase Console. Go to Firebase Console > Authentication > Sign-in method and enable Email/Password.';
        } else if (err.code === 'auth/unauthorized-domain') {
          msg = 'Domain is not authorized in Firebase. Add aftab-clinic.vercel.app under Authentication > Settings > Authorized domains in Firebase Console.';
        } else if (err.code === 'auth/too-many-requests') {
          msg = 'Account temporarily locked due to multiple failed attempts. Please try again later.';
        }
        return { success: false, error: msg };
      }
    }

    // 2. Explicit Demo Mode / Local Sandbox
    if (isDemoModeActive()) {
      const demoAccount = DEMO_SANDBOX_ACCOUNTS[rawInput];
      if (demoAccount) {
        const sandboxUser: User = {
          id: demoAccount.id,
          fullName: demoAccount.fullName,
          email: demoAccount.emailOrPhone,
          isAdmin: Boolean(demoAccount.isAdmin),
        };
        localStorage.setItem('aftab_clinic_user', JSON.stringify(sandboxUser));
        setAuthState({
          user: sandboxUser,
          isAuthenticated: true,
          isLoading: false,
          isAdmin: Boolean(demoAccount.isAdmin),
        });
        return { success: true };
      }
      return {
        success: false,
        error: 'Demo Mode: Use patient.a@example.com, patient.b@example.com, or admin@aftabclinic.com for testing.',
      };
    }

    return { success: false, error: 'Firebase Cloud services are not configured for authentication.' };
  };

  const register = async (fullName: string, identifierInput: string, passwordInput: string): Promise<AuthResult> => {
    const rawInput = identifierInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();
    const targetEmail = resolveFirebaseEmail(rawInput);

    if (isLiveFirebaseConfigured()) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, targetEmail, cleanPassword);
        await updateProfile(userCredential.user, { displayName: fullName.trim() });

        // Newly registered patients NEVER receive admin claims
        const verifiedUser: User = {
          id: userCredential.user.uid,
          fullName: fullName.trim(),
          email: userCredential.user.email || '',
          isAdmin: false,
        };

        localStorage.setItem('aftab_clinic_user', JSON.stringify(verifiedUser));
        setAuthState({
          user: verifiedUser,
          isAuthenticated: true,
          isLoading: false,
          isAdmin: false,
        });

        return { success: true };
      } catch (err: any) {
        let msg = err.message || 'Registration failed. Please check the details provided.';
        if (err.code === 'auth/email-already-in-use') {
          msg = 'An account with this email address or phone already exists. Please sign in instead.';
        } else if (err.code === 'auth/weak-password') {
          msg = 'Password is too weak. Please use at least 6 characters.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'Please enter a valid email address (e.g. name@example.com) or 10-digit phone number.';
        } else if (err.code === 'auth/operation-not-allowed') {
          msg = 'Email/Password sign-in is disabled in Firebase Console. Go to Firebase Console > Authentication > Sign-in method and enable Email/Password.';
        } else if (err.code === 'auth/unauthorized-domain') {
          msg = 'Domain is not authorized in Firebase. Add aftab-clinic.vercel.app under Authentication > Settings > Authorized domains in Firebase Console.';
        }
        return { success: false, error: msg };
      }
    }

    if (isDemoModeActive()) {
      const newUid = 'usr_' + Date.now();
      const newUser: User = {
        id: newUid,
        fullName: fullName.trim(),
        email: rawInput,
        isAdmin: false,
      };
      DEMO_SANDBOX_ACCOUNTS[rawInput] = {
        id: newUid,
        fullName: fullName.trim(),
        emailOrPhone: rawInput,
        normalizedKey: rawInput,
        isAdmin: false,
      };
      localStorage.setItem('aftab_clinic_user', JSON.stringify(newUser));
      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        isAdmin: false,
      });
      return { success: true };
    }

    return { success: false, error: 'Cloud authentication is not configured.' };
  };

  const logout = async (): Promise<void> => {
    // 1. Sign out of Firebase Auth
    if (isLiveFirebaseConfigured()) {
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
    }

    // 2. Purge all in-memory report blobs and session tokens
    purgeAllReportDataOnLogout();

    // 3. Purge sensitive patient browser storage
    localStorage.removeItem('aftab_clinic_user');
    sessionStorage.clear();

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
    });
  };

  const updateWhatsAppConfig = (newConfig: Partial<WhatsAppConfig>): boolean => {
    if (!authState.isAdmin) {
      console.warn('Unauthorized attempt: Only verified Admin can change WhatsApp configuration.');
      return false;
    }
    const updated = { ...whatsAppConfig, ...newConfig };
    if (updated.phoneNumber) {
      updated.phoneNumber = cleanWhatsAppNumber(updated.phoneNumber);
    }
    setWhatsAppConfig(updated);
    try {
      localStorage.setItem('aftab_clinic_wa', JSON.stringify(updated));
    } catch {
      // ignore
    }
    return true;
  };

  const getAllRegisteredAccounts = (): RegisteredAccount[] => {
    return Object.values(DEMO_SANDBOX_ACCOUNTS);
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
        getAllRegisteredAccounts,
        isCloudConnected,
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
