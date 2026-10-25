# SAKSHAM: THE CROWN
### *Every Move Builds a Legacy*
**Made for Saksham Parashar | Created by Om Gupta**

---

## 👑 Executive Overview
**SAKSHAM: THE CROWN** is a bespoke, museum-grade 3D royal chess experience created exclusively for Saksham Parashar's birthday. Built as a self-contained, 100% offline-ready single HTML executable, it combines authentic Indian Maharaja palace architecture (Rajput and Mughal darbar sanctum), organic procedural 3D lathe-turned piece geometry, procedural Pietra Dura floor inlays, dynamic tactical AI, synthesized Web Audio, and authoritative tournament-grade chess engine logic.

---

## 🏛️ Art Direction & Indian Maharaja Royal Darbar Architecture
- **Royal Rajput & Mughal Darbar Palette:** Warm Jaisalmer golden sandstone, antique champagne gold (`#dfb758`), polished Makrana ivory marble, deep carnelian red, and polished obsidian.
- **Background Colonnade & Multifoiled Scalloped Arches:**
  - 4 Monumental Faceted Sandstone Pillars set back to $z = -10.8$ with 2-tier stepped plinths, antique brass torus base moldings, 16-faceted column shafts, fluted bell capitals, 4-way corbel brackets, and gilded abacus slabs.
  - 3 Multifoiled Scalloped Arches spanning between the colonnade pillars, each adorned with 5 interior cusped lobes, carved sandstone keystones, and downward-pointing antique brass lotus bud finials (Padma).
  - Continuous horizontal entablature frieze beam and authentic overhanging slanted Chhajja (traditional Indian eaves) with antique brass trims.
  - High Jaali lattice screens behind side arches, with intricate 8-pointed star fretwork perforations transmitting volumetric warm golden morning sunlight.
- **Distant Royal Darbar Throne Alcove (Maharaja's Gaddi & Chattri):**
  - Framed directly through the grand central scalloped arch at $z = -13.8$.
  - 2-tier stepped octagonal Makrana marble dais with inlaid brass trim rings and a royal crimson velvet carpet runner.
  - Royal Gaddi (Throne cushion) with gilded piping and a royal cylindrical Masnad bolster pillow adorned with gold tassel end caps.
  - Royal Chattri (Canopy of State) supported by 4 slender antique brass pillars, a domed umbrella canopy roof, and a stacked brass Kalasa finial.
- **Traditional Brass Diya Lamp Stands (Deepstambh):**
  - Positioned at $x = \pm 10.5, z = -8.5$ to frame the darbar hall while remaining completely outside the board perimeter.
  - Multi-tiered brass stands holding glowing diya oil lamp flames and casting warm chiaroscuro point lights (`#ffa834`).
- **Flanking Jharokha Balconies:**
  - Pushed far out to $x = \pm 15.0$ with carved corbel support brackets, perforated jaali balustrades, and domed miniature chattri roofs.
- **Lotus Mandala Ceiling Medallion & Temple Luminary:**
  - Overhead at $y = 17.5$ with concentric lotus petal rings, hanging filigree chain, and suspended Deepak Jhumar temple lantern.
- **Pietra Dura Royal Palace Floor:**
  - Procedurally generated high-resolution texture featuring Jaisalmer sandstone flagstone seams, Makrana ivory marble 8-pointed Rajput star mandalas, and carnelian red rosette centers.
- **Chess Pieces Craftsmanship (Ivory & Obsidian with Champagne Gold):**
  - **White (Ivory Alabaster):** Sculpted calcite tone (`#f6efe4`, roughness 0.24, metalness 0.06) with antique champagne gold base trim rings, collar rings, and finials.
  - **Black (Polished Obsidian):** Deep obsidian stone (`#141218`, roughness 0.18, metalness 0.26) with antique champagne gold base rings, collar rings, and crowns.
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
- **THE CHESSBOARD IS THE HERO (Zero Obstruction):**
  - All 64 squares, pieces, coordinates, and indicators remain 100% unobstructed from all angles. Architecture surrounds the player in regal depth without encroaching on the field of play.

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
