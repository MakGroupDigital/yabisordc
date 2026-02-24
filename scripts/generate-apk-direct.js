/**
 * Script pour générer l'APK directement depuis le manifest web
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const APP_URL = 'https://yabiso-drc.com';
const MANIFEST_URL = `${APP_URL}/manifest.json`;

console.log('🚀 Génération de l\'APK Ya Biso RDC\n');
console.log(`📱 URL: ${APP_URL}`);
console.log(`📄 Manifest: ${MANIFEST_URL}\n`);

// Vérifier que le manifest est accessible
function checkManifest() {
  return new Promise((resolve, reject) => {
    https.get(MANIFEST_URL, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Manifest accessible\n');
        resolve();
      } else {
        console.log(`⚠️  Manifest retourne ${res.statusCode}`);
        console.log('💡 Le manifest sera créé localement\n');
        resolve();
      }
    }).on('error', (err) => {
      console.log('⚠️  Impossible de vérifier le manifest en ligne');
      console.log('💡 Utilisation du manifest local\n');
      resolve();
    });
  });
}

// Créer le manifest TWA depuis le manifest web
function createTWAManifest() {
  const webManifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'manifest.json'), 'utf8'));
  
  const twaManifest = {
    packageId: "com.yabiso.rdc",
    host: "yabiso-drc.com",
    name: webManifest.name,
    launcherName: webManifest.short_name || webManifest.name,
    display: webManifest.display || "standalone",
    themeColor: webManifest.theme_color || "#FF8800",
    backgroundColor: webManifest.background_color || "#000000",
    startUrl: webManifest.start_url || "/",
    iconUrl: webManifest.icons?.find(i => i.sizes === "512x512")?.src || `${APP_URL}/icons/icon-512x512.png`,
    maskableIconUrl: webManifest.icons?.find(i => i.sizes === "512x512")?.src || `${APP_URL}/icons/icon-512x512.png`,
    webManifestUrl: MANIFEST_URL,
    appVersion: "1.0.0",
    appVersionCode: 1,
    shortcuts: webManifest.shortcuts?.map(s => ({
      name: s.name,
      shortName: s.short_name || s.name,
      url: s.url.startsWith('http') ? s.url : `${APP_URL}${s.url}`,
      icons: s.icons || []
    })) || [],
    minSdkVersion: 21,
    orientation: webManifest.orientation || "portrait"
  };

  const manifestPath = path.join(__dirname, '..', 'twa-manifest-final.json');
  fs.writeFileSync(manifestPath, JSON.stringify(twaManifest, null, 2));
  console.log('✅ Manifest TWA créé: twa-manifest-final.json\n');
  return manifestPath;
}

async function generateAPK() {
  try {
    // Vérifier le manifest
    await checkManifest();

    // Créer le manifest TWA
    const manifestPath = createTWAManifest();

    // Créer le dossier android
    const androidDir = path.join(__dirname, '..', 'android');
    if (fs.existsSync(androidDir)) {
      console.log('🗑️  Suppression de l\'ancien projet Android...');
      fs.rmSync(androidDir, { recursive: true, force: true });
    }
    fs.mkdirSync(androidDir, { recursive: true });

    console.log('📦 Initialisation du projet Android avec Bubblewrap...\n');
    
    // Initialiser le projet (mode non-interactif avec réponses automatiques)
    try {
      execSync(
        `echo -e "\\n\\n\\n\\n\\n\\n" | npx @bubblewrap/cli init --manifest=${manifestPath} --directory=${androidDir} 2>&1 || true`,
        { stdio: 'inherit', cwd: path.join(__dirname, '..') }
      );
    } catch (error) {
      // Si l'init échoue, essayons une autre méthode
      console.log('⚠️  Init automatique échoué, tentative manuelle...\n');
    }

    // Vérifier si le projet a été créé
    if (!fs.existsSync(path.join(androidDir, 'app', 'build.gradle'))) {
      console.log('❌ Le projet Android n\'a pas été créé correctement.');
      console.log('\n💡 Solution alternative:');
      console.log('1. Allez sur https://www.pwabuilder.com/');
      console.log(`2. Entrez l'URL: ${APP_URL}`);
      console.log('3. Cliquez sur "Start" puis "Android" → "Generate Package"');
      console.log('4. Téléchargez le ZIP et extrayez l\'APK\n');
      return;
    }

    console.log('✅ Projet Android initialisé\n');
    console.log('🔨 Build de l\'APK...\n');

    // Builder l'APK
    execSync(
      `npx @bubblewrap/cli build --directory=${androidDir} --apk`,
      { stdio: 'inherit', cwd: path.join(__dirname, '..') }
    );

    // Trouver l'APK généré
    const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release-unsigned.apk');
    
    if (fs.existsSync(apkPath)) {
      const finalApkPath = path.join(__dirname, '..', 'yabiso-rdc.apk');
      fs.copyFileSync(apkPath, finalApkPath);
      console.log(`\n🎉 APK généré avec succès!`);
      console.log(`📦 Fichier: ${finalApkPath}`);
      console.log(`\n⚠️  APK non signé. Pour tester:`);
      console.log(`   - Activez "Installer des apps inconnues" dans les paramètres Android`);
      console.log(`   - Installez l'APK sur votre appareil`);
      console.log(`\n💡 Pour signer l'APK (production):`);
      console.log(`   keytool -genkey -v -keystore yabiso.keystore -alias yabiso -keyalg RSA -keysize 2048 -validity 10000`);
      console.log(`   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore yabiso.keystore ${finalApkPath} yabiso`);
      console.log(`   zipalign -v 4 ${finalApkPath} yabiso-rdc-signed.apk`);
    } else {
      console.log('\n⚠️  APK non trouvé. Vérifiez les logs ci-dessus.');
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.log('\n💡 Solution alternative:');
    console.log('1. Allez sur https://www.pwabuilder.com/');
    console.log(`2. Entrez l'URL: ${APP_URL}`);
    console.log('3. Cliquez sur "Start" puis "Android" → "Generate Package"');
    process.exit(1);
  }
}

generateAPK();

