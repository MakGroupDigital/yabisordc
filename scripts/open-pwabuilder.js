/**
 * Script pour ouvrir PWABuilder avec l'URL de l'app
 */

const { execSync } = require('child_process');
const url = 'https://www.pwabuilder.com/?url=https://yabiso-drc.com';

console.log('🚀 Ouverture de PWABuilder...');
console.log(`📱 URL de l'app: https://yabiso-drc.com\n`);

try {
  // Ouvrir dans le navigateur
  if (process.platform === 'darwin') {
    execSync(`open "${url}"`);
  } else if (process.platform === 'win32') {
    execSync(`start "${url}"`);
  } else {
    execSync(`xdg-open "${url}"`);
  }
  
  console.log('✅ PWABuilder ouvert dans le navigateur!');
  console.log('\n📋 Étapes suivantes:');
  console.log('1. Attendez que l\'analyse se termine');
  console.log('2. Allez dans l\'onglet "Android"');
  console.log('3. Cliquez sur "Generate Package"');
  console.log('4. Téléchargez le ZIP et extrayez l\'APK');
  console.log('\n💡 L\'APK sera dans: bubblewrap-android/app/build/outputs/apk/release/');
} catch (error) {
  console.error('❌ Erreur:', error.message);
  console.log(`\n🌐 Ouvrez manuellement: ${url}`);
}

