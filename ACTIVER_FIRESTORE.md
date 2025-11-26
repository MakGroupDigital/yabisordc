# Activer Firestore Database

L'erreur "Could not reach Cloud Firestore backend" indique que **Firestore n'est pas activé** dans votre projet Firebase.

## ⚡ Étapes pour activer Firestore (2 minutes)

### 1. Accéder à Firebase Console
👉 [Cliquez ici pour ouvrir Firestore](https://console.firebase.google.com/project/studio-3821305079-74f59/firestore)

### 2. Activer Firestore
1. Sur la page Firestore, cliquez sur **"Create database"** ou **"Créer une base de données"**
2. Choisissez le mode :
   - **Start in test mode** (recommandé pour le développement) - permet l'accès pendant 30 jours
   - **Start in production mode** (pour la production) - nécessite des règles de sécurité strictes
3. Sélectionnez un **emplacement** pour votre base de données :
   - Choisissez la région la plus proche de vos utilisateurs
   - Exemple : `nam5 (us-central)`, `europe-west1`, etc.
4. Cliquez sur **"Enable"** ou **"Activer"**

### 3. Vérifier les règles
Une fois Firestore activé, les règles dans `firestore.rules` seront automatiquement appliquées.

## ✅ Vérification

Après activation :
- ✅ Les publications peuvent être créées dans la collection `posts`
- ✅ Les publications peuvent être lues
- ✅ Les règles de sécurité sont appliquées

## 📝 Note importante

- **Test mode** : Permet l'accès pendant 30 jours, puis nécessite des règles de sécurité
- **Production mode** : Nécessite des règles de sécurité dès le début (déjà configurées dans `firestore.rules`)

## 🔗 Liens utiles

- [Firebase Console - Firestore](https://console.firebase.google.com/project/studio-3821305079-74f59/firestore)
- [Documentation Firestore](https://firebase.google.com/docs/firestore)

