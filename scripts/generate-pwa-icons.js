import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const sizes = [192, 512];
const inputSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#4F46E5"/>
  <circle cx="256" cy="256" r="180" stroke="white" stroke-width="32"/>
  <path d="M256 140V256L340 340" stroke="white" stroke-width="32" stroke-linecap="round"/>
</svg>
`;

async function generateIcons() {
  try {
    // Ensure the public directory exists
    await fs.mkdir('public', { recursive: true });

    // Generate PNG icons for different sizes
    for (const size of sizes) {
      const buffer = Buffer.from(inputSvg);
      await sharp(buffer)
        .resize(size, size)
        .png()
        .toFile(path.join('public', `pwa-${size}x${size}.png`));
      
      console.log(`Generated ${size}x${size} icon`);
    }

    // Generate favicon.ico
    await sharp(Buffer.from(inputSvg))
      .resize(32, 32)
      .toFile(path.join('public', 'favicon.ico'));
    
    console.log('Generated favicon.ico');

    // Generate apple-touch-icon
    await sharp(Buffer.from(inputSvg))
      .resize(180, 180)
      .png()
      .toFile(path.join('public', 'apple-touch-icon.png'));
    
    console.log('Generated apple-touch-icon.png');

    // Save original SVG as a maskable icon for Safari pinned tab
    await fs.writeFile(path.join('public', 'masked-icon.svg'), inputSvg);

    console.log('Generated masked-icon.svg');

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 