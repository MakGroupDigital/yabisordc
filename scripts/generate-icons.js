/**
 * Script pour générer les icônes PWA à partir d'une image source
 * 
 * Prérequis: npm install sharp
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Vérifier si sharp est installé
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('📦 Installation de sharp...');
  const { execSync } = require('child_process');
  execSync('npm install sharp --save-dev', { stdio: 'inherit' });
  sharp = require('sharp');
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceImage = path.join(__dirname, '..', 'icon.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

async function generateIcons() {
  console.log('🎨 Génération des icônes PWA...\n');

  // Vérifier si l'image source existe
  if (!fs.existsSync(sourceImage)) {
    console.error('❌ Image source non trouvée:', sourceImage);
    console.log('\n📝 Créez une image icon.png (512x512 minimum) à la racine du projet.');
    
    // Créer une icône placeholder
    console.log('\n🔧 Création d\'icônes placeholder...');
    await createPlaceholderIcons();
    return;
  }

  // Créer le dossier de sortie
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Générer chaque taille
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 136, b: 0, alpha: 1 } // #FF8800
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Généré: icon-${size}x${size}.png`);
    } catch (err) {
      console.error(`❌ Erreur pour ${size}x${size}:`, err.message);
    }
  }

  console.log('\n🎉 Génération terminée!');
  console.log(`📁 Icônes dans: ${outputDir}`);
}

async function createPlaceholderIcons() {
  // Créer le dossier de sortie
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      // Créer une image avec le texte "YB" sur fond orange
      const svg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FF8800;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#FF6600;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
          <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${size * 0.4}" 
                font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
            YB
          </text>
        </svg>
      `;
      
      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Placeholder: icon-${size}x${size}.png`);
    } catch (err) {
      console.error(`❌ Erreur pour ${size}x${size}:`, err.message);
    }
  }

  console.log('\n🎉 Icônes placeholder créées!');
  console.log('💡 Remplacez-les par vos vraies icônes plus tard.');
}

generateIcons().catch(console.error);

