const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  // Option 1: Using environment variable for service account
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || "tender-market-a6593",
      databaseURL:
        process.env.FIREBASE_DATABASE_URL ||
        "https://tender-market-a6593-default-rtdb.firebaseio.com",
    });
  }
  // Option 2: Using service account object (for development)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || "tender-market-a6593",
      databaseURL:
        process.env.FIREBASE_DATABASE_URL ||
        "https://your-project-id-default-rtdb.firebaseio.com",
    });
  }
  // Option 3: Default initialization (will look for credentials automatically)
  else {
    firebaseApp = admin.initializeApp();
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth,
  app: firebaseApp,
};
