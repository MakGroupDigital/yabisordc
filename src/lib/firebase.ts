import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDAZAE7QuDpyEZt9L_yDHK2JQ0DttgTqE0",
  authDomain: "ya-biso-app-m8378v.firebaseapp.com",
  projectId: "ya-biso-app-m8378v",
  storageBucket: "ya-biso-app-m8378v.appspot.com",
  messagingSenderId: "832289923317",
  appId: "1:832289923317:web:88103097bb7f53604165bc"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
