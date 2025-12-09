/**
 * Script pour générer tous les assets (favicons, icônes, images OG) à partir du logo officiel
 * 
 * Prérequis: npm install sharp
 * Usage: node scripts/generate-all-assets.js [chemin-vers-logo.png]
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

// URL du logo officiel depuis Cloudinary
const LOGO_URL = 'https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png';
const LOGO_LOCAL = path.join(__dirname, '..', 'logo-source.png');

// Tailles pour les icônes PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Tailles pour les favicons
const FAVICON_SIZES = [16, 32, 48];

// Tailles pour les images OG (Open Graph)
const OG_SIZES = [
  { width: 1200, height: 630, name: 'og-image.png' }, // Standard OG
  { width: 1200, height: 1200, name: 'og-image-square.png' }, // Square
  { width: 1920, height: 1080, name: 'og-image-wide.png' }, // Wide
];

async function downloadLogo() {
  console.log('📥 Téléchargement du logo officiel...');
  
  try {
    const https = require('https');
    const file = fs.createWriteStream(LOGO_LOCAL);
    
    return new Promise((resolve, reject) => {
      https.get(LOGO_URL, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('✅ Logo téléchargé');
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(LOGO_LOCAL, () => {});
        reject(err);
      });
    });
  } catch (error) {
    console.error('❌ Erreur téléchargement:', error.message);
    throw error;
  }
}

async function generateIcons() {
  console.log('\n🎨 Génération des icônes PWA...');
  
  const outputDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const size of ICON_SIZES) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(LOGO_LOCAL)
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
}

async function generateFavicons() {
  console.log('\n🎯 Génération des favicons...');
  
  const outputDir = path.join(__dirname, '..', 'public');
  
  // Générer favicon.ico (multi-size ICO)
  try {
    // Générer les différentes tailles
    const faviconImages = [];
    for (const size of FAVICON_SIZES) {
      const buffer = await sharp(LOGO_LOCAL)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 136, b: 0, alpha: 1 }
        })
        .png()
        .toBuffer();
      faviconImages.push({ size, buffer });
    }
    
    // Pour simplifier, on génère juste un PNG 32x32 comme favicon
    await sharp(LOGO_LOCAL)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 136, b: 0, alpha: 1 }
      })
      .png()
      .toFile(path.join(outputDir, 'favicon.ico'));
    
    console.log('✅ Généré: favicon.ico');
    
    // Générer aussi apple-touch-icon
    await sharp(LOGO_LOCAL)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 136, b: 0, alpha: 1 }
      })
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    
    console.log('✅ Généré: apple-touch-icon.png');
  } catch (err) {
    console.error('❌ Erreur favicon:', err.message);
  }
}

async function generateOGImages() {
  console.log('\n🖼️  Génération des images OG (partage social)...');
  
  const outputDir = path.join(__dirname, '..', 'public');
  
  for (const { width, height, name } of OG_SIZES) {
    try {
      // Créer une image avec le logo centré sur fond orange
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FF8800;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#FF6600;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#grad)"/>
          <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="${width * 0.08}" 
                font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
            Ya Biso RDC
          </text>
          <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${width * 0.04}" 
                fill="white" text-anchor="middle" dominant-baseline="middle">
            Découvrez l'âme du Congo
          </text>
        </svg>
      `;
      
      // Charger le logo et le superposer
      const logoBuffer = await sharp(LOGO_LOCAL)
        .resize(Math.min(width, height) * 0.4, Math.min(width, height) * 0.4, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();
      
      await sharp(Buffer.from(svg))
        .composite([{
          input: logoBuffer,
          top: Math.floor(height * 0.25),
          left: Math.floor((width - Math.min(width, height) * 0.4) / 2),
        }])
        .png()
        .toFile(path.join(outputDir, name));
      
      console.log(`✅ Généré: ${name}`);
    } catch (err) {
      console.error(`❌ Erreur pour ${name}:`, err.message);
    }
  }
}

async function generateScreenshots() {
  console.log('\n📸 Génération des screenshots placeholder...');
  
  const outputDir = path.join(__dirname, '..', 'public', 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Générer des screenshots placeholder (1080x1920 pour mobile)
  try {
    const svg = `
      <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF8800;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FF6600;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="72" 
              font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
          Ya Biso RDC
        </text>
        <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="36" 
              fill="white" text-anchor="middle" dominant-baseline="middle">
          Screenshot
        </text>
      </svg>
    `;
    
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(outputDir, 'screenshot-1.png'));
    
    console.log('✅ Généré: screenshot-1.png');
  } catch (err) {
    console.error('❌ Erreur screenshot:', err.message);
  }
}

async function main() {
  console.log('🚀 Génération de tous les assets Ya Biso RDC\n');
  
  try {
    // Télécharger le logo si nécessaire
    if (!fs.existsSync(LOGO_LOCAL)) {
      await downloadLogo();
    } else {
      console.log('✅ Logo local trouvé, utilisation du fichier existant');
    }
    
    // Générer tous les assets
    await generateIcons();
    await generateFavicons();
    await generateOGImages();
    await generateScreenshots();
    
    console.log('\n🎉 Génération terminée!');
    console.log('📁 Assets dans: public/');
    console.log('   - icons/ (icônes PWA)');
    console.log('   - favicon.ico, apple-touch-icon.png');
    console.log('   - og-image*.png (images de partage)');
    console.log('   - screenshots/ (captures d\'écran)');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();

