import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public', 'icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log('Generating PWA icons...');
  await sharp(svgBuffer).resize(192, 192).png().toFile('public/pwa-192x192.png');
  await sharp(svgBuffer).resize(512, 512).png().toFile('public/pwa-512x512.png');
  await sharp(svgBuffer).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  await sharp(svgBuffer).resize(512, 512).png().toFile('public/pwa-maskable-512x512.png');
  await sharp(svgBuffer).resize(64, 64).png().toFile('public/favicon.png');
  console.log('All PWA icons generated successfully!');
}

generate().catch(console.error);
