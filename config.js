import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth/react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyCIHDrMYARI0x7_AHRH9S1h6FXC68BpDpU',
  authDomain: 'smartspend-4e105.firebaseapp.com',
  projectId: 'smartspend-4e105',
  storageBucket: 'smartspend-4e105.appspot.com',
  messagingSenderId: '658959687441',
  appId: '1:658959687441:web:b127b5861c1f2204d4f6b0',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export { auth, db };
