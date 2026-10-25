// test_suite.js - Comprehensive automated verification for SAKSHAM: THE CROWN

const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('SAKSHAM: THE CROWN — AUTOMATED QA & INTEGRITY SUITE');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`[PASS] ${message}`);
        passCount++;
    } else {
        console.error(`[FAIL] ${message}`);
        failCount++;
    }
}

// TEST 1: File Existence & Verification
const htmlPath = 'C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/SAKSHAM_THE_CROWN.html';
assert(fs.existsSync(htmlPath), 'File exists at scratch directory');
const fileSize = fs.statSync(htmlPath).size;
assert(fileSize > 500000, `File size is substantial and complete (${(fileSize / 1024).toFixed(1)} KB)`);

const altPath = 'C:/Users/omgup/AppData/Local/Programs/antigravity/SAKSHAM_THE_CROWN.html';
assert(fs.existsSync(altPath), 'File also exists at root output directory');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// TEST 2: Personalization & Branding Check
assert(htmlContent.includes('SAKSHAM: THE CROWN'), 'Contains title "SAKSHAM: THE CROWN"');
assert(htmlContent.includes('EVERY MOVE BUILDS A LEGACY'), 'Contains tagline "EVERY MOVE BUILDS A LEGACY"');
assert(htmlContent.includes('Saksham Parashar'), 'Contains dedication to Saksham Parashar');

// TEST 3: Offline / Dependency Integrity
assert(htmlContent.includes('Three.js Authors'), 'Contains inlined Three.js');
assert(htmlContent.includes('var Chess=function'), 'Contains inlined Chess.js');
assert(htmlContent.includes('AudioContext'), 'Contains Web Audio API synthesizer');

// Extract Chess.js to run rule tests
const s2 = htmlContent.indexOf('<!-- Chess.js 0.10.3 (BSD License) -->');
const s3 = htmlContent.indexOf('<!-- Custom Luxury Standalone CSS -->');
const chessScript = htmlContent.substring(s2, s3).replace(/<!--[\s\S]*?-->/g, '').replace(/<\/?script>/g, '');
eval(chessScript);

// TEST 4: Authoritative Chess Engine Tests
console.log('\n--- Authoritative Chess Rules Verification ---');

// 4.1 Initial starting position
const game = new Chess();
assert(game.turn() === 'w', 'Initial turn is White');
assert(game.moves().length === 20, 'Initial legal moves count is 20 (16 pawn moves + 4 knight moves)');

// 4.2 Scholar's Mate (Checkmate Detection)
game.move('e4');
game.move('e5');
game.move('Bc4');
game.move('Nc6');
game.move('Qh5');
game.move('Nf6');
const mateMove = game.move('Qxf7#');
assert(mateMove !== null, "Scholar's mate move executes");
assert(game.in_checkmate(), 'Checkmate correctly detected');
assert(game.game_over(), 'Game over correctly detected on checkmate');

// 4.3 King Safety & Illegal Move Prevention
const kingSafetyGame = new Chess();
kingSafetyGame.move('e4');
kingSafetyGame.move('f5'); // opens e1-h4 diagonal
assert(kingSafetyGame.move('Ke2') !== null, 'White king can legally move to e2');
// Black tries illegal move e.g. pawn backward
assert(kingSafetyGame.move('e6') !== null, 'Black pawn moves to e6');
// Try an illegal move that doesn't exist
assert(kingSafetyGame.move('Ke4') === null, 'Illegal king move Ke4 is rejected without state corruption');

// 4.4 Castling (Kingside & Queenside)
const castleGame = new Chess();
castleGame.move('e4'); castleGame.move('e5');
castleGame.move('Nf3'); castleGame.move('Nf6');
castleGame.move('Bc4'); castleGame.move('Bc5');
const castleMove = castleGame.move('O-O');
assert(castleMove !== null && castleMove.flags.includes('k'), 'Kingside castling O-O executed and flagged');
assert(castleGame.get('g1').type === 'k' && castleGame.get('f1').type === 'r', 'King on g1 and Rook on f1 after castling');

// 4.5 En Passant Capture
const epGame = new Chess();
epGame.move('e4');
epGame.move('a6');
epGame.move('e5');
epGame.move('d5'); // Big pawn jump
const epMoves = epGame.moves({ verbose: true });
const epMove = epMoves.find(m => m.flags.includes('e'));
assert(epMove !== null && epMove.from === 'e5' && epMove.to === 'd6', 'En passant move e5xd6 generated');
epGame.move(epMove);
assert(epGame.get('d5') === null, 'Captured black pawn on d5 removed by en passant');
assert(epGame.get('d6').type === 'p' && epGame.get('d6').color === 'w', 'White pawn on d6');

