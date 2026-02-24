# Debug PayPal - Vérification de la configuration

## Problème
"URL de paiement PayPal manquante. Vérifiez la configuration PayPal dans .env.local"

## Solution

### 1. Vérifier que le fichier .env.local existe

Le fichier doit être à la racine du projet : `/Users/mac/yabisoapprdc/.env.local`

### 2. Vérifier que les variables sont bien définies

Le fichier `.env.local` doit contenir :

```env
NEXT_PUBLIC_PAYPAL_MODE=sandbox
NEXT_PUBLIC_PAYPAL_API_URL=https://api-m.sandbox.paypal.com
NEXT_PUBLIC_PAYPAL_CLIENT_ID=votre_client_id_ici
NEXT_PUBLIC_PAYPAL_CLIENT_SECRET=votre_client_secret_ici
```

### 3. REDÉMARRER le serveur de développement

⚠️ **IMPORTANT** : Après avoir modifié `.env.local`, vous DEVEZ :
1. Arrêter le serveur (Ctrl+C)
2. Redémarrer avec `npm run dev` ou `yarn dev`

Les variables d'environnement ne sont chargées qu'au démarrage du serveur.

### 4. Vérifier les logs

Après avoir redémarré, regardez :
- Les logs du terminal du serveur (devrait afficher "✅ Configuration PayPal détectée")
- La console du navigateur (devrait afficher les détails de la réponse PayPal)

### 5. Si le problème persiste

Vérifiez :
- Que le fichier `.env.local` n'a pas d'espaces avant/après les valeurs
- Que les guillemets ne sont pas nécessaires (sauf si la valeur contient des espaces)
- Que le serveur a bien été redémarré après la modification

## Test

Une fois configuré correctement, essayez de faire un paiement PayPal et vérifiez :
1. La console du navigateur (F12 > Console)
2. Les logs du serveur (terminal)
3. Si une URL PayPal est bien générée
