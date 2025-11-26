# Guide : Activer l'authentification par téléphone dans Firebase

L'erreur `auth/operation-not-allowed` signifie que l'authentification par téléphone n'est pas activée dans votre projet Firebase.

## Étapes pour activer l'authentification par téléphone

### 1. Accéder à la console Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet : **studio-3821305079-74f59**

### 2. Activer l'authentification par téléphone

1. Dans le menu de gauche, cliquez sur **Authentication** (Authentification)
2. Cliquez sur l'onglet **Sign-in method** (Méthodes de connexion)
3. Dans la liste des fournisseurs, trouvez **Phone** (Téléphone)
4. Cliquez sur **Phone** pour l'ouvrir
5. Activez le toggle **Enable** (Activer)
6. Cliquez sur **Save** (Enregistrer)

### 3. Configuration pour la RDC (optionnel)

Pour la République Démocratique du Congo, vous pouvez configurer :
- **Format du numéro** : +243 (code pays de la RDC)
- **Test phone numbers** : Vous pouvez ajouter des numéros de test pour le développement

### 4. Vérification

Une fois activé, vous devriez voir **Phone** avec un statut "Enabled" dans la liste des méthodes de connexion.

## Note importante

- L'authentification par téléphone nécessite un plan Firebase Blaze (payant) pour fonctionner en production
- En mode test/développement, vous pouvez utiliser des numéros de test configurés dans Firebase Console
- Les SMS réels sont facturés par Firebase

## Alternative pour le développement

Si vous ne pouvez pas activer l'authentification par téléphone immédiatement, vous pouvez :
1. Utiliser des numéros de test configurés dans Firebase Console
2. Ou utiliser temporairement l'authentification par email/mot de passe pour tester

## Liens utiles

- [Documentation Firebase Phone Auth](https://firebase.google.com/docs/auth/web/phone-auth)
- [Console Firebase - Authentication](https://console.firebase.google.com/project/studio-3821305079-74f59/authentication/providers)

