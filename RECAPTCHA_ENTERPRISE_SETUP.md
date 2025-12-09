# Configuration reCAPTCHA Enterprise pour Firebase Phone Auth

## 🎯 Objectif

Autoriser les domaines de développement et de production dans reCAPTCHA Enterprise pour permettre l'authentification par téléphone.

## ❌ Erreur Résolue

```
Firebase: Hostname match not found (auth/captcha-check-failed)
```

Cette erreur signifie que le domaine actuel n'est pas autorisé dans la configuration reCAPTCHA Enterprise.

## 📋 Étapes de Configuration

### 1. Accéder à Google reCAPTCHA Enterprise Console

**URL directe :**
```
https://console.cloud.google.com/security/recaptcha?project=studio-3821305079-74f59
```

**Ou manuellement :**
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez le projet : **studio-3821305079-74f59**
3. Navigation : **Security** > **reCAPTCHA Enterprise**

### 2. Trouver votre clé reCAPTCHA

- Recherchez la clé avec le **Site Key** : `6LcmLSUsAAAAAOMudj7WEMUnOvHoRZo0JyORN3ia`
- Cliquez sur cette clé pour ouvrir ses paramètres

### 3. Ajouter les domaines autorisés

Dans la section **"Domains"** ou **"Domaines autorisés"**, ajoutez :

```
localhost
127.0.0.1
```

**Important pour la production :**
- Ajoutez aussi votre domaine de production (ex: `votre-app.firebaseapp.com`)
- Ajoutez tous les sous-domaines si nécessaire

### 4. Enregistrer et Attendre

1. Cliquez sur **"Save"** ou **"Enregistrer"**
2. Attendez **1-2 minutes** pour que les modifications soient propagées
3. Rafraîchissez votre application dans le navigateur

### 5. Tester

1. Ouvrez votre application sur `http://127.0.0.1:3000` (ou `http://localhost:3000`)
2. Allez sur la page d'authentification
3. Cliquez sur l'onglet "Téléphone"
4. Entrez un numéro de téléphone
5. Cliquez sur "Envoyer le code"

## 🔍 Vérification

### Vérifier que les domaines sont bien configurés :

1. Dans reCAPTCHA Enterprise Console, ouvrez votre clé
2. Vérifiez que la liste des domaines contient :
   - ✅ `localhost`
   - ✅ `127.0.0.1`
   - ✅ Votre domaine de production

### Vérifier dans la console du navigateur :

Ouvrez la console (F12) et recherchez :
- ✅ `✅ reCAPTCHA vérifié avec succès` (pas d'erreur)
- ❌ `auth/captcha-check-failed` (indique que le domaine n'est toujours pas autorisé)

## 📝 Notes Importantes

### Domaines locaux recommandés :

- **Préférez `127.0.0.1`** au lieu de `localhost` pour éviter les problèmes de résolution DNS
- Les deux doivent être ajoutés pour plus de flexibilité

### Domaines de production :

- Ajoutez votre domaine Firebase App Hosting
- Ajoutez votre domaine personnalisé si vous en avez un
- Exemple : `studio-3821305079-74f59.web.app`

### Propagation des changements :

- Les modifications peuvent prendre **1-2 minutes** à se propager
- Si l'erreur persiste, attendez quelques minutes et réessayez
- Videz le cache du navigateur si nécessaire (Ctrl+Shift+R ou Cmd+Shift+R)

## 🆘 Dépannage

### L'erreur persiste après avoir ajouté les domaines :

1. **Vérifiez l'orthographe** : Les domaines doivent être exacts (pas de `http://` ou `/`)
2. **Attendez plus longtemps** : Parfois jusqu'à 5 minutes
3. **Videz le cache** : Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)
4. **Vérifiez le projet** : Assurez-vous d'être dans le bon projet Google Cloud

### Le domaine de production ne fonctionne pas :

1. Ajoutez tous les variants :
   - `votre-app.web.app`
   - `votre-app.firebaseapp.com`
   - `www.votre-domaine.com` (si applicable)
   - `votre-domaine.com` (si applicable)

### Erreur "Site Key not found" :

- Vérifiez que la clé `6LcmLSUsAAAAAOMudj7WEMUnOvHoRZo0JyORN3ia` existe bien dans votre projet
- Vérifiez que vous êtes dans le bon projet Google Cloud

## 📚 Ressources

- [Documentation Firebase Phone Auth](https://firebase.google.com/docs/auth/web/phone-auth)
- [Documentation reCAPTCHA Enterprise](https://cloud.google.com/recaptcha-enterprise/docs)
- [Guide Firebase Console](https://console.firebase.google.com/project/studio-3821305079-74f59/authentication/providers)

## ✅ Checklist

- [ ] Accès à Google Cloud Console
- [ ] Projet correct sélectionné (studio-3821305079-74f59)
- [ ] Clé reCAPTCHA trouvée (6LcmLSUs...)
- [ ] Domaine `localhost` ajouté
- [ ] Domaine `127.0.0.1` ajouté
- [ ] Domaines de production ajoutés
- [ ] Modifications enregistrées
- [ ] Attendu 1-2 minutes
- [ ] Application testée avec succès



