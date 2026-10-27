// assemble.js - Compiles the final self-contained SAKSHAM_THE_CROWN.html

const fs = require('fs');
const path = require('path');

console.log('Compiling SAKSHAM: THE CROWN...');

const srcSpChess = 'C:/Users/omgup/.gemini/antigravity/scratch/sp-chess/SP_CHESS.html';
const spContent = fs.readFileSync(srcSpChess, 'utf8');

const s1 = spContent.indexOf('<!-- Three.js r128 (MIT License) -->');
const s2 = spContent.indexOf('<!-- Chess.js 0.10.3 (BSD License) -->');
const s3 = spContent.indexOf('<!-- Tailwind CSS');

if (s1 === -1 || s2 === -1 || s3 === -1) {
    console.error('Failed to locate library boundaries in source file.');
    process.exit(1);
}

const threeScript = spContent.substring(s1, s2).trim();
const chessScript = spContent.substring(s2, s3).trim();

const cssContent = require('./css_styles.js');
const uiHtml = require('./ui_html.js');
const gameJs = require('./game_js.js');

const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>SAKSHAM: THE CROWN — Every Move Builds a Legacy</title>
    <meta name="description" content="SAKSHAM: THE CROWN — A bespoke dark royal 3D chess experience personalized for Saksham Parashar. Procedural WebGL visuals, tournament-grade legal rules, and responsive mobile-first craftsmanship.">

    <!-- Royal Favicon (Inlined Data URI avoids 404 on favicon.ico) -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20 74C35 77 65 77 80 74L77 66C63 68 37 68 23 66L20 74Z' fill='%23dfb758'/%3E%3Cpath d='M22 66L27 40L39 52L50 26L61 52L73 40L78 66C64 69 36 69 22 66Z' fill='%23dfb758'/%3E%3Ccircle cx='50' cy='24' r='3.5' fill='%23fff5d0'/%3E%3C/svg%3E">

    <!-- Google Fonts Preconnect & Stylesheets (with native serif/sans-serif fallbacks) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">

    <!-- Core Engine Dependencies (Inlined for 100% Standalone Offline Execution) -->
    ${threeScript}

    ${chessScript}

    <!-- Custom Luxury Standalone CSS -->
    <style>
${cssContent}
    </style>
</head>
<body>
${uiHtml}

    <!-- Complete Client Application Engine -->
    <script>
${gameJs}
    </script>
</body>
</html>
`;

const target1 = 'C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/SAKSHAM_THE_CROWN.html';
const target2 = 'C:/Users/omgup/AppData/Local/Programs/antigravity/SAKSHAM_THE_CROWN.html';
const target3 = 'C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/index.html';

fs.writeFileSync(target1, finalHtml, 'utf8');
console.log('Saved deliverable 1 to:', target1, 'Size:', fs.statSync(target1).size, 'bytes');

fs.writeFileSync(target2, finalHtml, 'utf8');
console.log('Saved deliverable 2 to:', target2, 'Size:', fs.statSync(target2).size, 'bytes');

fs.writeFileSync(target3, finalHtml, 'utf8');
console.log('Saved deliverable 3 (GitHub Pages entry) to:', target3, 'Size:', fs.statSync(target3).size, 'bytes');

console.log('Assembly completed successfully!');
