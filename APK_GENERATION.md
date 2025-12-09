# Génération de l'APK - Ya Biso RDC

## Méthode : PWA vers APK avec Bubblewrap/PWABuilder

### Prérequis

1. **Node.js** (v16+)
2. **Java JDK** (v11+)
3. **Android SDK** (via Android Studio)

### Étape 1 : Générer les icônes PWA

```bash
cd /Users/mac/yabisoapprdc
npm install sharp --save-dev
node scripts/generate-icons.js
```

### Étape 2 : Déployer l'application

L'app doit être accessible via HTTPS. Options :
- **Vercel** : `npx vercel --prod`
- **Firebase Hosting** : `firebase deploy`
- **Netlify** : Push sur GitHub

### Étape 3 : Générer l'APK avec PWABuilder

1. Aller sur **https://www.pwabuilder.com/**
2. Entrer l'URL de votre app déployée
3. Cliquer sur "Start" pour analyser
4. Aller dans l'onglet "Android"
5. Cliquer sur "Generate Package"
6. Télécharger le fichier ZIP

### Étape 4 : Alternative avec Bubblewrap (CLI)

```bash
# Installer Bubblewrap
npm install -g @aspect-build/aspect

# Ou utiliser npx
npx @aspect-build/aspect init

# Configuration interactive
# - Package name: com.yabiso.rdc
# - App name: Ya Biso RDC
# - URL: https://votre-domaine.com
# - Theme color: #FF8800
# - Background: #000000

# Générer l'APK
npx @aspect-build/aspect build
```

### Étape 5 : Signer l'APK (Production)

```bash
# Générer une clé de signature
keytool -genkey -v -keystore yabiso-release.keystore \
  -alias yabiso -keyalg RSA -keysize 2048 -validity 10000

# Signer l'APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore yabiso-release.keystore app-release-unsigned.apk yabiso

# Aligner l'APK
zipalign -v 4 app-release-unsigned.apk yabiso-rdc.apk
```

## Configuration TWA (twa-manifest.json)

```json
{
  "packageId": "com.yabiso.rdc",
  "host": "votre-domaine.com",
  "name": "Ya Biso RDC",
  "launcherName": "Ya Biso",
  "display": "standalone",
  "themeColor": "#FF8800",
  "navigationColor": "#000000",
  "backgroundColor": "#000000",
  "enableNotifications": true,
  "startUrl": "/",
  "iconUrl": "/icons/icon-512x512.png",
  "splashScreenFadeOutDuration": 300,
  "signingKey": {
    "path": "./yabiso-release.keystore",
    "alias": "yabiso"
  },
  "appVersion": "1.0.0",
  "appVersionCode": 1,
  "shortcuts": [
    {
      "name": "Explorer",
      "url": "/home/explorer",
      "icons": [{"src": "/icons/icon-96x96.png"}]
    }
  ],
  "generatorApp": "PWABuilder",
  "webManifestUrl": "/manifest.json"
}
```

## Vérification Digital Asset Links

Créer `public/.well-known/assetlinks.json` :

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.yabiso.rdc",
    "sha256_cert_fingerprints": ["VOTRE_FINGERPRINT_SHA256"]
  }
}]
```

## Publication sur Play Store

1. Créer un compte développeur Google Play ($25)
2. Créer une nouvelle application
3. Remplir les informations (description, screenshots)
4. Uploader l'APK/AAB signé
5. Soumettre pour révision

## Commandes rapides

```bash
# Générer icônes
npm run generate:icons

# Build production
npm run build

# Déployer
npm run deploy

# Générer APK (après config)
npx @aspect-build/aspect build
```

