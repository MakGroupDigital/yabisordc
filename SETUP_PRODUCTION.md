# 🚀 Configuration Production - Guide Complet

## ✅ Clés API Configurées

Les clés API de production sont maintenant dans le code. Pour que l'application fonctionne en production, vous devez configurer ces variables dans **Firebase App Hosting**.

## 📋 Étape 1 : Configurer dans Firebase Console

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet : **ya-biso-app-m8378v**
3. Menu latéral → **App Hosting**
4. Cliquez sur votre application → **Settings** → **Environment Variables**
5. Ajoutez chaque variable une par une (copiez depuis `firebase.env.production` ou `env.production.txt`)

### Variables à Ajouter (8 variables)

#### Cinetpay (4 variables)
- `NEXT_PUBLIC_CINETPAY_API_URL` = `https://api-checkout.cinetpay.com`
- `NEXT_PUBLIC_CINETPAY_API_KEY` = `164212755567a4f2ee234470.03998181` ⚠️ **Marquer comme Secret**
- `NEXT_PUBLIC_CINETPAY_SITE_ID` = `105907138` ⚠️ **Marquer comme Secret**
- `NEXT_PUBLIC_CINETPAY_SECRET_KEY` = `188028715669283f0b5520b6.57905905` ⚠️ **Marquer comme Secret**

#### PayPal (4 variables)
- `NEXT_PUBLIC_PAYPAL_MODE` = `sandbox`
- `NEXT_PUBLIC_PAYPAL_API_URL` = `https://api-m.sandbox.paypal.com`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` = `AcjvyGe5w5ASvHcOwaQDXHi1BjNUR3NsT8bLWCLDWgyZCmTJAluAwZ8Gxrlo8qNaGPsn7pLzbTFTSXnl` ⚠️ **Marquer comme Secret**
- `NEXT_PUBLIC_PAYPAL_CLIENT_SECRET` = `EAud2skyaLTJbDnTeXrJUvPDZdKzSZfaSea_YkqaURUf9HVRLQ1iIpotXTGwqHBtSljc_TABI52oMgVc` ⚠️ **Marquer comme Secret**

## 📁 Fichiers de Configuration

- `firebase.env.production` - Fichier de référence avec toutes les clés
- `env.production.txt` - Format texte simple pour copier-coller
- `config.production.js` - Configuration JavaScript (pour référence)
- `PRODUCTION_CONFIG.md` - Documentation détaillée

## ⚠️ Important

- Les clés sont maintenant dans le code source (fichiers ci-dessus)
- Configurez-les dans Firebase Console pour qu'elles soient utilisées lors du build
- Firebase App Hosting injecte ces variables lors du déploiement
- Les variables avec `NEXT_PUBLIC_` sont intégrées au build et accessibles côté client

## 🔄 Après Configuration

1. Sauvegardez toutes les variables dans Firebase Console
2. Firebase redéploiera automatiquement votre application
3. Testez les fonctionnalités de paiement en production

## ✅ Vérification

Après le déploiement, testez :
- Paiement Cinetpay (Mobile Money ou Carte)
- Paiement PayPal
- Génération de factures




