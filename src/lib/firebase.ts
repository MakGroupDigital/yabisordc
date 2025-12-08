import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuration Firebase - Projet avec les posts existants
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
// Initialiser Firestore avec gestion d'erreur améliorée
const db = getFirestore(app);
// Initialiser Storage avec le bucket du projet
const storage = getStorage(app, firebaseConfig.storageBucket);

// Configuration Firestore pour améliorer la connexion et réduire les erreurs
if (typeof window !== 'undefined') {
  // Activer la persistance en cache pour le mode offline
  import('firebase/firestore').then(({ enableIndexedDbPersistence }) => {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Plusieurs onglets ouverts, c'est normal
      } else if (err.code === 'unimplemented') {
        // Non supporté par ce navigateur, c'est normal
      } else {
        // Autres erreurs, on les ignore silencieusement
      }
    });
  }).catch(() => {
    // Ignorer si enableIndexedDbPersistence n'est pas disponible
  });

  // Réduire le bruit des erreurs de connexion Firestore
  // Ces erreurs sont normales en cas de connexion lente et Firestore fonctionne en mode offline
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Filtrer les erreurs Firestore de connexion qui sont normales
    const message = args[0]?.toString() || '';
    if (
      message.includes('Could not reach Cloud Firestore backend') ||
      message.includes('Backend didn\'t respond within') ||
      message.includes('operate in offline mode')
    ) {
      // Ne pas afficher ces erreurs - c'est normal et Firestore fonctionne en mode offline
      return;
    }
    // Afficher toutes les autres erreurs normalement
    originalError.apply(console, args);
  };
}

// Log pour vérifier l'initialisation
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase initialisé:', {
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    authDomain: firebaseConfig.authDomain,
    storageInitialized: !!storage,
    dbInitialized: !!db,
    authInitialized: !!auth
  });
}

export { app, auth, db, storage };
