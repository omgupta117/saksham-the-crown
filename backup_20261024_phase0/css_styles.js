// css_styles.js - Refined Luxury Dark Royal Stylesheet for SAKSHAM: THE CROWN
// Theme: Obsidian Black, Antique Champagne Gold, Warm Ivory, Dark Marble, Dramatic Palace Lighting

module.exports = `
/* =========================================================================
   SAKSHAM: THE CROWN — ROYAL LUXURY STYLESHEET (RESCUE UPGRADE)
   Dedicated to Saksham Parashar | Every Move Builds a Legacy
   ========================================================================= */

*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    -webkit-user-select: none;
}

:root {
    --bg-dark: #050408;
    --bg-charcoal: #0c0b12;
    --gold-primary: #dfb758;
    --gold-light: #fbe6a8;
    --gold-dark: #966f21;
    --gold-glow: rgba(223, 183, 88, 0.35);
    --gold-glow-subtle: rgba(223, 183, 88, 0.16);
    --obsidian-base: #0f0e15;
    --obsidian-surface: #161520;
    --obsidian-elevated: #201e2c;
    --ruby-alert: #e63946;
    --ruby-glow: rgba(230, 57, 70, 0.45);
    --emerald-move: #2ec4b6;
    --text-primary: #f6f3ee;
    --text-secondary: #aba5b3;
    --text-muted: #6e6777;
    --font-serif: 'Cinzel', 'Trajan Pro', 'Baskerville', 'Georgia', serif;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
}

html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: var(--bg-dark);
    color: var(--text-primary);
    font-family: var(--font-sans);
    touch-action: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* Atmospheric Vignette Overlay */
#vignette-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    background: radial-gradient(circle at 50% 45%, rgba(0, 0, 0, 0) 50%, rgba(3, 2, 6, 0.75) 100%);
}

#canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    touch-action: none;
}

#canvas-container canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
}

/* Refined Dark Glassmorphism */
.crown-glass {
    background: rgba(14, 13, 20, 0.86);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border: 1px solid rgba(223, 183, 88, 0.24);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.crown-glass-gold {
    background: linear-gradient(135deg, rgba(223, 183, 88, 0.14) 0%, rgba(14, 13, 20, 0.94) 100%);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border: 1px solid rgba(223, 183, 88, 0.38);
    box-shadow: 0 18px 46px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(223, 183, 88, 0.25);
}

.gold-text {
    background: linear-gradient(135deg, #fff5d2 0%, #dfb758 50%, #966f21 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.font-serif {
    font-family: var(--font-serif);
}

.font-mono {
    font-family: var(--font-mono);
}

/* Luxury Interactive Buttons */
.crown-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 9999px;
    font-family: var(--font-serif);
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
    outline: none;
    border: none;
    position: relative;
    overflow: hidden;
    touch-action: manipulation;
}

.crown-btn-gold {
    background: linear-gradient(135deg, #fbe6a8 0%, #dfb758 50%, #966f21 100%);
    color: #0d0c13;
    box-shadow: 0 4px 20px var(--gold-glow);
}

.crown-btn-gold:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 28px rgba(223, 183, 88, 0.65);
}

.crown-btn-gold:active {
    transform: translateY(1px);
}

.crown-btn-dark {
    background: rgba(24, 22, 33, 0.88);
    color: var(--text-primary);
    border: 1px solid rgba(223, 183, 88, 0.25);
    backdrop-filter: blur(10px);
}

.crown-btn-dark:hover {
    background: rgba(38, 35, 52, 0.95);
    border-color: rgba(223, 183, 88, 0.5);
    transform: translateY(-1px);
}

.crown-btn-dark.active {
    background: rgba(223, 183, 88, 0.22);
    border-color: var(--gold-primary);
    color: var(--gold-light);
    box-shadow: 0 0 16px var(--gold-glow-subtle);
}

.crown-btn-icon {
    width: 38px;
    height: 38px;
    min-width: 38px;
    padding: 0;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(20, 18, 28, 0.85);
    color: var(--text-primary);
    border: 1px solid rgba(223, 183, 88, 0.25);
    cursor: pointer;
    transition: all 0.18s ease;
}

.crown-btn-icon:hover {
    background: rgba(36, 33, 50, 0.95);
    border-color: var(--gold-primary);
    color: var(--gold-light);
    transform: scale(1.06);
}

.crown-btn-icon:active {
    transform: scale(0.94);
}

/* Header Navigation Bar */
#top-bar {
    position: fixed;
    top: calc(10px + var(--safe-top));
    left: 50%;
    transform: translateX(-50%);
    width: 95%;
    max-width: 1240px;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-radius: 9999px;
    pointer-events: auto;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.brand-section {
    display: flex;
    align-items: center;
    gap: 12px;
}

.brand-crest {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(223, 183, 88, 0.12);
    border: 1px solid rgba(223, 183, 88, 0.35);
    flex-shrink: 0;
}

.brand-text-wrap {
    display: flex;
    flex-direction: column;
}

.brand-title {
    font-family: var(--font-serif);
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.14em;
    color: #fff;
    line-height: 1.1;
}

.brand-dedication {
    font-size: 9.5px;
    letter-spacing: 0.09em;
    color: var(--gold-primary);
    font-family: var(--font-serif);
    font-weight: 600;
    text-transform: uppercase;
    margin-top: 1px;
}

/* Turn & Status Center Pill */
.status-section {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(10, 9, 15, 0.9);
    border: 1px solid rgba(223, 183, 88, 0.22);
    padding: 5px 14px;
    border-radius: 9999px;
}

#turn-orb {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #fbe6a8;
    box-shadow: 0 0 10px #fbe6a8;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

#turn-text {
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
}

#status-badge {
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    background: rgba(223, 183, 88, 0.15);
    color: var(--gold-light);
    border: 1px solid rgba(223, 183, 88, 0.3);
    white-space: nowrap;
}

#material-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--gold-primary);
    font-weight: 700;
    padding: 2px 8px;
    background: rgba(223, 183, 88, 0.08);
    border-radius: 9999px;
    border: 1px solid rgba(223, 183, 88, 0.2);
}

.actions-section {
    display: flex;
    align-items: center;
    gap: 6px;
}

/* Floating Combat Toast */
#toast-container {
    position: fixed;
    top: calc(72px + var(--safe-top));
    left: 50%;
    transform: translateX(-50%) translateY(-10px);
    z-index: 45;
    pointer-events: none;
    transition: all 0.28s cubic-bezier(0.2, 0, 0, 1);
    opacity: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    border-radius: 9999px;
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
    background: rgba(16, 14, 22, 0.94);
    border: 1px solid rgba(223, 183, 88, 0.35);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.85);
    color: var(--text-primary);
}

#toast-container.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

/* Bottom Bar / Graveyard HUD */
#bottom-bar {
    position: fixed;
    bottom: calc(12px + var(--safe-bottom));
    left: 50%;
    transform: translateX(-50%);
    width: 95%;
    max-width: 900px;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px;
    border-radius: 20px;
    pointer-events: auto;
}

.graveyard-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    overflow-x: auto;
}

.graveyard-side {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
}

.graveyard-label {
    font-size: 10px;
    font-family: var(--font-serif);
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-right: 2px;
}

.graveyard-pieces {
    display: flex;
    align-items: center;
    gap: 2px;
    min-height: 22px;
}

.dead-piece-icon {
    font-size: 15px;
    line-height: 1;
    opacity: 0.9;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.8));
}

.dead-piece-gold {
    color: #dfb758;
}

.dead-piece-obsidian {
    color: #8c8899;
}

/* Modals & Overlays */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(3, 2, 6, 0.86);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
}

.modal-backdrop.open {
    opacity: 1;
    pointer-events: auto;
}

.modal-card {
    width: 100%;
    max-width: 500px;
    border-radius: 26px;
    padding: 28px 24px;
    text-align: center;
    position: relative;
    transform: scale(0.92);
    transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1);
    box-sizing: border-box;
}

.modal-backdrop.open .modal-card {
    transform: scale(1);
}

.modal-title {
    font-family: var(--font-serif);
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.08em;
    margin-bottom: 6px;
}

.modal-subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 22px;
}

/* Promotion Modal Pieces */
.promotion-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 20px;
}

.promotion-card {
    background: rgba(20, 18, 28, 0.85);
    border: 1px solid rgba(223, 183, 88, 0.3);
    border-radius: 18px;
    padding: 14px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.promotion-card:hover {
    background: rgba(223, 183, 88, 0.2);
    border-color: var(--gold-primary);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px var(--gold-glow);
}

.promotion-card:active {
    transform: translateY(0);
}

.promotion-icon {
    font-size: 38px;
    line-height: 1;
    color: var(--gold-primary);
}

.promotion-name {
    font-family: var(--font-serif);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--text-primary);
}

.promotion-key {
    font-size: 9px;
    font-family: var(--font-mono);
    color: var(--gold-primary);
    opacity: 0.8;
}

/* History Drawer */
#history-drawer {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 340px;
    max-width: 90vw;
    height: 100vh;
    z-index: 55;
    transform: translateX(105%);
    transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1);
    display: flex;
    flex-direction: column;
    box-shadow: -8px 0 36px rgba(0, 0, 0, 0.85);
    pointer-events: auto;
}

#history-drawer.open {
    transform: translateX(0);
}

.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(223, 183, 88, 0.18);
}

.drawer-title {
    font-family: var(--font-serif);
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--gold-light);
}

.drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 14px 18px;
}

.move-list-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-mono);
    font-size: 12.5px;
}

.move-list-table tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.02);
}

.move-list-table td {
    padding: 7px 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.move-num {
    color: var(--text-muted);
    width: 32px;
}

.move-white {
    color: #fbe6a8;
    font-weight: 600;
    width: 45%;
}

.move-black {
    color: #aba5b3;
    font-weight: 600;
    width: 45%;
}

/* Title Screen / Main Menu */
#title-screen {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    overflow-y: auto;
    background: radial-gradient(circle at 50% 28%, rgba(22, 19, 32, 0.9) 0%, rgba(5, 4, 8, 0.98) 75%);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    transition: opacity 0.4s ease, transform 0.4s ease;
}

#title-screen.hidden {
    opacity: 0;
    pointer-events: none;
    transform: scale(1.03);
}

.menu-card {
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin: auto;
}

.crown-logo-box {
    margin-bottom: 14px;
    animation: crownFloat 4s ease-in-out infinite;
}

@keyframes crownFloat {
    0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 12px rgba(223, 183, 88, 0.4)); }
    50% { transform: translateY(-6px); filter: drop-shadow(0 0 22px rgba(223, 183, 88, 0.75)); }
}

.menu-main-title {
    font-family: var(--font-serif);
    font-size: 28px;
    font-weight: 900;
    letter-spacing: 0.18em;
    line-height: 1.1;
    margin-bottom: 4px;
}

.menu-subtitle {
    font-family: var(--font-serif);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.22em;
    color: var(--gold-light);
    text-transform: uppercase;
    margin-bottom: 14px;
}

.menu-dedication-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 14px;
    border-radius: 9999px;
    background: rgba(223, 183, 88, 0.1);
    border: 1px solid rgba(223, 183, 88, 0.3);
    font-family: var(--font-serif);
    font-size: 11px;
    font-weight: 600;
    color: var(--gold-light);
    letter-spacing: 0.05em;
    margin-bottom: 24px;
}

/* Mode Selection Cards */
.mode-selection-group {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 18px;
}

.mode-card {
    background: rgba(18, 16, 26, 0.85);
    border: 1px solid rgba(223, 183, 88, 0.2);
    border-radius: 18px;
    padding: 14px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.mode-card:hover {
    border-color: rgba(223, 183, 88, 0.45);
    background: rgba(28, 25, 40, 0.95);
}

.mode-card.active {
    background: rgba(223, 183, 88, 0.16);
    border-color: var(--gold-primary);
    box-shadow: 0 0 20px var(--gold-glow-subtle);
}

.mode-icon {
    font-size: 26px;
    line-height: 1;
}

.mode-title {
    font-family: var(--font-serif);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: #fff;
}

.mode-desc {
    font-size: 10px;
    color: var(--text-secondary);
    line-height: 1.3;
}

/* Sub-Settings for AI */
#ai-options-panel {
    width: 100%;
    background: rgba(14, 13, 20, 0.7);
    border: 1px solid rgba(223, 183, 88, 0.18);
    border-radius: 18px;
    padding: 14px;
    margin-bottom: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.25s ease;
}

.option-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.option-label {
    font-family: var(--font-serif);
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.pill-group {
    display: flex;
    gap: 6px;
}

.pill-btn {
    padding: 5px 10px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    background: rgba(22, 20, 32, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-secondary);
    transition: all 0.18s ease;
}

.pill-btn.active {
    background: rgba(223, 183, 88, 0.24);
    border-color: var(--gold-primary);
    color: var(--gold-light);
}

/* Secondary Controls Row on Menu */
.menu-options-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-bottom: 22px;
}

/* CTA Launch Button */
.cta-play-btn {
    width: 100%;
    padding: 14px 24px;
    font-size: 15px;
    letter-spacing: 0.12em;
}

/* Dedication Modal Styling */
.dedication-content {
    font-size: 13.5px;
    line-height: 1.7;
    color: #e4dfeb;
    text-align: left;
    background: rgba(10, 9, 15, 0.85);
    border: 1px solid rgba(223, 183, 88, 0.2);
    border-radius: 18px;
    padding: 18px;
    margin-bottom: 20px;
}

.dedication-content p + p {
    margin-top: 12px;
}

/* Check Alert Pulse Animation */
@keyframes checkPulse {
    0%, 100% { box-shadow: 0 0 8px rgba(230, 57, 70, 0.5); }
    50% { box-shadow: 0 0 24px rgba(230, 57, 70, 0.95); }
}

.check-pulse {
    animation: checkPulse 1.2s infinite ease-in-out;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
    #top-bar {
        padding: 6px 12px;
    }
    .brand-dedication {
        display: none;
    }
    .brand-title {
        font-size: 13px;
    }
    .hide-mobile {
        display: none !important;
    }
    .menu-main-title {
        font-size: 23px;
    }
    .menu-card {
        padding: 10px 0;
    }
    .modal-card {
        padding: 24px 16px;
    }
    #bottom-bar {
        padding: 6px 10px;
    }
}

@media (max-width: 480px) {
    #top-bar {
        width: 98%;
        padding: 4px 8px;
    }
    #material-pill {
        display: none;
    }
    .crown-btn-icon {
        width: 34px;
        height: 34px;
        min-width: 34px;
    }
}
`;
