# 🔴 URGENT : Activer Firebase Storage

L'erreur `storage/unauthorized` indique que **Firebase Storage n'est pas activé** dans votre projet Firebase.

## ⚡ Étapes pour activer Firebase Storage (2 minutes)

### 1. Accéder à Firebase Console
👉 [Cliquez ici pour ouvrir Firebase Storage](https://console.firebase.google.com/project/studio-3821305079-74f59/storage)

### 2. Activer Storage
1. Sur la page Storage, cliquez sur **"Get Started"** ou **"Commencer"**
2. Choisissez le mode :
   - **Test mode** (recommandé pour le développement) - permet l'accès sans authentification pendant 30 jours
   - **Production mode** (pour la production) - nécessite des règles de sécurité strictes
3. Sélectionnez un **emplacement** pour votre bucket :
   - Choisissez la région la plus proche de vos utilisateurs
   - Exemple : `us-central1`, `europe-west1`, etc.
4. Cliquez sur **"Done"** ou **"Terminé"**

### 3. Déployer les règles de sécurité
Une fois Storage activé, exécutez cette commande dans le terminal :

```bash
firebase deploy --only storage:rules
```

Ou si vous préférez, les règles seront automatiquement appliquées après activation.

## ✅ Vérification

Après activation :
- ✅ Les fichiers peuvent être uploadés dans `posts/{userId}/`
- ✅ Seuls les utilisateurs authentifiés peuvent uploader
- ✅ Chaque utilisateur ne peut uploader que dans son propre dossier
- ✅ Limite de 50MB par fichier

## 📝 Note importante

- **Test mode** : Permet l'accès pendant 30 jours, puis nécessite des règles de sécurité
- **Production mode** : Nécessite des règles de sécurité dès le début (déjà configurées dans `storage.rules`)

## 🔗 Liens utiles

- [Firebase Console - Storage](https://console.firebase.google.com/project/studio-3821305079-74f59/storage)
- [Documentation Firebase Storage](https://firebase.google.com/docs/storage)

