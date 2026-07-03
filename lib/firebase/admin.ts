import 'server-only';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const formatPrivateKey = (key?: string) => key?.replace(/\\n/g, '\n');

const getFirebaseProjectId = () =>
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  'mycloud-7e1be';

const getServiceAccountCredential = () => {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    return null;
  }

  const serviceAccount = JSON.parse(serviceAccountKey) as {
    client_email?: string;
    private_key?: string;
    project_id?: string;
  };

  if (
    !serviceAccount.client_email ||
    !serviceAccount.private_key ||
    !serviceAccount.project_id
  ) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY must include client_email, private_key, and project_id.'
    );
  }

  return cert({
    clientEmail: serviceAccount.client_email,
    privateKey: formatPrivateKey(serviceAccount.private_key),
    projectId: serviceAccount.project_id,
  });
};

export const hasExplicitFirebaseAdminCredentials = Boolean(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
  (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
);

export const hasFirebaseAdminCredentials = Boolean(
  hasExplicitFirebaseAdminCredentials ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);

const getFirebaseAdminApp = () => {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  const projectId = getFirebaseProjectId();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const serviceAccountCredential = getServiceAccountCredential();

  if (serviceAccountCredential) {
    return initializeApp({
      credential: serviceAccountCredential,
      projectId,
    });
  }

  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  }

  return initializeApp({ projectId });
};

export const firebaseAdminAuth = getAuth(getFirebaseAdminApp());
export const firebaseAdminDb = getFirestore(getFirebaseAdminApp());
