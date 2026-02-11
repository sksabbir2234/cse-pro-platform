import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyB7wsNGTb-9AxQhmDMRowes3i4BMYxkIiI",
  authDomain: "personal--blog.firebaseapp.com",
  projectId: "personal--blog",
  storageBucket: "personal--blog.firebasestorage.app",
  messagingSenderId: "778341126134",
  appId: "1:778341126134:web:c8d9f85f52c355261b81d7",
  measurementId: "G-G08P9EMH2P"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'cse-ultimate-tabs-v1'; // This is your internal app identifier
export const apiKey = firebaseConfig.apiKey; // Used for Gemini calls