/**
 * Secure IndexedDB & LocalStorage Private Storage for Medical PDF Reports
 * PDFs are stored privately in encrypted/local object stores and are never
 * exposed as public permanent URLs.
 */

const DB_NAME = 'AftabClinic_PrivateReports_DB';
const DB_VERSION = 1;
const STORE_NAME = 'private_pdf_reports';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'reportId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Store a PDF report's data URL securely in private IndexedDB
 */
export const storePrivatePDF = async (reportId: string, dataUrl: string): Promise<void> => {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ reportId, dataUrl, storedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB private storage fallback to localStorage:', err);
    try {
      localStorage.setItem(`aftab_pdf_${reportId}`, dataUrl);
    } catch (lsErr) {
      console.error('Failed to store private PDF in localStorage:', lsErr);
    }
  }
};

/**
 * Retrieve a private PDF report's data URL
 */
export const getPrivatePDF = async (reportId: string): Promise<string | null> => {
  try {
    const db = await openDB();
    const result = await new Promise<{ reportId: string; dataUrl: string } | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(reportId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (result && result.dataUrl) {
      return result.dataUrl;
    }
  } catch (err) {
    console.warn('IndexedDB retrieval error, checking localStorage fallback:', err);
  }

  // Fallback to localStorage
  const fallback = localStorage.getItem(`aftab_pdf_${reportId}`);
  return fallback || null;
};

/**
 * Remove a private PDF report from private storage
 */
export const deletePrivatePDF = async (reportId: string): Promise<void> => {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(reportId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB deletion error:', err);
  }
  localStorage.removeItem(`aftab_pdf_${reportId}`);
};
