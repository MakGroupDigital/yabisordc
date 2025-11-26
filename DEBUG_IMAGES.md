# Guide de débogage - Images non affichées

## 🔍 Vérifications à faire

### 1. Vérifier dans la console du navigateur

Ouvrez la console (F12) et cherchez ces logs :

#### ✅ Logs attendus lors de la création d'un post :
```
✅ URL de téléchargement récupérée: { fileName: "...", url: "https://..." }
💾 Données à sauvegarder dans Firestore: { media: [{ type: "image", url: "https://..." }] }
✅ Publication créée avec succès, ID: ...
```

#### ✅ Logs attendus lors du chargement des posts :
```
🔄 Chargement des publications...
📋 Post 1: { id: "...", mediaCount: 1, media: [{ type: "image", url: "https://..." }] }
✅ Post ... - Média 0 URL valide: https://...
🖼️ Rendu média 0: { url: "https://...", hasError: false }
✅ Image Next.js chargée avec succès: https://...
```

### 2. Vérifier dans Firebase Console

#### A. Firestore Database
1. Allez sur [Firebase Console - Firestore](https://console.firebase.google.com/project/studio-3821305079-74f59/firestore)
2. Ouvrez la collection `posts`
3. Cliquez sur un document récemment créé
4. Vérifiez le champ `media` :
   - ✅ Doit être un tableau (array)
   - ✅ Chaque élément doit avoir `type` et `url`
   - ✅ L'URL doit commencer par `https://`

**Exemple de structure correcte :**
```json
{
  "media": [
    {
      "type": "image",
      "url": "https://firebasestorage.googleapis.com/v0/b/..."
    }
  ]
}
```

#### B. Storage
1. Allez sur [Firebase Console - Storage](https://console.firebase.google.com/project/studio-3821305079-74f59/storage)
2. Ouvrez le dossier `posts`
3. Vérifiez que les fichiers images sont présents
4. Cliquez sur un fichier et vérifiez l'URL de téléchargement

### 3. Problèmes courants et solutions

#### ❌ Problème : "Aucun média disponible"
**Cause :** Le champ `media` est vide ou n'existe pas dans Firestore
**Solution :** 
- Vérifiez que `uploadMedia` retourne bien une URL
- Vérifiez que `createPost` reçoit bien les URLs
- Vérifiez les logs dans la console

#### ❌ Problème : "URL manquante"
**Cause :** L'URL n'est pas sauvegardée dans Firestore
**Solution :**
- Vérifiez les logs lors de la création du post
- Vérifiez que `mediaUrls` contient bien les URLs avant l'appel à `createPost`

#### ❌ Problème : "Erreur de chargement de l'image"
**Cause :** L'URL est invalide ou les permissions Storage sont incorrectes
**Solution :**
- Vérifiez que l'URL commence par `https://`
- Vérifiez les règles Storage dans Firebase Console
- Testez l'URL directement dans le navigateur

#### ❌ Problème : Images ne s'affichent pas mais pas d'erreur
**Cause :** Problème avec Next.js Image component
**Solution :**
- Le code utilise maintenant un fallback avec `<img>` HTML
- Vérifiez les logs pour voir si Next.js Image ou img HTML fonctionne

## 🛠️ Commandes de débogage

### Dans la console du navigateur :

```javascript
// Vérifier les posts chargés
// Les logs devraient apparaître automatiquement

// Tester une URL d'image manuellement
const testUrl = "VOTRE_URL_ICI";
const img = new Image();
img.onload = () => console.log("✅ Image chargeable");
img.onerror = () => console.error("❌ Image non chargeable");
img.src = testUrl;
```

## 📝 Checklist de vérification

- [ ] Les images sont uploadées dans Firebase Storage
- [ ] Les URLs sont récupérées après l'upload
- [ ] Les URLs sont sauvegardées dans Firestore (champ `media`)
- [ ] Les posts sont récupérés depuis Firestore avec les URLs
- [ ] Les URLs sont valides (commencent par `https://`)
- [ ] Les règles Storage permettent la lecture
- [ ] Les règles Firestore permettent la lecture
- [ ] Next.js Image peut charger les URLs (ou le fallback img HTML)

## 🔗 Liens utiles

- [Firebase Console - Firestore](https://console.firebase.google.com/project/studio-3821305079-74f59/firestore)
- [Firebase Console - Storage](https://console.firebase.google.com/project/studio-3821305079-74f59/storage)
- [Firebase Console - Storage Rules](https://console.firebase.google.com/project/studio-3821305079-74f59/storage/rules)
- [Firebase Console - Firestore Rules](https://console.firebase.google.com/project/studio-3821305079-74f59/firestore/rules)

