# Configuration des Règles Firebase

## Problème identifié

L'upload de publications ne fonctionnait pas car les règles de sécurité Firestore et Storage n'étaient pas configurées.

## Fichiers créés

1. **`firestore.rules`** - Règles de sécurité pour Firestore
   - Autorise la lecture des posts à tous les utilisateurs authentifiés
   - Autorise la création de posts uniquement aux utilisateurs authentifiés
   - Vérifie que l'utilisateur est bien l'auteur du post
   - Autorise la mise à jour/suppression uniquement au propriétaire

2. **`storage.rules`** - Règles de sécurité pour Storage
   - Autorise la lecture des fichiers à tous les utilisateurs authentifiés
   - Autorise l'upload uniquement dans le dossier de l'utilisateur (`posts/{userId}/`)
   - Vérifie que les fichiers sont des images ou vidéos
   - Limite la taille des fichiers à 50 MB pour les posts, 5 MB pour les avatars

3. **`firebase.json`** - Mis à jour pour référencer les règles

## Déploiement des règles

### Option 1 : Via Firebase CLI (Recommandé)

```bash
# Installer Firebase CLI si ce n'est pas déjà fait
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Déployer les règles Firestore
firebase deploy --only firestore:rules

# Déployer les règles Storage
firebase deploy --only storage:rules

# Ou déployer les deux en une fois
firebase deploy --only firestore:rules,storage:rules
```

### Option 2 : Via Firebase Console

1. **Pour Firestore :**
   - Allez sur https://console.firebase.google.com
   - Sélectionnez votre projet : `ya-biso-app-m8378v`
   - Allez dans **Firestore Database** > **Règles**
   - Copiez le contenu de `firestore.rules`
   - Collez-le dans l'éditeur
   - Cliquez sur **Publier**

2. **Pour Storage :**
   - Allez dans **Storage** > **Règles**
   - Copiez le contenu de `storage.rules`
   - Collez-le dans l'éditeur
   - Cliquez sur **Publier**

## Vérification

Après le déploiement, testez l'upload d'une publication :
1. Connectez-vous à l'application
2. Allez sur la page de création de publication
3. Sélectionnez une image ou une vidéo
4. Ajoutez une description
5. Cliquez sur "Publier"

Si tout fonctionne, la publication devrait être créée avec succès.

## Structure des données

### Firestore - Collection `posts`
```javascript
{
  author: string,           // Nom d'affichage de l'auteur
  authorId: string,         // UID de l'utilisateur
  location: string,         // Localisation (optionnel)
  avatarUrl: string,        // URL de l'avatar
  media: [                  // Tableau des médias
    {
      type: 'image' | 'video',
      url: string
    }
  ],
  caption: string,          // Description + hashtags
  likes: number,            // Nombre de likes
  comments: number,         // Nombre de commentaires
  createdAt: Timestamp     // Date de création
}
```

### Storage - Structure des fichiers
```
posts/
  {userId}/
    {timestamp}_{index}_{filename}
```

## Dépannage

### Erreur : "storage/unauthorized"
- Vérifiez que les règles Storage sont bien déployées
- Vérifiez que l'utilisateur est bien authentifié
- Vérifiez que le chemin correspond à `posts/{userId}/...`

### Erreur : "permission-denied" (Firestore)
- Vérifiez que les règles Firestore sont bien déployées
- Vérifiez que l'utilisateur est bien authentifié
- Vérifiez que `authorId` correspond à `request.auth.uid`

### Les publications ne s'affichent pas
- Vérifiez que la collection s'appelle bien `posts` dans Firestore
- Vérifiez que les documents ont bien la structure attendue
- Vérifiez les logs de la console pour voir les erreurs



