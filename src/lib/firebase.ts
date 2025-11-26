import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB_ySRXw-ejKoICMYmMSmnpBLhYKnwSB9w",
  authDomain: "studio-3821305079-74f59.firebaseapp.com",
  projectId: "studio-3821305079-74f59",
  storageBucket: "studio-3821305079-74f59.firebasestorage.app",
  messagingSenderId: "832016559824",
  appId: "1:832016559824:web:7abf29b6ab35547950f8d5"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
// Initialiser Storage avec le bucket explicite
const storage = getStorage(app, firebaseConfig.storageBucket);

export { app, auth, db, storage };
