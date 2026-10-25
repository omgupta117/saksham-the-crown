// ui_html.js - Refined UI markup for SAKSHAM: THE CROWN

module.exports = `
    <!-- Atmospheric Cinematic Vignette -->
    <div id="vignette-overlay"></div>

    <!-- 3D WebGL Canvas -->
    <div id="canvas-container" aria-label="3D Royal Chessboard View"></div>

    <!-- Floating Toast Notification -->
    <div id="toast-container" class="crown-glass" role="status" aria-live="polite">
        <span id="toast-icon">👑</span>
        <span id="toast-msg">The Crown Sanctum is Ready</span>
    </div>

    <!-- Top App Navigation Bar -->
    <header id="top-bar" class="crown-glass" role="banner">
        <!-- Brand Section -->
        <div class="brand-section">
            <div class="brand-crest" title="Saksham: The Crown Insignia">
                <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
                    <path d="M20 72C35 75 65 75 80 72L77 65C63 67 37 67 23 65L20 72Z" fill="#dfb758"/>
                    <path d="M22 65L28 42L39 53L50 30L61 53L72 42L78 65C64 68 36 68 22 65Z" fill="#dfb758"/>
                    <circle cx="50" cy="28" r="3.5" fill="#fff5d0"/>
                </svg>
            </div>
            <div class="brand-text-wrap">
                <div class="brand-title">THE CROWN</div>
                <div class="brand-dedication">FOR SAKSHAM PARASHAR &bull; BY OM GUPTA</div>
            </div>
        </div>

        <!-- Dynamic Live Turn Status -->
        <div class="status-section" id="turn-container">
            <span id="turn-orb"></span>
            <span id="turn-text">Gold's Move</span>
            <span id="status-badge">Live</span>
            <span id="material-pill">+0</span>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
            <button onclick="requestRoyalHint()" class="crown-btn-icon" title="Royal Insight / Hint" aria-label="Royal Hint">
                💡
            </button>
            <button onclick="undoLastMove()" class="crown-btn-icon" title="Undo Last Move" aria-label="Undo Move">
                ↩️
            </button>
            <button onclick="toggleFlipBoard()" class="crown-btn-icon" title="Rotate Board 180°" aria-label="Flip Board">
                🔄
            </button>
            <button onclick="cycleCameraView()" class="crown-btn-icon hide-mobile" title="Cycle Camera Angle" aria-label="Camera Presets">
                🎥
            </button>
            <button onclick="toggleSound()" class="crown-btn-icon" id="sound-btn" title="Toggle Sound" aria-label="Sound Toggle">
                🔊
            </button>
            <button onclick="openHistoryDrawer()" class="crown-btn-icon" title="Move History" aria-label="Move History">
                📜
            </button>
            <button onclick="confirmRestart()" class="crown-btn-icon" title="New Match" aria-label="Restart Match">
                ✨
            </button>
            <button onclick="confirmReturnToMenu()" class="crown-btn-icon" title="Main Menu" aria-label="Return to Menu">
                🏛️
            </button>
        </div>
    </header>

    <!-- Bottom Bar / Captured Pieces Graveyard -->
    <div id="bottom-bar" class="crown-glass">
        <div class="graveyard-wrap">
            <div class="graveyard-side">
                <span class="graveyard-label">Gold Graveyard:</span>
                <div class="graveyard-pieces" id="graveyard-gold"></div>
            </div>
            <div style="width: 1px; height: 16px; background: rgba(223, 183, 88, 0.2);"></div>
            <div class="graveyard-side">
                <span class="graveyard-label">Obsidian Graveyard:</span>
                <div class="graveyard-pieces" id="graveyard-obsidian"></div>
            </div>
        </div>
        <div class="actions-section">
            <button onclick="toggleCoords()" class="crown-btn-dark hide-mobile" style="padding: 5px 12px; font-size: 11px;" id="coords-btn">
                Coords: On
            </button>
        </div>
    </div>

    <!-- Title Screen / Main Menu -->
    <div id="title-screen">
        <div class="menu-card crown-glass-gold" style="border-radius: 32px; padding: 34px 28px;">
            <!-- Crown Insignia SVG -->
            <div class="crown-logo-box">
                <svg width="76" height="76" viewBox="0 0 100 100" fill="none">
                    <defs>
                        <linearGradient id="mainGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#fff5d0"/>
                            <stop offset="50%" stop-color="#dfb758"/>
                            <stop offset="100%" stop-color="#966f21"/>
                        </linearGradient>
                    </defs>
                    <path d="M22 68C18 58 20 42 30 32C28 40 32 50 38 56C30 58 24 64 22 68Z" fill="url(#mainGoldGrad)" opacity="0.6"/>
                    <path d="M78 68C82 58 80 42 70 32C72 40 68 50 62 56C70 58 76 64 78 68Z" fill="url(#mainGoldGrad)" opacity="0.6"/>
                    <path d="M20 74C35 77 65 77 80 74L77 66C63 68 37 68 23 66L20 74Z" fill="url(#mainGoldGrad)"/>
                    <path d="M22 66L27 40L39 52L50 26L61 52L73 40L78 66C64 69 36 69 22 66Z" fill="url(#mainGoldGrad)"/>
                    <path d="M48 16H52V26H48V16Z" fill="url(#mainGoldGrad)"/>
                    <path d="M45 19H55V23H45V19Z" fill="url(#mainGoldGrad)"/>
                    <circle cx="50" cy="24" r="3" fill="#fff5d0"/>
                    <circle cx="27" cy="38" r="2.5" fill="#e63946"/>
                    <circle cx="73" cy="38" r="2.5" fill="#e63946"/>
                </svg>
            </div>

            <!-- Title & Subtitle -->
            <h1 class="menu-main-title gold-text">SAKSHAM: THE CROWN</h1>
            <p class="menu-subtitle">EVERY MOVE BUILDS A LEGACY</p>

            <!-- Dedication Card -->
            <div class="menu-dedication-badge">
                <span>👑</span>
                <span>MADE FOR SAKSHAM PARASHAR &bull; CREATED BY OM GUPTA</span>
            </div>

            <!-- Mode Selector -->
            <div class="mode-selection-group">
                <div class="mode-card active" id="mode-card-2p" onclick="selectGameMode('pass_and_play')">
                    <span class="mode-icon">👥</span>
                    <span class="mode-title">PASS & PLAY</span>
                    <span class="mode-desc">Two monarchs on one device</span>
                </div>
                <div class="mode-card" id="mode-card-ai" onclick="selectGameMode('ai')">
                    <span class="mode-icon">🤖</span>
                    <span class="mode-title">ROYAL ENGINE</span>
                    <span class="mode-desc">Challenge the Crown AI</span>
                </div>
            </div>

            <!-- AI Sub-Options (Hidden by default in 2P mode) -->
            <div id="ai-options-panel" style="display: none;">
                <div class="option-row">
                    <span class="option-label">Your Color</span>
                    <div class="pill-group">
                        <button class="pill-btn active" id="side-gold" onclick="selectPlayerSide('w')">Gold (White)</button>
                        <button class="pill-btn" id="side-obsidian" onclick="selectPlayerSide('b')">Obsidian (Black)</button>
                    </div>
                </div>
                <div class="option-row">
                    <span class="option-label">Difficulty</span>
                    <div class="pill-group">
                        <button class="pill-btn active" id="diff-novice" onclick="selectDifficulty('novice')">Squire</button>
                        <button class="pill-btn" id="diff-adept" onclick="selectDifficulty('adept')">Knight</button>
                        <button class="pill-btn" id="diff-master" onclick="selectDifficulty('master')">Monarch</button>
                    </div>
                </div>
            </div>

            <!-- Secondary Options Row -->
            <div class="menu-options-row">
                <button onclick="toggleGraphicsMode()" class="crown-btn-dark" style="padding: 6px 14px; font-size: 11px;" id="graphics-toggle-btn">
                    Graphics: High
                </button>
                <button onclick="openDedicationModal()" class="crown-btn-dark" style="padding: 6px 14px; font-size: 11px;">
                    Royal Inscription
                </button>
            </div>

            <!-- Big Launch Button -->
            <button onclick="startGameFromMenu()" class="crown-btn crown-btn-gold cta-play-btn">
                <span>ENTER THE SANCTUM & PLAY</span>
                <span>👑</span>
            </button>
        </div>
    </div>

    <!-- Pawn Promotion Modal -->
    <div id="promotion-modal" class="modal-backdrop">
        <div class="modal-card crown-glass-gold">
            <h2 class="modal-title gold-text">CHOOSE PROMOTION</h2>
            <p class="modal-subtitle">Your pawn ascends to royal nobility. Select its title:</p>
            <div class="promotion-grid">
                <div class="promotion-card" onclick="commitPromotion('q')">
                    <span class="promotion-icon">♛</span>
                    <span class="promotion-name">Queen</span>
                    <span class="promotion-key">[Q]</span>
                </div>
                <div class="promotion-card" onclick="commitPromotion('r')">
                    <span class="promotion-icon">♜</span>
                    <span class="promotion-name">Rook</span>
                    <span class="promotion-key">[R]</span>
                </div>
                <div class="promotion-card" onclick="commitPromotion('b')">
                    <span class="promotion-icon">♝</span>
                    <span class="promotion-name">Bishop</span>
                    <span class="promotion-key">[B]</span>
                </div>
                <div class="promotion-card" onclick="commitPromotion('n')">
                    <span class="promotion-icon">♞</span>
                    <span class="promotion-name">Knight</span>
                    <span class="promotion-key">[N]</span>
                </div>
            </div>
            <button onclick="cancelPromotion()" class="crown-btn crown-btn-dark" style="font-size: 12px; padding: 8px 16px;">
                Cancel Promotion
            </button>
        </div>
    </div>

    <!-- Game Over / Victory Modal -->
    <div id="game-over-modal" class="modal-backdrop">
        <div class="modal-card crown-glass-gold">
            <div style="font-size: 42px; margin-bottom: 8px;" id="game-over-icon">🏆</div>
            <h2 class="modal-title gold-text" id="game-over-title">ROYAL CHECKMATE</h2>
            <p class="modal-subtitle" id="game-over-reason">Gold has claimed sovereign victory.</p>
            
            <div style="background: rgba(10, 9, 15, 0.7); border: 1px solid rgba(223, 183, 88, 0.2); border-radius: 16px; padding: 14px; margin-bottom: 22px; font-size: 13px; font-family: var(--font-mono); display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div>Total Moves: <span id="stat-moves" style="color: var(--gold-light); font-weight: 700;">0</span></div>
                <div>Pieces Fallen: <span id="stat-captures" style="color: var(--gold-light); font-weight: 700;">0</span></div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button onclick="playAgain()" class="crown-btn crown-btn-gold">
                    Play Again
                </button>
                <button onclick="closeGameOverModal()" class="crown-btn crown-btn-dark">
                    Review Board
                </button>
                <button onclick="returnToMenuFromGameOver()" class="crown-btn crown-btn-dark">
                    Main Menu
                </button>
            </div>
        </div>
    </div>

    <!-- Restart Confirmation Modal -->
    <div id="restart-modal" class="modal-backdrop">
        <div class="modal-card crown-glass">
            <h2 class="modal-title gold-text">RESTART MATCH?</h2>
            <p class="modal-subtitle">Current match progress will be cleared. Do you wish to restart?</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="executeRestart()" class="crown-btn crown-btn-gold">
                    Yes, Restart
                </button>
                <button onclick="closeRestartModal()" class="crown-btn crown-btn-dark">
                    Cancel
                </button>
            </div>
        </div>
    </div>

    <!-- Menu Confirmation Modal -->
    <div id="menu-confirm-modal" class="modal-backdrop">
        <div class="modal-card crown-glass">
            <h2 class="modal-title gold-text">RETURN TO MENU?</h2>
            <p class="modal-subtitle">Leave active game and return to title sanctum?</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="executeReturnToMenu()" class="crown-btn crown-btn-gold">
                    Exit to Menu
                </button>
                <button onclick="closeMenuConfirmModal()" class="crown-btn crown-btn-dark">
                    Stay in Match
                </button>
            </div>
        </div>
    </div>

    <!-- Move History Drawer -->
    <div id="history-drawer" class="crown-glass">
        <div class="drawer-header">
            <div class="drawer-title">CHRONICLE OF MOVES</div>
            <button onclick="closeHistoryDrawer()" class="crown-btn-icon" style="width: 30px; height: 30px; min-width: 30px;" aria-label="Close History">
                ✕
            </button>
        </div>
        <div class="drawer-body">
            <table class="move-list-table">
                <tbody id="move-list-tbody">
                    <!-- Dynamic Moves -->
                </tbody>
            </table>
        </div>
    </div>

    <!-- Dedication / Royal Inscription Modal -->
    <div id="dedication-modal" class="modal-backdrop">
        <div class="modal-card crown-glass-gold" style="max-width: 560px;">
            <h2 class="modal-title gold-text">ROYAL INSCRIPTION</h2>
            <p class="modal-subtitle">The Vision of Saksham: The Crown</p>
            <div class="dedication-content">
                <p style="font-size: 15px; color: var(--gold-light); margin-bottom: 4px;"><strong>MADE FOR SAKSHAM PARASHAR</strong></p>
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;"><strong>CREATED BY OM GUPTA</strong></p>
                <p>Every match on this board is an arena of intellect, foresight, and unyielding will. <em>SAKSHAM: THE CROWN</em> was crafted as a bespoke royal chess experience—uniting dark luxury aesthetics, procedural 3D artistry, and uncompromising chess mastery.</p>
                <p>Featuring obsidian jade and brushed champagne gold pieces, an authoritative tournament-grade rules engine, dynamic tactical AI, and full WebGL cinematic realism.</p>
                <p style="text-align: right; color: var(--gold-light); font-family: var(--font-serif); font-weight: 700; margin-top: 14px;">
                    — "EVERY MOVE BUILDS A LEGACY"
                </p>
            </div>
            <button onclick="closeDedicationModal()" class="crown-btn crown-btn-gold">
                Close Inscription
            </button>
        </div>
    </div>
`;
