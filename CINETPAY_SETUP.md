# Guide de Configuration Cinetpay

## ✅ Configuration terminée

Configurez vos clés Cinetpay dans `.env.local` :

- **API Key**: `votre_api_key_ici`
- **Site ID**: `votre_site_id_ici`
- **Secret Key**: `votre_secret_key_ici`
- **API URL**: `https://api-checkout.cinetpay.com`

## 📚 Documentation officielle

Référence : https://docs.cinetpay.com

## 🔧 Fonctionnalités implémentées

### 1. Service Cinetpay (`src/lib/cinetpay.ts`)
- Fonction `createCinetpayPayment()` pour créer un paiement
- Fonction `checkCinetpayPaymentStatus()` pour vérifier le statut
- Fonction `openCinetpayPaymentPage()` pour ouvrir la page de paiement
- Mode simulation si les clés ne sont pas configurées

### 2. Routes API Next.js
- `/api/cinetpay/create-payment` : Créer un paiement (côté serveur)
- `/api/cinetpay/check-status` : Vérifier le statut d'un paiement
- `/api/cinetpay/notify` : Recevoir les webhooks de Cinetpay
- `/api/cinetpay/return` : Gérer le retour après paiement

### 3. Intégration dans le système de paiement
- Remplacement de Pawapay par Cinetpay
- Redirection vers la page de paiement Cinetpay
- Vérification automatique du statut
- Génération de facture après paiement réussi

## 📋 Format de la requête Cinetpay v2

La requête envoyée à Cinetpay suit le format de la documentation officielle :

**Endpoint**: `https://api-checkout.cinetpay.com/v2/payment`

**Méthode**: `POST`

**Headers**:
```
Content-Type: application/json
User-Agent: YaBisoRDC/1.0 (requis pour éviter l'erreur 1010)
```

**Corps de la requête**:
```json
{
  "apikey": "votre_api_key",
  "site_id": "votre_site_id",
  "transaction_id": "unique-id-sans-caracteres-speciaux",
  "amount": 100,
  "currency": "XOF",
  "description": "Description du paiement sans caracteres speciaux",
  "notify_url": "https://votre-domaine.com/api/cinetpay/notify",
  "return_url": "https://votre-domaine.com/api/cinetpay/return",
  "channels": "ALL",
  "lang": "fr",
  "metadata": "reference-optionnelle",
  "customer_name": "Nom du client",
  "customer_surname": "Prénom",
  "customer_email": "email@exemple.com",
  "customer_phone_number": "+243812345678",
  "customer_address": "Adresse",
  "customer_city": "Ville",
  "customer_country": "CD",
  "customer_state": "CD",
  "customer_zip_code": "00000"
}
```

## ✅ Réponse de succès

```json
{
  "code": "201",
  "message": "CREATED",
  "description": "Transaction created with success",
  "data": {
    "payment_token": "...",
    "payment_url": "https://checkout.cinetpay.com/payment/..."
  }
}
```

## 🔐 Règles importantes

### transaction_id
- Doit être unique pour chaque transaction
- Ne doit pas contenir de caractères spéciaux: `#`, `/`, `$`, `_`, `&`
- Si vous modifiez un paramètre, vous devez générer un nouvel ID

### amount (montant)
- Doit être un multiple de 5 (sauf pour USD)
- Exemple: 100, 105, 250, etc.

### description
- Ne doit pas contenir de caractères spéciaux: `#`, `/`, `$`, `_`, `&`
- Exemple: "Paiement de reservation" ✅ (pas "Paiement_de_réservation" ❌)

### currency (devise)
- Cinetpay n'accepte que la devise locale de votre compte
- Si votre compte est en RDC, utilisez probablement `CDF` ou `USD`
- Vérifiez dans votre dashboard Cinetpay

### User-Agent
- Requis pour éviter l'erreur 1010
- Défini automatiquement dans le code: `YaBisoRDC/1.0`

## 🌍 Devises supportées

- XOF (Franc CFA - Afrique de l'Ouest)
- XAF (Franc CFA - Afrique centrale)
- CDF (Franc congolais)
- GNF (Franc guinéen)
- USD (Dollar américain)

⚠️ **Important**: Vous ne pouvez créer une transaction que dans la devise autorisée pour votre compte Cinetpay.

## ✅ Prochaines étapes

1. **Vérifier la devise de votre compte** :
   - Connectez-vous à votre dashboard Cinetpay
   - Vérifiez la devise autorisée pour votre compte
   - Si nécessaire, mettez à jour le paramètre `currency` dans le code

2. **Redémarrer le serveur** :
   ```bash
   npm run dev
   ```

3. **Tester un paiement** :
   - Allez sur la page d'hébergement
   - Cliquez sur "Réserver"
   - Choisissez "Payer maintenant"
   - Sélectionnez "Mobile Money"
   - Entrez un numéro de téléphone
   - Cliquez sur "Payer"

4. **Configurer les webhooks** (optionnel) :
   - Dans votre dashboard Cinetpay, configurez l'URL de notification
   - URL : `https://votre-domaine.com/api/cinetpay/notify`
   - Pour le développement local, utilisez ngrok ou similaire

## 🔒 Sécurité

- Les clés sont stockées dans `.env.local` (déjà dans `.gitignore`)
- Les appels API passent par des routes Next.js (côté serveur)
- Pas de signature requise pour l'initialisation (contrairement à Pawapay)

## ⚠️ Erreurs courantes

| Code | Cause | Solution |
|------|-------|----------|
| 608 | Paramètre obligatoire manquant ou invalide | Vérifier tous les paramètres requis |
| 609 | AUTH_NOT_FOUND | Vérifier l'apikey dans votre dashboard |
| 613 | ERROR_SITE_ID_NOTVALID | Vérifier le site_id dans votre dashboard |
| 624 | Erreur de traitement | Vérifier lock_phone_number et customer_phone_number |
| 1010 | Restriction serveur | User-Agent requis (déjà configuré) |
| 403 | Format incorrect | Content-Type doit être application/json |

## 📚 Ressources

- Documentation officielle : https://docs.cinetpay.com
- Dashboard : https://cinetpay.com
- Support : https://support.cinetpay.com
