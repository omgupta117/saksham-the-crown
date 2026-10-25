const fs = require('fs');
const path = require('path');

console.log('Starting SAKSHAM: THE CROWN builder...');

// Read Three.js and Chess.js from sp-chess
const spChessPath = 'C:/Users/omgup/.gemini/antigravity/scratch/sp-chess/SP_CHESS.html';
if (!fs.existsSync(spChessPath)) {
    console.error('Source SP_CHESS.html not found at', spChessPath);
    process.exit(1);
}

const spContent = fs.readFileSync(spChessPath, 'utf8');

// Extract Three.js r128
const threeStartMarker = '<!-- Three.js r128 (MIT License) -->';
const chessStartMarker = '<!-- Chess.js 0.10.3 (BSD License) -->';
const tailwindStartMarker = '<!-- Tailwind CSS';

const s1 = spContent.indexOf(threeStartMarker);
const s2 = spContent.indexOf(chessStartMarker);
const s3 = spContent.indexOf(tailwindStartMarker);

if (s1 === -1 || s2 === -1 || s3 === -1) {
    console.error('Could not locate library markers in source file!');
    process.exit(1);
}

const threeBlock = spContent.substring(s1, s2).trim();
const chessBlock = spContent.substring(s2, s3).trim();

console.log(`Extracted Three.js r128: ${threeBlock.length} bytes`);
console.log(`Extracted Chess.js 0.10.3: ${chessBlock.length} bytes`);
