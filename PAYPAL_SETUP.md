# Configuration PayPal

Ce guide vous explique comment configurer PayPal pour votre application.

## Variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env.local` :

```env
# PayPal Configuration
# Mode: sandbox (test) ou production (lien)
NEXT_PUBLIC_PAYPAL_MODE=sandbox

# URL de l'API PayPal
# Sandbox: https://api-m.sandbox.paypal.com
# Production: https://api-m.paypal.com
NEXT_PUBLIC_PAYPAL_API_URL=https://api-m.sandbox.paypal.com

# Client ID (fourni par PayPal)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=votre_client_id_ici

# Client Secret (fourni par PayPal)
NEXT_PUBLIC_PAYPAL_CLIENT_SECRET=votre_client_secret_ici
```

## Important

⚠️ **Ne commitez JAMAIS le fichier `.env.local` dans Git !** Ce fichier contient des informations sensibles.

## Passage en production

Pour passer en production :

1. Connectez-vous à votre compte PayPal Developer
2. Créez une nouvelle application en mode "Production"
3. Obtenez vos nouvelles clés (Client ID et Client Secret)
4. Mettez à jour les variables d'environnement :
   - `NEXT_PUBLIC_PAYPAL_MODE=production`
   - `NEXT_PUBLIC_PAYPAL_API_URL=https://api-m.paypal.com`
   - Remplacez les clés par celles de production

## Documentation PayPal

- Documentation API: https://developer.paypal.com/docs/api/orders/v2/
- Dashboard PayPal: https://developer.paypal.com/dashboard/



