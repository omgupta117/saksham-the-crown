# SAKSHAM: THE CROWN
### *Every Move Builds a Legacy*
**Made for Saksham Parashar | Created by Om Gupta**

---

## 👑 Executive Overview
**SAKSHAM: THE CROWN** is a bespoke, museum-grade 3D royal chess experience created exclusively for Saksham Parashar's birthday. Built as a self-contained, 100% offline-ready single HTML executable, it combines dark fantasy palace aesthetics, organic procedural 3D lathe-turned piece geometry, procedural marble veining, dynamic tactical AI, synthesized Web Audio, and authoritative tournament-grade chess engine logic.

---

## 🏛️ Art Direction & Visual Architecture
- **Royal Dark Fantasy Palette:** Deep obsidian stone, warm antique champagne gold (`#dfb758`), warm ivory marble, and deep Nero Marquina charcoal.
- **Architectural Palace Colonnade & Vaulted Arches:**
  - 5 Grand Columns along the background arcade featuring 2-tier stepped stone plinths, champagne gold torus base rings, fluted shafts, gold capital collars, and Corinthian capitals with gilded abacus blocks.
  - 4 Vaulted Romanesque/Gothic Arches spanning between the background columns with gold keystone blocks and diamond studs.
  - Continuous horizontal entablature frieze beam with gold molding trim.
  - Flanking longitudinal beams linking side columns for true architectural perspective and depth.
  - Sconces mounted on colonnade pillars with gold brackets, candle saucers, glowing flame crystals, and warm chiaroscuro point lights.
  - Suspended overhead Imperial Crown Chandelier with concentric gold rings, 8 radiating arms, candle crystals, and suspension chains.
- **Polished Royal Palace Floor:**
  - Procedurally textured canvas tiles with realistic Nero Marquina marble mottling, stone tile joint seams, and fine gold calcite veins.
  - Specular satin sheen that catches subtle reflections of the chandelier, board, and amber sconces.
- **Chess Pieces Craftsmanship (Ivory & Obsidian with Champagne Gold):**
  - **White (Ivory Alabaster):** Sculpted calcite tone (`#f6efe4`, roughness 0.24, metalness 0.06) with antique champagne gold base trim rings, collar rings, and finials.
  - **Black (Polished Obsidian):** Deep obsidian stone (`#111016`, roughness 0.18, metalness 0.28) with antique champagne gold base rings, collar rings, and crowns.
  - **King:** Sovereign crown with velvet dome, 4 embedded ruby cabochons in the coronet rim, and a ruby gemstone at the Imperial Cross finial.
  - **Queen:** Graceful flaring coronet adorned with 8 pearl fleurons and an imperial finial jewel.
  - **Bishop:** Slender inquisitor mitre with a diagonal cleft cut and an inlaid gold collar ring.
  - **Knight:** Iconic 3D horse-head bust angled at 45° to display its profile, arched neck, mane crest, cranium, and upright ears to both players.
  - **Rook:** Formidable fortress tower with 4 clean crenellated battlements, gold collar ring, and 4 arrow-slit embrasures.
  - **Pawn:** Classical Staunton lathe profile topped with a gold collar ring and polished gold finial bead.
- **Palace Pedestal & Inscription:**
  - Stepped royal dias with gold inlaid border detailing and 64-square inner gold border.
  - 4 ornate corner brackets with pyramid gold studs.
  - Carved royal dedication plaque on both player horizons:
    `SAKSHAM : THE CROWN — EVERY MOVE BUILDS A LEGACY — MADE FOR SAKSHAM PARASHAR • CREATED BY OM GUPTA`.
- **Cinematic Lighting & Atmosphere:**
  - Chandelier key light (`#fff2de`), ambient shadow fill (`#1a1624`), overhead luminary (`#e8c15a`), and sapphire rim backlight (`#788cd2`).
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
- **Universal 17-Viewport Device Matrix Passed (`verify_responsive_matrix.js`):**
  - 17 of 17 device viewports tested (from 320px compact phones to 4K desktop, in both portrait and landscape).
  - **0px horizontal page overflow** and **0 console errors** across all screen sizes.
- **Browser DevTools Protocol Verification (`verify_cdp.js`):**
  - Canvas initialization verified (`754x480`).
  - Title transition and board mounting verified.
  - **0 console errors / 0 runtime exceptions**.
- **Real Browser Screenshots Captured (`capture_gallery.js`):**
  - `screenshot_title.png`: Title screen & royal dedication badge.
  - `screenshot_board.png`: Pristine starting board, marble squares, and pedestal plaque.
  - `screenshot_gameplay.png`: Active match with legal move indicators and turn status.
  - `screenshot_victory.png`: Checkmate and sovereign victory modal.
