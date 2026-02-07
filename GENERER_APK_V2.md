# Génération APK Ya Biso RDC - Version 1.1.0

## ✅ Modifications de cette version
- Suppression du flux TikTok
- Suppression de la page de création de publication  
- Suppression de la grille de vidéos dans le profil
- Navigation simplifiée (3 boutons : Explorer, Favoris, Profil)
- Design moderne de la page Explorer avec icônes personnalisées
- Catégories colorées et bien visibles

## 🚀 Méthode Recommandée : PWABuilder

### Étape 1 : Déployer l'application

L'application doit être déployée et accessible via HTTPS avant de générer l'APK.

```bash
# Build de production
npm run build

# Déployer sur Firebase
firebase deploy --only hosting
```

### Étape 2 : Générer l'APK avec PWABuilder

1. **Aller sur** : https://www.pwabuilder.com/

2. **Entrer l'URL** : `https://yabiso-drc.com`

3. **Cliquer sur "Start"** pour analyser l'application

4. **Aller dans l'onglet "Android"**

5. **Configurer les options** :
   - Package ID: `com.yabiso.rdc`
   - App name: `Ya Biso RDC`
   - Version: `1.1.0`
   - Version code: `2`
   - Theme color: `#FF8800`
   - Background: `#000000`

6. **Cliquer sur "Generate Package"**

7. **Télécharger le ZIP** contenant l'APK

### Étape 3 : Extraire et tester l'APK

```bash
# Extraire le ZIP téléchargé
unzip android-package.zip

# L'APK se trouve dans le dossier
# Transférer sur un appareil Android pour tester
```

## 📱 Installation sur Android

1. **Activer les sources inconnues** :
   - Paramètres → Sécurité → Sources inconnues (ON)
   - Ou : Paramètres → Applications → Accès spécial → Installer des apps inconnues

2. **Transférer l'APK** sur l'appareil (via USB, email, ou cloud)

3. **Ouvrir l'APK** et installer

## 🔐 Signature de l'APK (pour Play Store)

Si vous voulez publier sur le Play Store, vous devez signer l'APK :

```bash
# 1. Générer une clé de signature (une seule fois)
keytool -genkey -v -keystore yabiso-release-v2.keystore \
  -alias yabiso -keyalg RSA -keysize 2048 -validity 10000

# 2. Signer l'APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore yabiso-release-v2.keystore app-release-unsigned.apk yabiso

# 3. Aligner l'APK
zipalign -v 4 app-release-unsigned.apk yabiso-rdc-v1.1.0.apk
```

## 📋 Informations de version

- **Version**: 1.1.0
- **Version Code**: 2
- **Package**: com.yabiso.rdc
- **Min SDK**: 21 (Android 5.0)
- **Target SDK**: 33 (Android 13)

## 🔗 Liens utiles

- PWABuilder: https://www.pwabuilder.com/
- Documentation Android: https://developer.android.com/studio/publish
- Play Console: https://play.google.com/console

## ⚠️ Notes importantes

1. **Digital Asset Links** : Le fichier `public/.well-known/assetlinks.json` doit être accessible pour que l'app fonctionne correctement

2. **HTTPS obligatoire** : L'application doit être servie en HTTPS

3. **Manifest Web** : Le fichier `public/manifest.json` doit être valide et accessible

4. **Icônes** : Toutes les icônes doivent être présentes dans `public/icons/`

## 🐛 Dépannage

### L'APK ne s'installe pas
- Vérifiez que les sources inconnues sont activées
- Vérifiez que vous avez assez d'espace de stockage

### L'app ne se lance pas
- Vérifiez que l'URL dans le manifest est correcte
- Vérifiez que l'application est bien déployée et accessible

### L'app affiche une page blanche
- Vérifiez les logs dans Chrome DevTools (chrome://inspect)
- Vérifiez que tous les assets sont chargés correctement
