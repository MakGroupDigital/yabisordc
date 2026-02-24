/**
 * Script pour générer l'APK Ya Biso RDC
 * 
 * Usage: 
 *   node scripts/generate-apk.js [--url=https://votre-url.com]
 *   node scripts/generate-apk.js --local (utilise localhost:3000)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let appUrl = 'https://studio-3821305079-74f59.firebaseapp.com';

// Parser les arguments
args.forEach(arg => {
  if (arg.startsWith('--url=')) {
    appUrl = arg.split('=')[1];
  } else if (arg === '--local') {
    appUrl = 'http://localhost:3000';
    console.log('⚠️  Mode local: Assurez-vous que l\'app tourne sur localhost:3000');
  }
});

console.log('🚀 Génération de l\'APK Ya Biso RDC\n');
console.log(`📱 URL de l'application: ${appUrl}\n`);

// Vérifier que l'URL est accessible
if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
  console.error('❌ L\'URL doit commencer par http:// ou https://');
  process.exit(1);
}

// Créer le manifest TWA avec l'URL correcte
const twaManifest = {
  packageId: "com.yabiso.rdc",
  host: appUrl.replace(/^https?:\/\//, '').split('/')[0],
  name: "Ya Biso RDC",
  launcherName: "Ya Biso",
  display: "standalone",
  themeColor: "#FF8800",
  backgroundColor: "#000000",
  enableNotifications: true,
  startUrl: "/",
  iconUrl: "/icons/icon-512x512.png",
  maskableIconUrl: "/icons/icon-512x512.png",
  webManifestUrl: `${appUrl}/manifest.json`,
  appVersion: "1.0.0",
  appVersionCode: 1,
  shortcuts: [
    {
      name: "Explorer",
      shortName: "Explorer",
      url: "/home/explorer",
      icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }]
    }
  ],
  minSdkVersion: 21,
  orientation: "portrait",
};

const manifestPath = path.join(__dirname, '..', 'twa-manifest-temp.json');
fs.writeFileSync(manifestPath, JSON.stringify(twaManifest, null, 2));
console.log('✅ Manifest TWA créé\n');

// Créer le dossier android s'il n'existe pas
const androidDir = path.join(__dirname, '..', 'android');
if (!fs.existsSync(androidDir)) {
  fs.mkdirSync(androidDir, { recursive: true });
}

try {
  console.log('📦 Initialisation du projet Android...');
  
  // Initialiser le projet (si pas déjà fait)
  if (!fs.existsSync(path.join(androidDir, 'app', 'build.gradle'))) {
    execSync(
      `npx @bubblewrap/cli init --manifest=${manifestPath} --directory=${androidDir}`,
      { stdio: 'inherit', cwd: path.join(__dirname, '..') }
    );
  } else {
    console.log('✅ Projet Android déjà initialisé\n');
  }

  console.log('\n🔨 Build de l\'APK...');
  
  // Builder l'APK
  execSync(
    `npx @bubblewrap/cli build --directory=${androidDir}`,
    { stdio: 'inherit', cwd: path.join(__dirname, '..') }
  );

  // Trouver l'APK généré
  const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');
  const apkPathAlt = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release-unsigned.apk');
  
  if (fs.existsSync(apkPath)) {
    console.log(`\n🎉 APK généré avec succès!`);
    console.log(`📦 Fichier: ${apkPath}`);
    console.log(`\n💡 Note: C'est un AAB (Android App Bundle). Pour une APK, utilisez:`);
    console.log(`   npx @bubblewrap/cli build --directory=android --apk`);
  } else if (fs.existsSync(apkPathAlt)) {
    console.log(`\n🎉 APK généré avec succès!`);
    console.log(`📦 Fichier: ${apkPathAlt}`);
    console.log(`\n⚠️  APK non signé. Pour signer:`);
    console.log(`   1. Créer une clé: keytool -genkey -v -keystore yabiso.keystore -alias yabiso -keyalg RSA -keysize 2048 -validity 10000`);
    console.log(`   2. Signer: jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore yabiso.keystore ${apkPathAlt} yabiso`);
  } else {
    console.log('\n⚠️  APK non trouvé. Vérifiez les logs ci-dessus.');
  }

  // Nettoyer le manifest temporaire
  if (fs.existsSync(manifestPath)) {
    fs.unlinkSync(manifestPath);
  }

} catch (error) {
  console.error('\n❌ Erreur lors de la génération:', error.message);
  process.exit(1);
}

