import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut, onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Data Connect Initialization
export const dataconnect = getDataConnect(app, {
  location: import.meta.env.VITE_FIREBASE_DATACONNECT_LOCATION || 'us-central1',
  service: import.meta.env.VITE_FIREBASE_DATACONNECT_SERVICE_ID,
  connector: import.meta.env.VITE_FIREBASE_DATACONNECT_CONNECTOR_ID,
});

if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_DATACONNECT_EMULATOR_HOST) {
  connectDataConnectEmulator(dataconnect, 'localhost', 9399);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export { signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult };
export type { User };
