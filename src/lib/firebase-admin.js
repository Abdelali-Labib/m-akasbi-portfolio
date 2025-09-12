import admin from 'firebase-admin';

let dbAdmin = null;

try {
  if (!admin.apps.length) {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (raw) {
      const serviceAccount = JSON.parse(raw);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }
  if (admin.apps.length) {
    dbAdmin = admin.firestore();
  }
} catch (_) {
  dbAdmin = null;
}

export { dbAdmin };