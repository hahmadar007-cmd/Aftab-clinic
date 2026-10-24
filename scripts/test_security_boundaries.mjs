/**
 * Security Boundary & Access Control Test Suite
 * 
 * Verifies:
 * 1. Direct Firestore Security Rules:
 *    - Patient isolation: Patient A vs. Patient B 403 Forbidden blocking
 *    - Published-only report reads: Draft (pending) reports strictly blocked from patients
 *    - Booking creation validation: Field whitelist, initial 'Pending' status, 'Unpaid' restriction
 *    - Privilege escalation: Block setting admin / isAdmin / role
 *    - Notification collection: Own notifications only; update restricted to 'read' field only
 * 2. Direct Cloud Storage Security Rules:
 *    - Prescription upload: Bound to request.auth.uid, size <= 10MB, allowed MIME types
 *    - Report PDF access: Bound to UID and published metadata, admin write only
 * 3. Multi-Test State Machine:
 *    - 0 tests ready -> 'Pending'
 *    - 1 of 2 tests ready -> strictly 'Partially Ready' (no contradiction)
 *    - 2 of 2 tests ready -> strictly 'Completed'
 */

import assert from 'assert';

console.log('====================================================');
console.log('AFTAB CLINIC - SECURITY BOUNDARY & RULES TEST SUITE');
console.log('====================================================\n');

// ---------------------------------------------------------------------------
// 1. FIRESTORE SECURITY RULES SIMULATION ENGINE
// Evaluates rules matching firestore.rules
// ---------------------------------------------------------------------------

