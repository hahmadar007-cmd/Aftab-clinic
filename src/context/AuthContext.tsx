import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import type { User, AuthState, WhatsAppConfig } from '../types';
import { auth, db, isLiveFirebaseConfigured, isDemoModeActive } from '../config/firebase';
import { cleanWhatsAppNumber } from '../utils/whatsapp';
import { purgeAllReportDataOnLogout } from '../utils/reportSecurity';

export interface AuthResult {
  success: boolean;
  isAdmin?: boolean;
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

export interface AdminRecord {
  id: string;
  identifier: string;
  email: string;
  grantedBy: string;
  createdAt: string;
}

interface AuthContextType extends AuthState {
  login: (identifier: string, pass: string) => Promise<AuthResult>;
  register: (fullName: string, identifier: string, pass: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  whatsAppConfig: WhatsAppConfig;
  updateWhatsAppConfig: (config: Partial<WhatsAppConfig>) => void;
  getAllRegisteredAccounts: () => RegisteredAccount[];
  isCloudConnected: boolean;
  adminsList: AdminRecord[];
  grantAdminRole: (targetIdentifier: string) => Promise<{ success: boolean; error?: string }>;
  revokeAdminRole: (docId: string) => Promise<{ success: boolean; error?: string }>;
}

const DEFAULT_WHATSAPP: WhatsAppConfig = {
  phoneNumber: '923001234567',
  displayPhone: '+92 300 1234567',
  defaultMessage: 'Hello Aftab Clinic, I would like to inquire about laboratory diagnostic testing services.',
};

// Root Primary Administrator Identifiers
export const ROOT_ADMIN_IDENTIFIERS = [
  '03703513251',
  'patient_03703513251@aftabclinic.com',
  'admin_03703513251@aftabclinic.com',
  '03703513251@aftabclinic.com',
  'aftabclinictestzone@gmail.com',
];

// Initial seeded admins
const INITIAL_ADMINS: AdminRecord[] = [
  {
    id: 'adm_primary_root',
    identifier: '03703513251',
    email: 'patient_03703513251@aftabclinic.com',
    grantedBy: 'Root System Owner',
    createdAt: '2026-10-24T12:00:00Z',
  },
];

// Demo sandbox accounts strictly for offline / local testing
const DEMO_SANDBOX_ACCOUNTS: Record<string, RegisteredAccount> = {
  '03703513251': {
    id: 'usr_admin_root',
    fullName: 'Primary Administrator (03703513251)',
    emailOrPhone: '03703513251',
    normalizedKey: '03703513251',
    isAdmin: true,
    createdAt: '2026-10-24',
  },
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

  const [adminsList, setAdminsList] = useState<AdminRecord[]>(() => {
    try {
      const saved = localStorage.getItem('aftab_clinic_admins');
      return saved ? JSON.parse(saved) : INITIAL_ADMINS;
    } catch {
      return INITIAL_ADMINS;
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

  // Listen for real-time Firestore /admins updates
  useEffect(() => {
    if (!isLiveFirebaseConfigured()) return;
    try {
      const unsub = onSnapshot(collection(db, 'admins'), (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminRecord[];
          setAdminsList(list);
          try {
            localStorage.setItem('aftab_clinic_admins', JSON.stringify(list));
          } catch {
            // ignore
          }
        }
      });
      return () => unsub();
    } catch {
      return () => {};
    }
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

  const isIdentifierAdmin = (emailOrPhone: string, uid?: string): boolean => {
    const clean = emailOrPhone.trim().toLowerCase();
    const cleanDigits = clean.replace(/[^0-9]/g, '');

    if (cleanDigits === '03703513251' || clean.includes('03703513251')) {
      return true;
    }
    if (ROOT_ADMIN_IDENTIFIERS.some((id) => clean.includes(id.toLowerCase()))) {
      return true;
    }
    if (uid && adminsList.some((a) => a.id === uid || a.id === `adm_${uid}`)) {
      return true;
    }
    return adminsList.some(
      (a) =>
        a.identifier === clean ||
        a.email.toLowerCase() === clean ||
        (cleanDigits.length >= 7 && a.identifier.replace(/[^0-9]/g, '') === cleanDigits)
    );
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (!isLiveFirebaseConfigured()) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          const hasCustomClaim = Boolean(tokenResult.claims && tokenResult.claims.admin === true);
          const hasEmailPrivilege = isIdentifierAdmin(firebaseUser.email || '', firebaseUser.uid);
          const hasAdminClaim = hasCustomClaim || hasEmailPrivilege;

          const verifiedUser: User = {
            id: firebaseUser.uid,
            fullName: firebaseUser.displayName || (hasAdminClaim ? 'Clinic Administrator' : 'Patient'),
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
  }, [adminsList]);

  const login = async (identifierInput: string, passwordInput: string): Promise<AuthResult> => {
    const rawInput = identifierInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();
    const targetEmail = resolveFirebaseEmail(rawInput);
    const isRootAdmin = isIdentifierAdmin(rawInput);

    // 1. Live Firebase Cloud Authentication
    if (isLiveFirebaseConfigured()) {
      try {
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, targetEmail, cleanPassword);
        } catch (signInErr: any) {
          // Automatic seamless bootstrap creation for primary administrator on first login
          if (
            isRootAdmin &&
            (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential')
          ) {
            userCredential = await createUserWithEmailAndPassword(auth, targetEmail, cleanPassword);
            await updateProfile(userCredential.user, { displayName: 'Primary Administrator (03703513251)' });
            try {
              await setDoc(doc(db, 'admins', userCredential.user.uid), {
                id: userCredential.user.uid,
                identifier: '03703513251',
                email: targetEmail,
                grantedBy: 'Root System Owner',
                createdAt: new Date().toISOString(),
              });
            } catch {
              // ignore
            }
          } else {
            throw signInErr;
          }
        }

        const tokenResult = await userCredential.user.getIdTokenResult(true);
        const hasCustomClaim = Boolean(tokenResult.claims && tokenResult.claims.admin === true);
        const hasAdminClaim = hasCustomClaim || isRootAdmin || isIdentifierAdmin(targetEmail, userCredential.user.uid);

        const verifiedUser: User = {
          id: userCredential.user.uid,
          fullName: userCredential.user.displayName || (hasAdminClaim ? 'Clinic Administrator' : 'Patient'),
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

        return { success: true, isAdmin: hasAdminClaim };
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
      const demoAccount = DEMO_SANDBOX_ACCOUNTS[rawInput] || (isRootAdmin ? DEMO_SANDBOX_ACCOUNTS['03703513251'] : null);
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
        return { success: true, isAdmin: Boolean(demoAccount.isAdmin) };
      }
      return {
        success: false,
        error: 'Demo Mode: Use 03703513251 for Admin access.',
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

        const isUserAdmin = isIdentifierAdmin(rawInput);
        const verifiedUser: User = {
          id: userCredential.user.uid,
          fullName: fullName.trim(),
          email: userCredential.user.email || '',
          isAdmin: isUserAdmin,
        };

        localStorage.setItem('aftab_clinic_user', JSON.stringify(verifiedUser));
        setAuthState({
          user: verifiedUser,
          isAuthenticated: true,
          isLoading: false,
          isAdmin: isUserAdmin,
        });

        return { success: true, isAdmin: isUserAdmin };
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
    if (isLiveFirebaseConfigured()) {
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
    }

    purgeAllReportDataOnLogout();
    localStorage.removeItem('aftab_clinic_user');
    sessionStorage.clear();

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
    });
  };

  /**
   * Admin Privilege Delegation: Grant administrator access to any phone number or email
   */
  const grantAdminRole = async (targetIdentifier: string): Promise<{ success: boolean; error?: string }> => {
    if (!authState.isAdmin) {
      return { success: false, error: 'Unauthorized: Only an active Administrator can grant admin privileges.' };
    }
    const cleanId = targetIdentifier.trim();
    if (!cleanId) {
      return { success: false, error: 'Please enter a valid phone number or email address.' };
    }
    const targetEmail = resolveFirebaseEmail(cleanId);
    const docId = 'adm_' + cleanId.replace(/[^a-zA-Z0-9]/g, '_');
    const now = new Date().toISOString();

    const record: AdminRecord = {
      id: docId,
      identifier: cleanId,
      email: targetEmail,
      grantedBy: authState.user?.fullName || authState.user?.email || 'Administrator',
      createdAt: now,
    };

    try {
      if (isLiveFirebaseConfigured()) {
        await setDoc(doc(db, 'admins', docId), record);
      }
      const updated = [record, ...adminsList.filter((a) => a.id !== docId)];
      setAdminsList(updated);
      try {
        localStorage.setItem('aftab_clinic_admins', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to grant admin privileges in Firestore.' };
    }
  };

  /**
   * Admin Privilege Delegation: Revoke administrator access
   */
  const revokeAdminRole = async (docId: string): Promise<{ success: boolean; error?: string }> => {
    if (!authState.isAdmin) {
      return { success: false, error: 'Unauthorized: Only an active Administrator can revoke admin privileges.' };
    }
    const target = adminsList.find((a) => a.id === docId);
    if (
      target &&
      (target.identifier === '03703513251' ||
        target.email.includes('03703513251') ||
        ROOT_ADMIN_IDENTIFIERS.includes(target.email))
    ) {
      return { success: false, error: 'Access Denied: Cannot revoke privileges of the Primary Root Administrator (03703513251).' };
    }

    try {
      if (isLiveFirebaseConfigured()) {
        await deleteDoc(doc(db, 'admins', docId));
      }
      const updated = adminsList.filter((a) => a.id !== docId);
      setAdminsList(updated);
      try {
        localStorage.setItem('aftab_clinic_admins', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to revoke admin privileges in Firestore.' };
    }
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
        adminsList,
        grantAdminRole,
        revokeAdminRole,
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
