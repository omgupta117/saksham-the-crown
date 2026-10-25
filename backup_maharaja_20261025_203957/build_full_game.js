// build_full_game.js
// Assembles SAKSHAM_THE_CROWN.html containing inlined Three.js r128, Chess.js 0.10.3,
// custom luxury dark royal CSS, SVG crests, Web Audio synthesizer, procedural 3D pieces,
// authoritative chess rules, AI opponent, camera controls, mobile responsive UI, and dedication.

const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/omgup/.gemini/antigravity/scratch/sp-chess/SP_CHESS.html';
const spContent = fs.readFileSync(srcPath, 'utf8');

const s1 = spContent.indexOf('<!-- Three.js r128 (MIT License) -->');
const s2 = spContent.indexOf('<!-- Chess.js 0.10.3 (BSD License) -->');
const s3 = spContent.indexOf('<!-- Tailwind CSS');

const threeScript = spContent.substring(s1, s2).trim();
const chessScript = spContent.substring(s2, s3).trim();

console.log('Extracted Three.js and Chess.js cleanly.');