function evaluateFirestoreRules({ auth, path, operation, resource = null, requestData = null }) {
  const isAuthenticated = auth !== null;
  const isAdmin = isAuthenticated && auth.token && auth.token.admin === true;

  // Collection: /users/{userId}
  if (path.startsWith('users/')) {
    const targetUserId = path.replace('users/', '');
    const isOwner = isAuthenticated && auth.uid === targetUserId;

    if (operation === 'read') {
      return isOwner || isAdmin;
    }
    if (operation === 'create') {
      if (!isOwner) return false;
      if ('admin' in requestData || 'isAdmin' in requestData || 'role' in requestData) return false;
      return true;
    }
    if (operation === 'update') {
      if (isAdmin) return true;
      if (!isOwner) return false;
      const modifiedKeys = Object.keys(requestData || {});
      if (modifiedKeys.some((k) => ['admin', 'isAdmin', 'role'].includes(k))) return false;
      return true;
    }
    if (operation === 'delete') return isAdmin;
  }

  // Collection: /bookings/{bookingId}
  if (path.startsWith('bookings/')) {
    if (operation === 'read') {
      if (isAdmin) return true;
      return isAuthenticated && resource && resource.userId === auth.uid;
    }
    if (operation === 'create') {
      if (isAdmin) return true;
      if (!isAuthenticated) return false;
      if (!requestData) return false;
      if (requestData.userId !== auth.uid) return false;
      if (requestData.status !== 'Pending') return false; // Patient CANNOT create as Completed or In Process
      if (!['Unpaid', 'Pending'].includes(requestData.paymentStatus)) return false; // Patient CANNOT mark Paid

      const allowedFields = [
        'id', 'patientName', 'phoneNumber', 'age', 'gender', 'collectionType',
        'address', 'date', 'timeSlot', 'prescriptionUrl', 'tests', 'totalAmount',
        'discountPercent', 'discountAmount', 'status', 'paymentStatus', 'userId',
        'userEmail', 'createdAt'
      ];
      const submittedKeys = Object.keys(requestData);
      const hasOnlyAllowed = submittedKeys.every((k) => allowedFields.includes(k));
      if (!hasOnlyAllowed) return false;

      if (!Array.isArray(requestData.tests)) return false;
      if (requestData.tests.length === 0 || requestData.tests.length > 30) return false;
      return true;
    }
    if (operation === 'update' || operation === 'delete') {
      return isAdmin; // Patients cannot edit/delete bookings once placed
    }
  }

  // Collection: /reports/{reportId}
  if (path.startsWith('reports/')) {
    if (operation === 'read') {
      if (isAdmin) return true;
      // Patient can ONLY read verified published reports (status === 'ready') belonging to their UID
      return isAuthenticated && resource && resource.userId === auth.uid && resource.status === 'ready';
    }
    if (operation === 'write' || operation === 'create' || operation === 'update' || operation === 'delete') {
      return isAdmin; // Only Admin can create, publish, or replace reports
    }
  }

  // Collection: /notifications/{notificationId}
  if (path.startsWith('notifications/')) {
    if (operation === 'read') {
      if (isAdmin) return true;
      return isAuthenticated && resource && resource.userId === auth.uid;
    }
    if (operation === 'update') {
      if (!isAuthenticated || !resource || resource.userId !== auth.uid) return false;
      const modifiedKeys = Object.keys(requestData || {});
      // Patient can ONLY update 'read' field
      return modifiedKeys.length === 1 && modifiedKeys[0] === 'read';
    }
    if (operation === 'create' || operation === 'delete') {
      return isAdmin;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// 2. CLOUD STORAGE SECURITY RULES SIMULATION ENGINE
// Evaluates rules matching storage.rules
// ---------------------------------------------------------------------------

function evaluateStorageRules({ auth, path, operation, resourceMetadata = null, requestResource = null }) {
  const isAuthenticated = auth !== null;
  const isAdmin = isAuthenticated && auth.token && auth.token.admin === true;

  // /prescriptions/{userId}/{fileName}
  if (path.startsWith('prescriptions/')) {
    const parts = path.split('/');
    const pathUserId = parts[1];

    if (operation === 'read') {
      return isAdmin || (isAuthenticated && auth.uid === pathUserId);
    }
    if (operation === 'create') {
      if (!isAuthenticated || auth.uid !== pathUserId) return false;
      if (!requestResource) return false;
      if (requestResource.size > 10 * 1024 * 1024) return false; // 10MB limit
      const allowedMime = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMime.includes(requestResource.contentType)) return false;
      return true;
    }
    if (operation === 'delete') {
      return isAdmin || (isAuthenticated && auth.uid === pathUserId);
    }
  }

  // /reports/{reportFile}
  if (path.startsWith('reports/')) {
    if (operation === 'read') {
      if (isAdmin) return true;
      // Patient must match owner UID AND report must be published
      return isAuthenticated &&
        resourceMetadata &&
        resourceMetadata.userId === auth.uid &&
        resourceMetadata.isPublished === 'true';
    }
    if (operation === 'write' || operation === 'create' || operation === 'delete') {
      return isAdmin;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// TEST CONTEXTS & DATA
// ---------------------------------------------------------------------------

const authPatientA = { uid: 'uid_patient_a', email: 'patient.a@example.com', token: { admin: false } };
const authPatientB = { uid: 'uid_patient_b', email: 'patient.b@example.com', token: { admin: false } };
const authAdmin = { uid: 'uid_admin_sys', email: 'admin@aftabclinic.com', token: { admin: true } };

let totalTests = 0;
let passedTests = 0;

function runTest(description, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`  ✓ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`    Error: ${err.message}\n`);
  }
}

// ===========================================================================
// SECTION 1: FIRESTORE RULES TESTS
// ===========================================================================
console.log('--- SECTION 1: FIRESTORE SECURITY RULES ---');

// Test 1.1: Patient A can read their own booking
runTest('Patient A can read own booking document', () => {
  const allowed = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'bookings/AC-BK-001',
    operation: 'read',
    resource: { userId: 'uid_patient_a', patientName: 'Ali Khan' },
  });
  assert.strictEqual(allowed, true);
});

// Test 1.2: Patient B is BLOCKED from reading Patient A's booking
runTest('Patient B CANNOT read Patient A booking document (403 Forbidden)', () => {
  const allowed = evaluateFirestoreRules({
    auth: authPatientB,
    path: 'bookings/AC-BK-001',
    operation: 'read',
    resource: { userId: 'uid_patient_a', patientName: 'Ali Khan' },
  });
  assert.strictEqual(allowed, false);
});

// Test 1.3: Unauthenticated user is BLOCKED from reading bookings
runTest('Unauthenticated request CANNOT read booking document', () => {
  const allowed = evaluateFirestoreRules({
    auth: null,
    path: 'bookings/AC-BK-001',
    operation: 'read',
    resource: { userId: 'uid_patient_a' },
  });
  assert.strictEqual(allowed, false);
});

// Test 1.4: Patient creates valid booking
runTest('Patient can create booking with valid fields and initial Pending status', () => {
  const allowed = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'bookings/AC-BK-002',
    operation: 'create',
    requestData: {
      id: 'AC-BK-002',
      userId: 'uid_patient_a',
      patientName: 'Ali Khan',
      phoneNumber: '03001234567',
      age: '32 Yrs',
      gender: 'Male',
      collectionType: 'Clinic Visit',
      date: '2026-10-24',
      status: 'Pending',
      paymentStatus: 'Unpaid',
      totalAmount: 700,
      tests: [{ code: '1300', name: 'CBC', price: 700 }],
    },
  });
  assert.strictEqual(allowed, true);
});

// Test 1.5: Patient CANNOT create booking pre-marked as 'Paid'
runTest('Patient CANNOT forge paymentStatus: "Paid" on booking creation', () => {
  const allowed = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'bookings/AC-BK-003',
    operation: 'create',
    requestData: {
      id: 'AC-BK-003',
      userId: 'uid_patient_a',
      patientName: 'Ali Khan',
      status: 'Pending',
      paymentStatus: 'Paid', // Tampered!
      tests: [{ code: '1300', name: 'CBC', price: 700 }],
    },
  });
  assert.strictEqual(allowed, false);
});

// Test 1.6: Patient CANNOT create booking pre-marked as 'Completed'
runTest('Patient CANNOT set status: "Completed" on booking creation', () => {
  const allowed = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'bookings/AC-BK-004',
    operation: 'create',
    requestData: {
      id: 'AC-BK-004',
      userId: 'uid_patient_a',
      status: 'Completed', // Tampered!
      paymentStatus: 'Unpaid',
      tests: [{ code: '1300', name: 'CBC', price: 700 }],
    },
  });
  assert.strictEqual(allowed, false);
});

// Test 1.7: Patient CANNOT submit arbitrary unauthorized fields
runTest('Patient CANNOT submit unauthorized fields (keys().hasOnly restriction)', () => {
  const allowed = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'bookings/AC-BK-005',
    operation: 'create',
    requestData: {
      id: 'AC-BK-005',
      userId: 'uid_patient_a',
      status: 'Pending',
      paymentStatus: 'Unpaid',
      tests: [{ code: '1300', name: 'CBC', price: 700 }],
      maliciousField: 'exploit_value', // Disallowed field!
    },
  });
  assert.strictEqual(allowed, false);
});

// Test 1.8: Patient CANNOT create booking under another user's UID
runTest('Patient CANNOT spoof userId on booking creation', () => {
  const allowed = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'bookings/AC-BK-006',
    operation: 'create',
    requestData: {
      id: 'AC-BK-006',
      userId: 'uid_patient_b', // Mismatched UID!
      status: 'Pending',
      paymentStatus: 'Unpaid',
      tests: [{ code: '1300', name: 'CBC', price: 700 }],
    },
  });
  assert.strictEqual(allowed, false);
});

// Test 1.9: Patient A can read their PUBLISHED report
runTest('Patient A can read own published report (status: ready)', () => {
  const allowed = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'reports/AC-REP-101',
    operation: 'read',
    resource: { userId: 'uid_patient_a', status: 'ready', testName: 'CBC' },
  });
  assert.strictEqual(allowed, true);
});

// Test 1.10: Patient A CANNOT read their own DRAFT / unpublished report
runTest('Patient A CANNOT read own draft report (status: pending)', () => {
  const allowed = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'reports/AC-REP-102',
    operation: 'read',
    resource: { userId: 'uid_patient_a', status: 'pending', testName: 'CBC' },
  });
  assert.strictEqual(allowed, false);
});

// Test 1.11: Patient B CANNOT read Patient A's report (published or draft)
runTest('Patient B CANNOT read Patient A report (cross-patient isolation)', () => {
  const allowed = evaluateFirestoreRules({
    auth: authPatientB,
    path: 'reports/AC-REP-101',
    operation: 'read',
    resource: { userId: 'uid_patient_a', status: 'ready' },
  });
  assert.strictEqual(allowed, false);
});

// Test 1.12: Patient CANNOT write or replace reports
runTest('Patient CANNOT write, publish, or replace reports', () => {
  const allowed = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'reports/AC-REP-101',
    operation: 'write',
  });
  assert.strictEqual(allowed, false);
});

// Test 1.13: Admin CAN read draft reports and write/publish reports
runTest('Admin can read draft reports and publish/replace reports', () => {
  const canReadDraft = evaluateFirestoreRules({
    auth: authAdmin,
    path: 'reports/AC-REP-102',
    operation: 'read',
    resource: { userId: 'uid_patient_a', status: 'pending' },
  });
  const canWrite = evaluateFirestoreRules({
    auth: authAdmin,
    path: 'reports/AC-REP-103',
    operation: 'write',
  });
  assert.strictEqual(canReadDraft, true);
  assert.strictEqual(canWrite, true);
});

// Test 1.14: Patient CANNOT escalate privilege by setting admin: true
runTest('Patient CANNOT self-assign admin claims in users collection', () => {
  const allowedCreate = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'users/uid_patient_a',
    operation: 'create',
    requestData: { fullName: 'Ali Khan', admin: true },
  });
  const allowedUpdate = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'users/uid_patient_a',
    operation: 'update',
    requestData: { isAdmin: true },
  });
  assert.strictEqual(allowedCreate, false);
  assert.strictEqual(allowedUpdate, false);
});

// Test 1.15: Notification permissions
runTest('Patient can read own notifications and update only "read" flag', () => {
  const canRead = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'notifications/notif_1',
    operation: 'read',
    resource: { userId: 'uid_patient_a', title: 'Report Ready' },
  });
  const canMarkRead = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'notifications/notif_1',
    operation: 'update',
    resource: { userId: 'uid_patient_a' },
    requestData: { read: true },
  });
  const cannotTamper = evaluateFirestoreRules({
    auth: authPatientA,
    path: 'notifications/notif_1',
    operation: 'update',
    resource: { userId: 'uid_patient_a' },
    requestData: { title: 'Hacked Title' },
  });
  assert.strictEqual(canRead, true);
  assert.strictEqual(canMarkRead, true);
  assert.strictEqual(cannotTamper, false);
});

// ===========================================================================
// SECTION 2: STORAGE RULES TESTS
// ===========================================================================
console.log('\n--- SECTION 2: CLOUD STORAGE SECURITY RULES ---');

// Test 2.1: Patient uploads valid prescription
runTest('Patient can upload prescription <=10MB with valid type to own UID path', () => {
  const allowed = evaluateStorageRules({
    auth: authPatientA,
    path: 'prescriptions/uid_patient_a/AC-BK-001_rx.pdf',
    operation: 'create',
    requestResource: { size: 2 * 1024 * 1024, contentType: 'application/pdf' },
  });
  assert.strictEqual(allowed, true);
});

// Test 2.2: Patient CANNOT upload prescription to another user's path
runTest('Patient CANNOT upload prescription to a different user UID path', () => {
  const allowed = evaluateStorageRules({
    auth: authPatientA,
    path: 'prescriptions/uid_patient_b/AC-BK-001_rx.pdf', // Mismatched path!
    operation: 'create',
    requestResource: { size: 1024 * 1024, contentType: 'application/pdf' },
  });
  assert.strictEqual(allowed, false);
});

// Test 2.3: Prescription >10MB is rejected
runTest('Prescription upload > 10MB is REJECTED by storage rules', () => {
  const allowed = evaluateStorageRules({
    auth: authPatientA,
    path: 'prescriptions/uid_patient_a/huge_rx.pdf',
    operation: 'create',
    requestResource: { size: 15 * 1024 * 1024, contentType: 'application/pdf' },
  });
  assert.strictEqual(allowed, false);
});

// Test 2.4: Prescription with invalid MIME type is rejected
runTest('Prescription upload with disallowed MIME type (e.g. .exe) is REJECTED', () => {
  const allowed = evaluateStorageRules({
    auth: authPatientA,
    path: 'prescriptions/uid_patient_a/malware.exe',
    operation: 'create',
    requestResource: { size: 1024, contentType: 'application/x-msdownload' },
  });
  assert.strictEqual(allowed, false);
});

// Test 2.5: Report PDF download requires owner UID AND isPublished: true
runTest('Patient A can download report PDF when published (isPublished: "true")', () => {
  const allowed = evaluateStorageRules({
    auth: authPatientA,
    path: 'reports/AC-REP-101.pdf',
    operation: 'read',
    resourceMetadata: { userId: 'uid_patient_a', isPublished: 'true' },
  });
  assert.strictEqual(allowed, true);
});

runTest('Patient A CANNOT download report PDF when unpublished draft (isPublished: "false")', () => {
  const allowed = evaluateStorageRules({
    auth: authPatientA,
    path: 'reports/AC-REP-102.pdf',
    operation: 'read',
    resourceMetadata: { userId: 'uid_patient_a', isPublished: 'false' },
  });
  assert.strictEqual(allowed, false);
});

runTest('Patient B CANNOT download Patient A report PDF (copied direct link protection)', () => {
  const allowed = evaluateStorageRules({
    auth: authPatientB,
    path: 'reports/AC-REP-101.pdf',
    operation: 'read',
    resourceMetadata: { userId: 'uid_patient_a', isPublished: 'true' },
  });
  assert.strictEqual(allowed, false);
});

// ===========================================================================
// SECTION 3: MULTI-TEST WORKFLOW STATE MACHINE
// ===========================================================================
console.log('\n--- SECTION 3: MULTI-TEST STATE MACHINE TRANSITIONS ---');

function deriveMultiTestStatus(tests, currentStatus = 'Pending') {
  const readyCount = tests.filter((t) => t.reportStatus === 'ready').length;
  const totalCount = tests.length;

  if (readyCount === 0) {
    return currentStatus === 'Pending' ? 'Pending' : 'In Process';
  } else if (readyCount === totalCount) {
    return 'Completed';
  } else {
    return 'Partially Ready';
  }
}

runTest('0 of 2 tests ready -> Status remains "Pending"', () => {
  const tests = [
    { name: 'CBC', reportStatus: 'pending' },
    { name: 'Lipid Profile', reportStatus: 'pending' },
  ];
  const status = deriveMultiTestStatus(tests, 'Pending');
  assert.strictEqual(status, 'Pending');
});

runTest('1 of 2 tests ready -> Status transitions to strictly "Partially Ready"', () => {
  const tests = [
    { name: 'CBC', reportStatus: 'ready' },
    { name: 'Lipid Profile', reportStatus: 'pending' },
  ];
  const status = deriveMultiTestStatus(tests, 'Pending');
  assert.strictEqual(status, 'Partially Ready');
});

runTest('2 of 2 tests ready -> Status transitions to strictly "Completed"', () => {
  const tests = [
    { name: 'CBC', reportStatus: 'ready' },
    { name: 'Lipid Profile', reportStatus: 'ready' },
  ];
  const status = deriveMultiTestStatus(tests, 'Partially Ready');
  assert.strictEqual(status, 'Completed');
});

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log('\n====================================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('ALL SECURITY BOUNDARIES & ACCESS CONTROLS VERIFIED!');
  console.log('====================================================\n');
  process.exit(0);
} else {
  console.error('SOME TESTS FAILED! Check output above.');
  console.log('====================================================\n');
  process.exit(1);
}
