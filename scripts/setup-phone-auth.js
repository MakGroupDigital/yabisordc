#!/usr/bin/env node

/**
 * Script pour configurer l'authentification par téléphone dans Firebase
 * 
 * Ce script utilise Firebase CLI pour activer l'authentification par téléphone
 * et configurer les domaines autorisés.
 * 
 * Usage: node scripts/setup-phone-auth.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'studio-3821305079-74f59';

console.log('🔧 Configuration de l\'authentification par téléphone Firebase\n');

// Vérifier si Firebase CLI est installé
try {
  const version = execSync('firebase --version', { encoding: 'utf-8' }).trim();
  console.log(`✅ Firebase CLI installé: ${version}`);
} catch (error) {
  console.error('❌ Firebase CLI n\'est pas installé');
  console.error('Installez-le avec: npm install -g firebase-tools');
  process.exit(1);
}

// Vérifier si on est connecté
try {
  const projects = execSync('firebase projects:list', { encoding: 'utf-8' });
  console.log('✅ Connecté à Firebase');
} catch (error) {
  console.error('❌ Non connecté à Firebase');
  console.error('Connectez-vous avec: firebase login');
  process.exit(1);
}

// Vérifier le projet actuel
try {
  const currentProject = execSync('firebase use', { encoding: 'utf-8' });
  console.log(`📋 Projet actuel:\n${currentProject}`);
} catch (error) {
  console.log('⚠️ Aucun projet sélectionné');
  console.log(`Sélection du projet ${PROJECT_ID}...`);
  try {
    execSync(`firebase use ${PROJECT_ID}`, { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Impossible de sélectionner le projet');
    process.exit(1);
  }
}

console.log('\n📝 Instructions pour configurer l\'authentification par téléphone:\n');
console.log('⚠️  Firebase CLI ne permet pas de configurer l\'authentification par téléphone directement.');
console.log('⚠️  Vous devez le faire manuellement dans Firebase Console.\n');

console.log('🔗 Ouvrez Firebase Console:');
console.log(`   https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers\n`);

console.log('📋 Étapes à suivre:\n');
console.log('1. Allez dans Authentication > Sign-in method');
console.log('2. Cliquez sur "Phone" dans la liste des providers');
console.log('3. Activez le toggle "Enable"');
console.log('4. Cliquez sur "Save"\n');

console.log('5. Allez dans Authentication > Settings > Authorized domains');
console.log('6. Vérifiez que "localhost" est dans la liste');
console.log('7. Si non, cliquez sur "Add domain" et ajoutez "localhost"\n');

console.log('8. Vérifiez dans Authentication > Settings > reCAPTCHA');
console.log('9. Assurez-vous que reCAPTCHA est activé\n');

console.log('✅ Après avoir effectué ces étapes, l\'authentification par téléphone devrait fonctionner.\n');

// Créer un script de vérification
const checkScript = `
// Script de vérification de la configuration
const checkConfig = async () => {
  const domain = window.location.hostname;
  console.log('🔍 Vérification de la configuration:');
  console.log('  - Domaine actuel:', domain);
  console.log('  - Project ID:', '${PROJECT_ID}');
  console.log('\\n⚠️  Vérifiez dans Firebase Console que:');
  console.log('  1. Phone est activé dans Sign-in method');
  console.log('  2. Le domaine', domain, 'est dans Authorized domains');
  console.log('  3. reCAPTCHA est configuré');
};
checkConfig();
`;

fs.writeFileSync(
  path.join(__dirname, '../public/check-firebase-config.js'),
  checkScript
);

console.log('📄 Script de vérification créé: public/check-firebase-config.js\n');

console.log('💡 Pour vérifier la configuration, ouvrez la console du navigateur');
console.log('   et exécutez: checkFirebaseConfig()\n');

