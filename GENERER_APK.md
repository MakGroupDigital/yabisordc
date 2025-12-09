# 🚀 Guide pour Générer l'APK Ya Biso RDC

## Méthode Recommandée : PWABuilder (En ligne)

### Étape 1 : Préparer le site
Assurez-vous que votre site est accessible sur **https://yabiso-drc.com** et que le `manifest.json` est accessible.

### Étape 2 : Utiliser PWABuilder
1. Allez sur **https://www.pwabuilder.com/**
2. Entrez l'URL : `https://yabiso-drc.com`
3. Cliquez sur **"Start"** pour analyser votre PWA
4. Attendez que l'analyse se termine

### Étape 3 : Générer l'APK Android
1. Une fois l'analyse terminée, allez dans l'onglet **"Android"**
2. Cliquez sur **"Generate Package"**
3. Téléchargez le fichier ZIP généré

### Étape 4 : Extraire l'APK
1. Extrayez le fichier ZIP
2. Vous trouverez l'APK dans le dossier `bubblewrap-android/app/build/outputs/apk/release/`
3. Le fichier s'appelle `app-release-unsigned.apk`

### Étape 5 : Signer l'APK (Optionnel pour production)
```bash
# Créer une clé de signature
keytool -genkey -v -keystore yabiso-release.keystore \
  -alias yabiso -keyalg RSA -keysize 2048 -validity 10000

# Signer l'APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore yabiso-release.keystore app-release-unsigned.apk yabiso

# Aligner l'APK
zipalign -v 4 app-release-unsigned.apk yabiso-rdc.apk
```

## Méthode Alternative : Bubblewrap CLI (Local)

### Prérequis
- Node.js installé ✅
- Java JDK installé ✅
- Android SDK (optionnel, pour build local)

### Installation
```bash
npm install -g @bubblewrap/cli
```

### Génération
```bash
# Initialiser le projet
npx @bubblewrap/cli init --manifest=twa-manifest.json

# Builder l'APK
npx @bubblewrap/cli build

# Ou builder directement l'APK (sans AAB)
npx @bubblewrap/cli build --apk
```

## Configuration TWA

Le fichier `twa-manifest.json` est déjà configuré avec :
- **Package ID** : `com.yabiso.rdc`
- **Host** : `yabiso-drc.com`
- **Nom** : Ya Biso RDC
- **Couleur thème** : #FF8800 (Orange Ya Biso)
- **Icône** : 512x512 depuis le logo officiel

## Vérification Digital Asset Links

Pour que l'APK fonctionne correctement, assurez-vous que le fichier suivant est accessible :
- `https://yabiso-drc.com/.well-known/assetlinks.json`

Ce fichier doit contenir :
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

**Note** : Le fingerprint SHA256 sera généré lors de la création de l'APK. Vous devrez l'ajouter après la première génération.

## Publication sur Google Play Store

1. Créer un compte développeur Google Play ($25)
2. Créer une nouvelle application
3. Remplir les informations :
   - Nom : Ya Biso RDC
   - Description : Découvrez la RDC - Restaurants, Hébergements, Sites Touristiques
   - Catégorie : Voyage
   - Screenshots : Utiliser les images dans `public/screenshots/`
4. Uploader l'APK/AAB signé
5. Soumettre pour révision

## Dépannage

### Erreur "Invalid URL"
- Vérifiez que le site est accessible en HTTPS
- Vérifiez que le manifest.json est accessible
- Vérifiez que les icônes sont accessibles

### Erreur "Manifest not found"
- Assurez-vous que `/manifest.json` est accessible
- Vérifiez que le fichier existe dans `public/manifest.json`

### APK non signé
- L'APK généré par PWABuilder est non signé par défaut
- Pour le tester, activez "Installer des apps inconnues" dans les paramètres Android
- Pour la production, signez l'APK comme indiqué ci-dessus

## Support

Pour plus d'aide :
- Documentation PWABuilder : https://docs.pwabuilder.com/
- Documentation Bubblewrap : https://github.com/GoogleChromeLabs/bubblewrap

