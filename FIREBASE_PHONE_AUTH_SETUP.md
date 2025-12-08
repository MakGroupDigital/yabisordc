# 🔧 Configuration Firebase pour l'Authentification par Téléphone

## ⚠️ Erreur `auth/invalid-app-credential`

Cette erreur indique que la configuration Firebase pour l'authentification par téléphone n'est **PAS COMPLÈTE** ou **INCORRECTE**.

**Cette erreur est CRITIQUE et empêche l'authentification par téléphone de fonctionner.**

## 🚨 Action Immédiate Requise

Vous devez configurer Firebase Console **MAINTENANT** pour que l'authentification par téléphone fonctionne.

## 📋 Étapes de Configuration

### 1. Activer l'Authentification par Téléphone ⚠️ OBLIGATOIRE

1. Allez dans [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet : `studio-3821305079-74f59`
3. Allez dans **Authentication** (menu de gauche)
4. Cliquez sur l'onglet **Sign-in method**
5. Dans la liste des providers, trouvez **Phone** et cliquez dessus
6. **ACTIVEZ** le toggle **Enable** (il doit être vert/activé)
7. Cliquez sur **Save** en bas de la page
8. ⚠️ **VÉRIFIEZ** que le statut affiche "Enabled" (Activé)

**Si Phone n'apparaît pas dans la liste**, vous devez d'abord activer l'authentification dans votre projet.

### 2. Configurer reCAPTCHA ⚠️ OBLIGATOIRE

1. Dans **Authentication** > **Settings** (onglet en haut)
2. Allez dans la section **reCAPTCHA**
3. Vérifiez que **reCAPTCHA v3** est activé
4. Si vous voyez un message d'erreur, suivez les instructions pour configurer reCAPTCHA
5. ⚠️ **IMPORTANT** : reCAPTCHA doit être configuré AVANT d'utiliser l'authentification par téléphone

**Note** : Firebase utilise automatiquement reCAPTCHA v3 pour l'authentification par téléphone. Vous n'avez généralement pas besoin de le configurer manuellement, mais vous devez vous assurer qu'il n'est pas désactivé.

### 3. Autoriser les Domaines ⚠️ CRITIQUE

1. Dans **Authentication** > **Settings** (onglet en haut)
2. Allez dans la section **Authorized domains**
3. **VÉRIFIEZ** que les domaines suivants sont dans la liste :
   - ✅ `localhost` (pour le développement local)
   - ✅ Votre domaine de production (si vous en avez un)
   - ✅ Tous les domaines Firebase Hosting associés (ex: `votre-app.web.app`)

4. **Si votre domaine n'est PAS dans la liste** :
   - Cliquez sur **Add domain**
   - Entrez votre domaine (ex: `localhost` pour le dev, ou votre domaine de prod)
   - Cliquez sur **Add**
   - ⚠️ **SAUVEGARDEZ** les modifications

**⚠️ ATTENTION** : Si votre domaine actuel n'est pas dans la liste, l'authentification par téléphone **NE FONCTIONNERA PAS** et vous obtiendrez l'erreur `auth/invalid-app-credential`.

**Pour vérifier votre domaine actuel** : Regardez la barre d'adresse de votre navigateur. Si vous êtes sur `localhost:3000`, alors `localhost` doit être dans la liste.

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

## 🔍 Vérification Après Configuration

Après avoir effectué **TOUTES** les étapes ci-dessus :

1. **Rafraîchissez complètement votre application** (Ctrl+F5 ou Cmd+Shift+R)
2. **Videz le cache du navigateur** si nécessaire
3. Allez sur la page d'authentification
4. Cliquez sur l'onglet **Téléphone**
5. Entrez un numéro de téléphone au format international (ex: `+243900000000`)
6. Cliquez sur **Envoyer le code**
7. Vérifiez la console du navigateur pour les logs

### ✅ Si ça fonctionne :
- Vous devriez recevoir un SMS avec un code de vérification
- Le formulaire devrait passer à l'étape de saisie du code

### ❌ Si l'erreur persiste :
1. **Vérifiez dans Firebase Console** que :
   - ✅ Phone est bien **Enabled** (activé) dans Sign-in method
   - ✅ Votre domaine est dans **Authorized domains**
   - ✅ reCAPTCHA est configuré
2. **Vérifiez la console du navigateur** pour voir le domaine actuel
3. **Attendez 1-2 minutes** après avoir modifié la configuration Firebase (les changements peuvent prendre du temps à se propager)
4. **Rafraîchissez à nouveau** l'application

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

