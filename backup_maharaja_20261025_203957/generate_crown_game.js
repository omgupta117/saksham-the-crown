const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/omgup/.gemini/antigravity/scratch/sp-chess/SP_CHESS.html';
const spContent = fs.readFileSync(srcPath, 'utf8');

const s1 = spContent.indexOf('<!-- Three.js r128 (MIT License) -->');
const s2 = spContent.indexOf('<!-- Chess.js 0.10.3 (BSD License) -->');
const s3 = spContent.indexOf('<!-- Tailwind CSS');

const threeScript = spContent.substring(s1, s2).trim();
const chessScript = spContent.substring(s2, s3).trim();

// Custom SVG Royal Crown Emblem
const royalCrestSvg = `
<svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="crown-crest-svg">
  <defs>
    <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff5d0"/>
      <stop offset="50%" stop-color="#dfb758"/>
      <stop offset="100%" stop-color="#997322"/>
    </linearGradient>
    <linearGradient id="rubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff6b6b"/>
      <stop offset="100%" stop-color="#c92a2a"/>
    </linearGradient>
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <!-- Laurel Wreath Base -->
  <path d="M22 68C18 58 20 42 30 32C28 40 32 50 38 56C30 58 24 64 22 68Z" fill="url(#goldGrad1)" opacity="0.7"/>
  <path d="M78 68C82 58 80 42 70 32C72 40 68 50 62 56C70 58 76 64 78 68Z" fill="url(#goldGrad1)" opacity="0.7"/>
  <!-- Crown Base Diadem -->
  <path d="M20 74C35 77 65 77 80 74L77 66C63 68 37 68 23 66L20 74Z" fill="url(#goldGrad1)"/>
  <rect x="23" y="67" width="54" height="2" fill="#fff5d0" opacity="0.6"/>
  <!-- Crown Peaks & Fleurons -->
  <path d="M22 66L27 40L39 52L50 26L61 52L73 40L78 66C64 69 36 69 22 66Z" fill="url(#goldGrad1)" filter="url(#goldGlow)"/>
  <!-- Central Imperial Cross -->
  <path d="M48 16H52V26H48V16Z" fill="url(#goldGrad1)"/>
  <path d="M45 19H55V23H45V19Z" fill="url(#goldGrad1)"/>
  <!-- Crown Jewels -->
  <circle cx="27" cy="38" r="3" fill="url(#rubyGrad)"/>
  <circle cx="73" cy="38" r="3" fill="url(#rubyGrad)"/>
  <circle cx="50" cy="24" r="3.5" fill="#fff5d0"/>
  <circle cx="34" cy="70" r="2" fill="url(#rubyGrad)"/>
  <circle cx="50" cy="71" r="2.5" fill="#fff5d0"/>
  <circle cx="66" cy="70" r="2" fill="url(#rubyGrad)"/>
</svg>
`;

const miniCrestSvg = `
<svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="miniGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff5d0"/>
      <stop offset="50%" stop-color="#dfb758"/>
      <stop offset="100%" stop-color="#997322"/>
    </linearGradient>
  </defs>
  <path d="M20 72C35 75 65 75 80 72L77 65C63 67 37 67 23 65L20 72Z" fill="url(#miniGold)"/>
  <path d="M22 65L28 42L39 53L50 30L61 53L72 42L78 65C64 68 36 68 22 65Z" fill="url(#miniGold)"/>
  <path d="M48 20H52V30H48V20Z" fill="url(#miniGold)"/>
  <path d="M45 23H55V27H45V23Z" fill="url(#miniGold)"/>
  <circle cx="50" cy="28" r="3" fill="#fff5d0"/>
</svg>
`;

console.log('SVGs compiled.');
