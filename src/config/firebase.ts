import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  Firestore,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const rawProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Strict configuration status
export const isLiveFirebaseConfigured = (): boolean => {
  return Boolean(
    rawApiKey &&
    !rawApiKey.includes('DEMO_KEY') &&
    rawProjectId &&
    !rawProjectId.includes('demo')
  );
};

// Explicit demo mode allowed only in development or if explicitly enabled
export const isDemoModeActive = (): boolean => {
  if (import.meta.env.PROD) {
    return false; // Production must NEVER silently fall back to demo mode
  }
  return import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' || !isLiveFirebaseConfigured();
};

// Production configuration error check
export const isProductionMisconfigured = (): boolean => {
  return import.meta.env.PROD && !isLiveFirebaseConfigured();
};

// Firebase Project Configuration
const firebaseConfig = {
  apiKey: rawApiKey || "AIzaSyAFTABCLINIC_DEMO_KEY_2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aftab-clinic.firebaseapp.com",
  projectId: rawProjectId || "aftab-clinic",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aftab-clinic.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "789012345678",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:789012345678:web:abcdef123456789",
};

// Initialize Firebase App instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db: Firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export const isFirebaseConfigured = (): boolean => isLiveFirebaseConfigured();

/**
 * Upload prescription file to Firebase Cloud Storage bucket
 * Strictly bound to user's UID path: /prescriptions/{userId}/{bookingId}_{filename}
 */
export const uploadPrescriptionCloud = async (
  file: File,
  userId: string,
  bookingId: string
): Promise<string> => {
  if (!userId) {
    throw new Error('Authentication required: Prescription upload must be associated with a valid patient account.');
  }

  // Client-side validation matching storage.rules
  const maxBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxBytes) {
    throw new Error('Prescription file size exceeds maximum limit of 10 MB.');
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file format. Prescriptions must be in PDF, JPG, PNG, or WEBP format.');
  }

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileRef = ref(storage, `prescriptions/${userId}/${bookingId}_${safeName}`);
    await uploadBytes(fileRef, file, {
      contentType: file.type,
      customMetadata: {
        userId,
        bookingId,
        uploadedAt: new Date().toISOString(),
      },
    });
    const downloadUrl = await getDownloadURL(fileRef);
    return downloadUrl;
  } catch (error: any) {
    if (isDemoModeActive()) {
      console.warn('Development demo fallback for prescription preview:', error?.message);
      return URL.createObjectURL(file);
    }
    throw error;
  }
};

/**
 * Real-time Firestore Collection Listener Helper
 */
export const listenToCollection = <T>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (err: Error) => void
) => {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef);
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
        onData(items);
      },
      (err) => {
        console.warn(`Firestore collection "${collectionName}" notice:`, err.message);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn(`Firestore listener setup notice for "${collectionName}":`, err.message);
    return () => {};
  }
};

/**
 * Create or update document in Firestore Cloud
 */
export const saveFirestoreDoc = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.warn(`Firestore write notice for "${collectionName}/${docId}":`, err);
  }
};

/**
 * Update document fields in Firestore Cloud
 */
export const updateFirestoreDoc = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  } catch (err) {
    console.warn(`Firestore update notice for "${collectionName}/${docId}":`, err);
  }
};

/**
 * Delete document from Firestore Cloud
 */
export const deleteFirestoreDoc = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Firestore delete notice for "${collectionName}/${docId}":`, err);
  }
};
