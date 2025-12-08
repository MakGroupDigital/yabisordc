# 🔧 Configuration Firebase pour l'Authentification par Téléphone

## ⚠️ Erreur `auth/invalid-app-credential`

Cette erreur indique que la configuration Firebase pour l'authentification par téléphone n'est pas complète.

## 📋 Étapes de Configuration

### 1. Activer l'Authentification par Téléphone

1. Allez dans [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet : `studio-3821305079-74f59`
3. Allez dans **Authentication** > **Sign-in method**
4. Cliquez sur **Phone**
5. Activez le toggle **Enable**
6. Cliquez sur **Save**

### 2. Configurer reCAPTCHA

1. Dans **Authentication** > **Settings** > **reCAPTCHA**
2. Vérifiez que **reCAPTCHA v3** est activé
3. Si nécessaire, configurez les domaines autorisés

### 3. Autoriser les Domaines

1. Dans **Authentication** > **Settings** > **Authorized domains**
2. Ajoutez votre domaine si ce n'est pas déjà fait :
   - `localhost` (pour le développement)
   - Votre domaine de production (ex: `votre-app.web.app`)
   - Tous les domaines Firebase Hosting associés

### 4. Vérifier la Configuration de l'Application

1. Allez dans **Project Settings** > **General**
2. Vérifiez que votre application web est bien enregistrée
3. Vérifiez que les credentials Firebase correspondent :
   - `apiKey`: `AIzaSyB_ySRXw-ejKoICMYmMSmnpBLhYKnwSB9w`
   - `authDomain`: `studio-3821305079-74f59.firebaseapp.com`
   - `projectId`: `studio-3821305079-74f59`

### 5. Quotas et Limites

1. Vérifiez les quotas SMS dans **Authentication** > **Usage**
2. Le plan gratuit Firebase permet un nombre limité de SMS par jour
3. Pour la production, envisagez d'upgrader vers le plan Blaze (pay-as-you-go)

## 🔍 Vérification

Après avoir effectué ces étapes :

1. Rafraîchissez votre application
2. Essayez de vous connecter avec un numéro de téléphone
3. Vérifiez la console du navigateur pour les logs
4. Si l'erreur persiste, vérifiez :
   - Que le domaine est bien autorisé
   - Que reCAPTCHA est bien configuré
   - Que l'authentification par téléphone est activée

## 📝 Format du Numéro de Téléphone

Le numéro doit être au format international :
- ✅ Correct : `+243900000000` ou `+243 900 000 000`
- ❌ Incorrect : `0900000000` ou `900000000`

## 🆘 Dépannage

### Erreur : `auth/invalid-app-credential`
- Vérifiez que l'authentification par téléphone est activée
- Vérifiez que votre domaine est autorisé
- Vérifiez que reCAPTCHA est configuré

### Erreur : `auth/recaptcha-not-enabled`
- Activez reCAPTCHA dans Firebase Console
- Vérifiez la configuration des domaines

### Erreur : `auth/quota-exceeded`
- Vous avez atteint la limite de SMS gratuits
- Attendez 24h ou upgradez vers le plan Blaze

### Le code SMS n'arrive pas
- Vérifiez que le numéro est au format international
- Vérifiez les quotas SMS dans Firebase Console
- Attendez quelques minutes et réessayez

## 🔗 Liens Utiles

- [Documentation Firebase Phone Auth](https://firebase.google.com/docs/auth/web/phone)
- [Configuration reCAPTCHA](https://firebase.google.com/docs/auth/web/phone-auth#set-up-recaptcha-verifier)
- [Firebase Console](https://console.firebase.google.com/)

