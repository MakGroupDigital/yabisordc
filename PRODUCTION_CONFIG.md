# Configuration Production - Variables d'Environnement

## 🔐 Variables d'environnement pour la Production

Ce fichier contient les variables d'environnement à configurer dans **Firebase App Hosting** pour que l'application fonctionne en production.

## 📋 Instructions

### Option 1 : Configuration dans Firebase Console (Recommandé)

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet : **ya-biso-app-m8378v**
3. Menu latéral → **App Hosting**
4. Cliquez sur votre application → **Settings** → **Environment Variables**
5. Ajoutez chaque variable ci-dessous :

### Variables Cinetpay

```
NEXT_PUBLIC_CINETPAY_API_URL = https://api-checkout.cinetpay.com
NEXT_PUBLIC_CINETPAY_API_KEY = 164212755567a4f2ee234470.03998181 (Secret)
NEXT_PUBLIC_CINETPAY_SITE_ID = 105907138 (Secret)
NEXT_PUBLIC_CINETPAY_SECRET_KEY = 188028715669283f0b5520b6.57905905 (Secret)
```

### Variables PayPal

```
NEXT_PUBLIC_PAYPAL_MODE = sandbox
NEXT_PUBLIC_PAYPAL_API_URL = https://api-m.sandbox.paypal.com
NEXT_PUBLIC_PAYPAL_CLIENT_ID = AcjvyGe5w5ASvHcOwaQDXHi1BjNUR3NsT8bLWCLDWgyZCmTJAluAwZ8Gxrlo8qNaGPsn7pLzbTFTSXnl (Secret)
NEXT_PUBLIC_PAYPAL_CLIENT_SECRET = EAud2skyaLTJbDnTeXrJUvPDZdKzSZfaSea_YkqaURUf9HVRLQ1iIpotXTGwqHBtSljc_TABI52oMgVc (Secret)
```

**⚠️ Important** : Marquez toutes les clés API comme "Secret" dans Firebase Console.

---

## 🔄 Après Configuration

1. Sauvegardez toutes les variables
2. Firebase redéploiera automatiquement votre application
3. Les variables seront disponibles lors du build de production

---

## 📝 Notes

- Les variables avec `NEXT_PUBLIC_` sont intégrées au build et accessibles côté client
- Firebase App Hosting injecte ces variables lors du build
- Ne modifiez pas les noms des variables (ils doivent correspondre exactement au code)

---

## ✅ Vérification

Après le déploiement, testez les fonctionnalités de paiement pour vérifier que tout fonctionne correctement.





