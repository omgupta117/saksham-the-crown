# SAKSHAM: THE CROWN
### *Every Move Builds a Legacy*
**Made for Saksham Parashar | Created by Om Gupta**

---

## 👑 Executive Overview
**SAKSHAM: THE CROWN** is a bespoke, museum-grade 3D royal chess experience created exclusively for Saksham Parashar's birthday. Built as a self-contained, 100% offline-capable single HTML executable, it combines dark fantasy palace aesthetics, organic procedural 3D lathe-turned piece geometry, procedural marble veining, dynamic tactical AI, synthesized Web Audio, and authoritative tournament-grade chess engine logic.

---

## 🏛️ Art Direction & Visual Architecture
- **Royal Dark Fantasy Palette:** Deep obsidian stone, warm antique champagne gold (`#dfb758`), warm ivory marble, and deep Nero Marquina charcoal.
- **Organic Procedural Marble Squares:** Procedurally generated in HTML5 Canvas at runtime with delicate golden calcite veining and soft cloud mottling. Glare-free and high contrast.
- **Layered Procedural Staunton Silhouettes (`THREE.LatheGeometry`):**
  - **King:** Sovereign crown with velvet dome, 4 embedded ruby cabochons in the coronet rim, and a ruby gemstone at the Imperial Cross finial.
  - **Queen:** Graceful flaring coronet adorned with 8 pearl fleurons and an imperial finial jewel.
  - **Bishop:** Slender inquisitor mitre with a diagonal cleft cut and an inlaid gold collar ring.
  - **Knight:** Iconic 3D horse-head bust angled at 45° to display its profile, arched neck, mane crest, cranium, and upright ears to both players.
  - **Rook:** Formidable fortress tower with 4 clean crenellated battlements and 4 arrow-slit embrasures.
  - **Pawn:** Classical Staunton lathe profile topped with a polished gold finial bead.
- **Palace Pedestal & Inscription:**
  - Stepped royal dias with gold inlaid border detailing.
  - 4 ornate corner brackets with pyramid gold studs.
  - Carved royal dedication plaque on both player horizons: `SAKSHAM : THE CROWN — MADE FOR SAKSHAM PARASHAR • CREATED BY OM GUPTA`.
- **Cinematic Lighting & Atmosphere:**
  - Chandelier key light (`#ffecd0`), ambient shadow fill, overhead amber sconce (`#e8c15a`), and sapphire rim backlight (`#8294e0`).
  - Soft radial contact shadow disks beneath every piece.
  - Subtle floating golden dust motes and cinematic edge vignette.

---

## ⚔️ Gameplay & Engine Features
1. **Authoritative Tournament Rules (Inlined Chess.js 0.10.3):**
   - 100% legal chess logic: Castling ($O-O$ / $O-O-O$), En Passant, Pawn Promotion modal (Queen, Rook, Bishop, Knight), Checkmate, Stalemate, Threefold Repetition, 50-move rule, and Insufficient Material draws.
2. **Royal Tactical AI Engine:**
   - Minimax algorithm with Alpha-Beta pruning, piece-square positional evaluation tables, tactical material scoring, and king-safety evaluations.
   - 3 selectable difficulty tiers: Squire (Novice), Knight (Adept), Monarch (Master).
3. **Pass & Play Mode:**
   - Seamless two-player local match mode on one device with 180° board flipping (`F` key or toolbar button).
4. **Cinematic Opening & Camera Controller:**
   - Opening title screen with slow establishing orbit over the royal board.
   - On clicking *"ENTER THE SANCTUM & PLAY"*, a D-major royal chord swells as the camera gracefully swoops into the heroic playing perspective.
   - Free orbit (drag), pinch-to-zoom / scroll wheel zoom, and camera view presets (Cinematic, Overhead, Perspective).
5. **Procedural Web Audio Synthesizer:**
   - Inlined zero-asset Web Audio API: tactile wood/marble piece placement thud, crystal capture impact, royal tension minor chord on Check, ascending arpeggio on Victory, and royal sanctum entrance chord.

---

## 🚀 How to Launch & Play
Double-click either file to play instantly in your default web browser (Chrome, Edge, Firefox, Safari):

- **1-Click Windows Launcher:**
  `launch_game.bat`
- **Direct HTML Deliverable:**
  `SAKSHAM_THE_CROWN.html`

*No installation, no npm, no local web server, and no internet connection required.*

---

## 🧪 Automated QA & Verification Proof
- **35/35 Automated Tests Passed (`test_suite.js`):**
  - Initial position & move count (20 moves)
  - Scholar's Mate checkmate & game over detection
  - King safety & illegal move rejection
  - Kingside ($O-O$) & Queenside ($O-O-O$) castling state & rook repositioning
  - En passant capture & pawn removal
  - 4-way promotion modal choices & Queen promotion
  - Stalemate & draw detection without check
  - Threefold repetition draw detection
  - Insufficient material draw detection
  - Full undo state & FEN restoration
  - Three.js r128 procedural piece group generation (12/12)
  - Royal AI Mate-in-1 tactical solving ($Qxf7\#$)
- **Browser DevTools Protocol Verification (`verify_cdp.js`):**
  - Canvas initialization verified (`754x480`).
  - Title transition and board mounting verified.
  - **0 console errors / 0 runtime exceptions**.
- **Real Browser Screenshots Captured (`capture_gallery.js`):**
  - `screenshot_title.png`: Title screen & royal dedication badge.
  - `screenshot_board.png`: Pristine starting board, marble squares, and pedestal plaque.
  - `screenshot_gameplay.png`: Active match with legal move indicators and turn status.
  - `screenshot_victory.png`: Checkmate and sovereign victory modal.
