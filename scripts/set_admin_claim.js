/**
 * Server-Side Script: Assign Admin Custom Claims
 * 
 * Usage:
 *   node scripts/set_admin_claim.js <TARGET_UID_OR_EMAIL>
 * 
 * Requirements:
 *   - Service account key in GOOGLE_APPLICATION_CREDENTIALS or local serviceAccountKey.json
 *   - Never executed in client browser.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

const targetIdentifier = process.argv[2];

if (!targetIdentifier) {
  console.error('Error: Please provide target UID or email as an argument.');
  console.error('Example: node scripts/set_admin_claim.js admin@aftabclinic.com');
  process.exit(1);
}

// Check for service account key
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve('./serviceAccountKey.json');
let adminApp;

if (fs.existsSync(keyPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  adminApp = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  // If no local key file, initialize with default project credentials (e.g. Cloud Shell / Cloud Functions)
  try {
    adminApp = initializeApp();
  } catch (e) {
    console.error('Could not initialize Firebase Admin SDK. Please set GOOGLE_APPLICATION_CREDENTIALS or place serviceAccountKey.json in the project root.');
    console.error(e.message);
    process.exit(1);
  }
}

const auth = getAuth(adminApp);

async function setAdminClaim() {
  try {
    let uid = targetIdentifier;
    if (targetIdentifier.includes('@')) {
      const user = await auth.getUserByEmail(targetIdentifier);
      uid = user.uid;
    }

    await auth.setCustomUserClaims(uid, { admin: true });
    console.log(`✅ Success: Custom claim { admin: true } assigned to user UID: ${uid}`);
    
    // Verify
    const updatedUser = await auth.getUser(uid);
    console.log('Current claims:', updatedUser.customClaims);
  } catch (err) {
    console.error('Failed to set admin claim:', err.message);
    process.exit(1);
  }
}

setAdminClaim();
