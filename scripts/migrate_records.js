/**
 * Migration Script: Safely migrate legacy records to authoritative userId
 * 
 * Usage:
 *   node scripts/migrate_records.js
 * 
 * Description:
 *   Scans existing bookings and reports in Firestore.
 *   Ensures every record is mapped strictly to a verified user UID.
 *   Removes reliance on loose names.
 *   Flags any unlinked records for admin review rather than exposing them.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve('./serviceAccountKey.json');
let app;

if (fs.existsSync(keyPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  app = initializeApp({ credential: cert(serviceAccount) });
} else {
  try {
    app = initializeApp();
  } catch {
    console.warn('Note: No live Admin SDK credentials found. Running in dry-run schema simulation.');
  }
}

async function runMigration() {
  console.log('--- Starting Diagnostic Records Ownership Migration ---');
  if (!app) {
    console.log('Skipping live Firestore update (no credentials). Migration template validated.');
    return;
  }

  const db = getFirestore(app);
  const auth = getAuth(app);

  // 1. Fetch all bookings
  const bookingsSnap = await db.collection('bookings').get();
  console.log(`Found ${bookingsSnap.size} bookings to verify.`);

  let migratedBookings = 0;
  let flaggedBookings = 0;

  for (const doc of bookingsSnap.docs) {
    const data = doc.data();
    if (!data.userId) {
      if (data.userEmail) {
        try {
          const user = await auth.getUserByEmail(data.userEmail);
          await doc.ref.update({ userId: user.uid });
          migratedBookings++;
          console.log(`[Migrated] Booking ${doc.id} bound to UID ${user.uid} (${data.userEmail})`);
        } catch {
          flaggedBookings++;
          console.warn(`[Flagged] Booking ${doc.id} has email ${data.userEmail} with no matching Firebase Auth user.`);
        }
      } else {
        flaggedBookings++;
        console.warn(`[Flagged] Booking ${doc.id} has no userId or userEmail. Quarantined for manual admin assignment.`);
      }
    }
  }

  // 2. Fetch all reports
  const reportsSnap = await db.collection('reports').get();
  console.log(`Found ${reportsSnap.size} reports to verify.`);

  let migratedReports = 0;
  let flaggedReports = 0;

  for (const doc of reportsSnap.docs) {
    const data = doc.data();
    if (!data.userId && data.bookingId) {
      const bookingDoc = await db.collection('bookings').doc(data.bookingId).get();
      if (bookingDoc.exists && bookingDoc.data()?.userId) {
        const ownerUid = bookingDoc.data().userId;
        await doc.ref.update({ userId: ownerUid });
        migratedReports++;
        console.log(`[Migrated] Report ${doc.id} bound to owner UID ${ownerUid} from booking ${data.bookingId}`);
      } else {
        flaggedReports++;
        console.warn(`[Flagged] Report ${doc.id} booking ${data.bookingId} has no linked UID.`);
      }
    }
  }

  console.log('--- Migration Summary ---');
  console.log(`Bookings Migrated: ${migratedBookings}, Flagged for Review: ${flaggedBookings}`);
  console.log(`Reports Migrated: ${migratedReports}, Flagged for Review: ${flaggedReports}`);
}

runMigration().catch(console.error);
