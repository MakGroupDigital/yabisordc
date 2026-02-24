#!/usr/bin/env node

/**
 * Script pour ouvrir Firebase Console directement sur la page de configuration
 * de l'authentification par téléphone
 */

const { execSync } = require('child_process');
const os = require('os');

const PROJECT_ID = 'studio-3821305079-74f59';
const PHONE_AUTH_URL = `https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers`;
const AUTHORIZED_DOMAINS_URL = `https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings`;

console.log('🔧 Ouverture de Firebase Console pour configurer l\'authentification par téléphone...\n');

const platform = os.platform();
let command;

if (platform === 'darwin') {
  // macOS
  command = `open "${PHONE_AUTH_URL}"`;
} else if (platform === 'win32') {
  // Windows
  command = `start "${PHONE_AUTH_URL}"`;
} else {
  // Linux
  command = `xdg-open "${PHONE_AUTH_URL}"`;
}

try {
  execSync(command, { stdio: 'inherit' });
  console.log('✅ Firebase Console ouvert dans votre navigateur\n');
  console.log('📋 Étapes à suivre:\n');
  console.log('1. Dans l\'onglet ouvert, allez dans "Sign-in method"');
  console.log('2. Cliquez sur "Phone"');
  console.log('3. Activez le toggle "Enable"');
  console.log('4. Cliquez sur "Save"\n');
  console.log('5. Allez dans "Settings" > "Authorized domains"');
  console.log('6. Vérifiez que "localhost" est présent');
  console.log('7. Si non, ajoutez "localhost"\n');
  console.log('8. Vérifiez dans "Settings" > "reCAPTCHA" qu\'il est activé\n');
} catch (error) {
  console.error('❌ Impossible d\'ouvrir le navigateur automatiquement');
  console.error('\n🔗 Ouvrez manuellement ces URLs:\n');
  console.log(`   Configuration Phone: ${PHONE_AUTH_URL}`);
  console.log(`   Domaines autorisés: ${AUTHORIZED_DOMAINS_URL}\n`);
}



