const fs = require('fs');
const path = require('path');

console.log('Writing build_crown_app.js...');

// We will construct the entire HTML file in one clean, reliable script
const targetHtmlPath = 'C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/SAKSHAM_THE_CROWN.html';
const altHtmlPath = 'C:/Users/omgup/AppData/Local/Programs/antigravity/SAKSHAM_THE_CROWN.html';

const spChessPath = 'C:/Users/omgup/.gemini/antigravity/scratch/sp-chess/SP_CHESS.html';
const spContent = fs.readFileSync(spChessPath, 'utf8');

const s1 = spContent.indexOf('<!-- Three.js r128 (MIT License) -->');
const s2 = spContent.indexOf('<!-- Chess.js 0.10.3 (BSD License) -->');
const s3 = spContent.indexOf('<!-- Tailwind CSS');

const threeScript = spContent.substring(s1, s2).trim();
const chessScript = spContent.substring(s2, s3).trim();

// Next we will write the full generator