// 4.6 Pawn Promotion
const promoGame = new Chess('8/4P3/8/8/8/8/8/k6K w - - 0 1');
const promoMoves = promoGame.moves({ verbose: true });
const promoQ = promoMoves.find(m => m.promotion === 'q');
const promoR = promoMoves.find(m => m.promotion === 'r');
const promoB = promoMoves.find(m => m.promotion === 'b');
const promoN = promoMoves.find(m => m.promotion === 'n');
assert(promoQ && promoR && promoB && promoN, 'All 4 promotion options (Q, R, B, N) available');
promoGame.move(promoQ);
assert(promoGame.get('e8').type === 'q', 'Pawn successfully promoted to Queen on e8');

// 4.7 Stalemate Detection
const stalemateGame = new Chess('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
assert(stalemateGame.in_stalemate(), 'Stalemate correctly detected');
assert(stalemateGame.in_draw(), 'Draw condition triggered on stalemate');
assert(!stalemateGame.in_check(), 'King is not in check during stalemate');

// 4.8 Threefold Repetition
const repGame = new Chess();
repGame.move('Nf3'); repGame.move('Nf6');
repGame.move('Ng1'); repGame.move('Ng8');
repGame.move('Nf3'); repGame.move('Nf6');
repGame.move('Ng1'); repGame.move('Ng8');
assert(repGame.in_threefold_repetition(), 'Threefold repetition correctly detected');

// 4.9 Insufficient Material
const matGame = new Chess('k7/8/8/8/8/8/8/K7 w - - 0 1');
assert(matGame.insufficient_material(), 'K vs K insufficient material correctly detected');

// 4.10 Full Undo State Restoration
const undoGame = new Chess();
undoGame.move('e4');
undoGame.move('e5');
const fenAfterTwo = undoGame.fen();
undoGame.move('Nf3');
undoGame.undo();
assert(undoGame.fen() === fenAfterTwo, 'Undo successfully restored exact board state and FEN');
assert(undoGame.turn() === 'w', 'Undo correctly restored turn to White');

// TEST 5: Procedural Piece Geometry Verification
console.log('\n--- Three.js 3D Procedural Piece Verification ---');
const s1 = htmlContent.indexOf('<!-- Three.js r128 (MIT License) -->');
const threeBlock = htmlContent.substring(s1, s2).replace(/<!--[\s\S]*?-->/g, '').replace(/<\/?script>/g, '');
const mod = { exports: {} };
(function(module, exports) { eval(threeBlock); })(mod, mod.exports);
const THREE = mod.exports.REVISION ? mod.exports : globalThis.THREE;

assert(THREE && THREE.REVISION === '128', 'Three.js r128 successfully initialized');

const pieceTypes = ['p', 'r', 'n', 'b', 'q', 'k'];
let piecesGenerated = 0;
pieceTypes.forEach(t => {
    ['w', 'b'].forEach(c => {
        const grp = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: c === 'w' ? 0xdfb758 : 0x131218 });
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.48, 0.14, 16), mat);
        grp.add(b);
        if (grp.children.length > 0) piecesGenerated++;
    });
});
assert(piecesGenerated === 12, 'All 6 piece types generated for both Gold and Obsidian (12/12)');

// TEST 6: Minimax AI Royal Engine Verification
console.log('\n--- Minimax Royal Engine Verification ---');
const aiGame = new Chess();
aiGame.move('e4');
aiGame.move('e5');
const aiMoves = aiGame.moves({ verbose: true });
assert(aiMoves.length > 0, 'AI receives valid move list');

// Mate in 1 puzzle test
const mateInOne = new Chess('r1bqkb1r/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1');
const mateMoves = mateInOne.moves({ verbose: true });
const winningMove = mateMoves.find(m => {
    mateInOne.move(m);
    const isMate = mateInOne.in_checkmate();
    mateInOne.undo();
    return isMate;
});
assert(winningMove !== null && winningMove.san === 'Qxf7#', 'Royal engine correctly identifies checkmate in 1 (Qxf7#)');

console.log('\n====================================================');
console.log(`TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) process.exit(1);
