# Guide de débogage Cinetpay

## 🔍 Diagnostic de l'erreur "Erreur réponse API: {}"

Cette erreur indique que la réponse de l'API est vide ou mal formatée. Voici comment diagnostiquer :

### 1. Vérifier les logs du serveur

Les logs du serveur (terminal où `npm run dev` est lancé) affichent maintenant :

- **📤 Requête Cinetpay** : Les détails de la requête envoyée
- **📥 Réponse Cinetpay** : La réponse reçue de Cinetpay
- **❌ Erreur API Cinetpay** : Les erreurs détaillées

### 2. Vérifier les variables d'environnement

Assurez-vous que les variables sont bien chargées :

```bash
# Vérifier le fichier .env.local
cat .env.local

# Les variables doivent être :
NEXT_PUBLIC_CINETPAY_API_URL=https://api-checkout.cinetpay.com
NEXT_PUBLIC_CINETPAY_API_KEY=164212755567a4f2ee234470.03998181
NEXT_PUBLIC_CINETPAY_SITE_ID=105907138
NEXT_PUBLIC_CINETPAY_SECRET_KEY=188028715669283f0b5520b6.57905905
```

**Important** : Redémarrer le serveur après modification de `.env.local` :
```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

### 3. Vérifier les URLs de callback

Cinetpay n'accepte pas `localhost` dans les URLs de callback. 

**Solution pour le développement local** :
- Utiliser `127.0.0.1` au lieu de `localhost`
- Ou utiliser ngrok pour exposer votre serveur : `ngrok http 9002`

### 4. Vérifier la devise

Assurez-vous que la devise correspond à celle de votre compte Cinetpay :
- Si votre compte est au Cameroun : `XAF`
- Si votre compte est au Sénégal : `XOF`
- Si votre compte est en RDC : `CDF` ou `USD`

Vérifiez dans votre dashboard Cinetpay quelle devise est autorisée.

### 5. Vérifier les champs obligatoires

Les champs obligatoires selon la documentation sont :
- `apikey` ✅
- `site_id` ✅
- `transaction_id` ✅ (sans caractères spéciaux)
- `amount` ✅ (Integer, multiple de 5)
- `currency` ✅
- `description` ✅ (sans caractères spéciaux)
- `notify_url` ✅
- `return_url` ✅
- `channels` ✅

### 6. Messages d'erreur possibles

| Code/Message | Cause | Solution |
|--------------|-------|----------|
| `MINIMUM_REQUIRED_FIELDS` | Champs obligatoires manquants | Vérifier que tous les champs sont présents |
| `608` | Paramètre invalide | Vérifier le format des paramètres |
| `609` | AUTH_NOT_FOUND | Vérifier l'apikey |
| `613` | ERROR_SITE_ID_NOTVALID | Vérifier le site_id |
| Réponse vide `{}` | Pas de réponse de Cinetpay | Vérifier les logs du serveur |

### 7. Étapes de débogage

1. **Ouvrir la console du navigateur** (F12)
   - Onglet "Console" pour voir les erreurs client
   - Onglet "Network" pour voir les requêtes/réponses HTTP

2. **Vérifier les logs du serveur** (terminal)
   - Rechercher les messages `📤 Requête Cinetpay` et `📥 Réponse Cinetpay`
   - Notez le code de statut HTTP et le contenu de la réponse

3. **Vérifier la requête réseau** :
   - Dans l'onglet Network, chercher la requête à `/api/cinetpay/create-payment`
   - Vérifier :
     - Status code (200, 400, 500, etc.)
     - Response body (doit contenir un JSON avec `success`)

### 8. Test rapide

Pour tester si les variables d'environnement sont bien chargées, ajoutez temporairement dans la route API :

```typescript
console.log('🔑 Variables d\'environnement:', {
  hasApiKey: !!process.env.NEXT_PUBLIC_CINETPAY_API_KEY,
  hasSiteId: !!process.env.NEXT_PUBLIC_CINETPAY_SITE_ID,
  apiUrl: process.env.NEXT_PUBLIC_CINETPAY_API_URL,
});
```

### 9. Contact support Cinetpay

Si le problème persiste, contactez le support Cinetpay avec :
- Votre Site ID
- Les logs de la requête/réponse
- Le code d'erreur (s'il y en a un)

### 10. Mode simulation

Si vous ne voulez pas tester avec l'API réelle, vous pouvez temporairement désactiver les clés dans `.env.local` :
- Le système passera en mode simulation
- Les paiements ne seront pas réels mais l'interface fonctionnera

## 🔧 Prochaines actions recommandées

1. **Vérifier les logs du serveur** après un nouvel essai de paiement
2. **Vérifier la console du navigateur** pour les détails de l'erreur
3. **Vérifier que le serveur a été redémarré** après modification de `.env.local`
4. **Vérifier la devise** dans votre dashboard Cinetpay
5. **Vérifier les URLs** (pas de localhost)

