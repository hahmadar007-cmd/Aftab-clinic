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

// Firebase Project Configuration (Environment variables with default demo fallback)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAFTABCLINIC_DEMO_KEY_2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aftab-clinic.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aftab-clinic",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aftab-clinic.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "789012345678",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:789012345678:web:abcdef123456789",
};

// Initialize Firebase App instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db: Firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Check if live Firebase cloud database is connected
export const isFirebaseConfigured = (): boolean => {
  return (
    Boolean(import.meta.env.VITE_FIREBASE_API_KEY) &&
    Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID)
  );
};

/**
 * Upload prescription file to Firebase Cloud Storage bucket
 */
export const uploadPrescriptionCloud = async (file: File, bookingId: string): Promise<string> => {
  try {
    const fileRef = ref(storage, `prescriptions/${bookingId}_${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(fileRef);
    return downloadUrl;
  } catch (error) {
    console.warn('Firebase Storage upload notice (Using local preview fallback):', error);
    return URL.createObjectURL(file);
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
        console.warn(`Firestore collection "${collectionName}" notice (Using local state):`, err.message);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn(`Firestore initialization notice for "${collectionName}":`, err.message);
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
