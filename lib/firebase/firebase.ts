// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: 'AIzaSyCWb_6T6yS_f8-DYom5naySe6_e_ldNN3c',
  authDomain: 'mycloud-7e1be.firebaseapp.com',
  projectId: 'mycloud-7e1be',
  storageBucket: 'mycloud-7e1be.firebasestorage.app',
  messagingSenderId: '37630835105',
  appId: '1:37630835105:web:5a30ff97de8e94d619b3e0',
  measurementId: 'G-89LDTFJ8T4',
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };
