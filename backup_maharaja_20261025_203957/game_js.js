// game_js.js - Complete client-side engine for SAKSHAM: THE CROWN (Emergency Visual Rescue Edition)
// Featuring Procedural Lathe Geometry, Sculpted Knight, Palace Sanctum Architecture, Contact Shadows, and Real-time Lighting

module.exports = `
(function() {
    'use strict';

    /********************************************************************
     * 1. GLOBAL STATE & CONFIGURATION
     ********************************************************************/
    let chess = new Chess();
    let gameMode = 'pass_and_play'; // 'pass_and_play' | 'ai'
    let aiDifficulty = 'novice';    // 'novice' | 'adept' | 'master'
    let playerSide = 'w';          // 'w' | 'b' (human side in AI mode)
    let isFlipped = false;
    let soundEnabled = true;
    let showCoordinates = true;
    let graphicsQuality = 'high';   // 'high' | 'battery'

    // Engine & Interaction concurrency tokens
    let currentRequestId = 0;
    let isAnimating = false;
    let aiThinking = false;

    // Selection & Moves
    let selectedSquare = null;
    let legalMovesForSelected = [];
    let lastMoveSquares = [];
    let pendingPromotionMove = null;
    let hintArcMesh = null;

    // Board Geometry Metrics
    const SQUARE_SIZE = 1.2;
    const BOARD_OFFSET = 3.5 * SQUARE_SIZE; // 4.2
    const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

    // Three.js Core Objects
    let scene, camera, renderer;
    let boardGroup = null;
    let palaceGroup = null;
    let boardSquares = [];
    let pieceMeshes = new Map(); // square -> THREE.Group
    let coordLabels = [];
    let floatingDust = null;
    let checkRingMesh = null;
    let selectedRingMesh = null;
    let destinationMarkerMeshes = [];
    let lastMoveMarkerMeshes = [];

    // Camera Spherical Controller (Cinematic Opening & Gameplay Perspective)
    let isTitleScreenActive = true;
    let camRadius = 21.0;
    let camTargetRadius = 21.0;
    let camTheta = 0.38;
    let camTargetTheta = 0.38;
    let camPhi = 0.65;
    let camTargetPhi = 0.65;
    const camLookAt = new THREE.Vector3(0, 0.15, 0.25);

    // Pointer Tracking
    const activePointers = new Map();
    let pointerDownPos = { x: 0, y: 0 };
    let initialPinchDist = 0;
    let isDraggingCamera = false;
    let raycaster = new THREE.Raycaster();
    let mouseVector = new THREE.Vector2();

    /********************************************************************
     * 2. PROCEDURAL WEB AUDIO SYNTHESIZER
     ********************************************************************/
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.enabled = true;
            try {
                const saved = localStorage.getItem('crown_chess_sound');
                if (saved !== null) this.enabled = (saved === 'true');
            } catch (e) {}
        }

        init() {
            if (!this.ctx) {
                try {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) this.ctx = new AudioCtx();
                } catch (e) {
                    console.warn('Web Audio API not supported.');
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
        }

        playSelect() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(540, now);
            osc.frequency.exponentialRampToValueAtTime(780, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.13);
        }

        playMove(duration = 0.35) {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const bufferSize = Math.max(256, Math.floor(this.ctx.sampleRate * 0.12));
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.35;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(180, now);
            filter.Q.value = 2.5;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.002, now + 0.12);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);

            // Tactile low thud
            const thud = this.ctx.createOscillator();
            const thudGain = this.ctx.createGain();
            thud.type = 'triangle';
            thud.frequency.setValueAtTime(95, now);
            thud.frequency.exponentialRampToValueAtTime(36, now + 0.14);
            thudGain.gain.setValueAtTime(0.22, now);
            thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            thud.connect(thudGain);
            thudGain.connect(this.ctx.destination);
            thud.start(now);
            thud.stop(now + 0.16);
        }

        playCapture() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;

            // Sub impact punch
            const sub = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            sub.type = 'sawtooth';
            sub.frequency.setValueAtTime(130, now);
            sub.frequency.exponentialRampToValueAtTime(28, now + 0.38);
            subGain.gain.setValueAtTime(0.32, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            sub.connect(subGain);
            subGain.connect(this.ctx.destination);
            sub.start(now);
            sub.stop(now + 0.42);

            // Crystalline high fractures
            for (let i = 0; i < 4; i++) {
                const delay = i * 0.03;
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                osc.type = 'sine';
                const f = 480 + i * 260;
                osc.frequency.setValueAtTime(f, now + delay);
                osc.frequency.exponentialRampToValueAtTime(f * 0.4, now + delay + 0.12);
                g.gain.setValueAtTime(0.07, now + delay);
                g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.13);
                osc.connect(g);
                g.connect(this.ctx.destination);
                osc.start(now + delay);
                osc.stop(now + delay + 0.14);
            }
        }

        playCheck() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const freqs = [220, 261.63, 329.63, 440]; // A Minor Royal Tension Chord
            freqs.forEach(f => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.045, now + 0.12);
                gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 1.25);
            });
        }

        playVictory() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C Major Royal Ascending Arpeggio
            notes.forEach((f, i) => {
                const startTime = now + i * 0.14;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, startTime);
                gain.gain.setValueAtTime(0.001, startTime);
                gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.4);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + 1.45);
            });
        }

        playDraw() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            [329.63, 392.00].forEach(f => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.95);
            });
        }

        playClick() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, now);
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.04);
        }

        playSanctumEnter() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const notes = [146.83, 220.00, 293.66, 369.99, 440.00, 587.33]; // D Major Majestic Royal Chord
            notes.forEach((f, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = i === 0 ? 'triangle' : 'sine';
                osc.frequency.setValueAtTime(f, now);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.05 / Math.sqrt(i + 1), now + 0.4);
                gain.gain.exponentialRampToValueAtTime(0.0005, now + 2.4);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 2.5);
            });
        }
    }

    const sound = new SoundEngine();

    /********************************************************************
     * 3. SHARED GEOMETRIES & MATERIALS REPOSITORY
     ********************************************************************/
    const sharedGeometries = new Map();
    function getSharedGeometry(key, factory) {
        if (!sharedGeometries.has(key)) {
            sharedGeometries.set(key, factory());
        }
        return sharedGeometries.get(key);
    }

    // Royal Materials
    let goldPieceMat, goldAccentMat, obsidianPieceMat, obsidianAccentMat;
    let lightSquareMat, darkSquareMat, inlaidGoldMat, pedestalMat, columnMat, floorMat;
    let contactShadowTexture = null;

    function createContactShadowTexture() {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
        grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    function createMarbleTexture(isLight) {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');

        if (isLight) {
            // Warm antique champagne/ivory base gradient
            const bgGrad = ctx.createLinearGradient(0, 0, 256, 256);
            bgGrad.addColorStop(0, '#dbceb9');
            bgGrad.addColorStop(0.5, '#cebfab');
            bgGrad.addColorStop(1, '#c0af98');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, 256, 256);

            // Subtle cloud mottling
            for (let i = 0; i < 16; i++) {
                const rx = ((i * 37) % 256);
                const ry = ((i * 59) % 256);
                const rad = 30 + (i % 5) * 12;
                const cloudGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad);
                cloudGrad.addColorStop(0, 'rgba(255, 250, 240, 0.16)');
                cloudGrad.addColorStop(0.6, 'rgba(215, 195, 170, 0.08)');
                cloudGrad.addColorStop(1, 'rgba(200, 180, 150, 0)');
                ctx.fillStyle = cloudGrad;
                ctx.beginPath();
                ctx.arc(rx, ry, rad, 0, Math.PI * 2);
                ctx.fill();
            }

            // Fine gold/calcite veins
            ctx.strokeStyle = 'rgba(195, 155, 75, 0.20)';
            ctx.lineWidth = 1.8;
            for (let v = 0; v < 3; v++) {
                ctx.beginPath();
                let vx = 30 + v * 85;
                let vy = 20 + v * 70;
                ctx.moveTo(vx, vy);
                ctx.bezierCurveTo(vx + 40, vy + 50, vx - 30, vy + 120, vx + 30, vy + 180);
                ctx.stroke();
            }

            // Fine cream feathering
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.26)';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(10, 180);
            ctx.bezierCurveTo(90, 140, 150, 200, 240, 160);
            ctx.stroke();
        } else {
            // Deep obsidian / Nero Marquina base gradient
            const bgGrad = ctx.createLinearGradient(0, 0, 256, 256);
            bgGrad.addColorStop(0, '#16151f');
            bgGrad.addColorStop(0.5, '#121118');
            bgGrad.addColorStop(1, '#0c0b11');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, 256, 256);

            // Subtle dark mineral clouding
            for (let i = 0; i < 14; i++) {
                const rx = ((i * 43) % 256);
                const ry = ((i * 67) % 256);
                const rad = 25 + (i % 4) * 14;
                const cloudGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad);
                cloudGrad.addColorStop(0, 'rgba(38, 35, 52, 0.28)');
                cloudGrad.addColorStop(1, 'rgba(15, 14, 20, 0)');
                ctx.fillStyle = cloudGrad;
                ctx.beginPath();
                ctx.arc(rx, ry, rad, 0, Math.PI * 2);
                ctx.fill();
            }

            // Delicate gold micro-fractures
            ctx.strokeStyle = 'rgba(215, 175, 80, 0.20)';
            ctx.lineWidth = 1.2;
            for (let v = 0; v < 3; v++) {
                ctx.beginPath();
                let vx = 40 + v * 75;
                let vy = 220 - v * 70;
                ctx.moveTo(vx, vy);
                ctx.bezierCurveTo(vx + 50, vy - 50, vx - 25, vy - 110, vx + 20, vy - 170);
                ctx.stroke();
            }

            // Faint charcoal crackle
            ctx.strokeStyle = 'rgba(55, 50, 72, 0.35)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(20, 40);
            ctx.bezierCurveTo(100, 90, 160, 50, 230, 110);
            ctx.stroke();
        }

        // Elegant beveled edge shadow along square borders
        ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.14)' : 'rgba(0, 0, 0, 0.45)';
        ctx.lineWidth = 3;
        ctx.strokeRect(1, 1, 254, 254);

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    function createPalaceFloorTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');

        // Dark charcoal Nero Marquina stone slab
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, '#0c0a12');
        grad.addColorStop(0.5, '#07060a');
        grad.addColorStop(1, '#050408');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Large subtle marble cloud mottling
        for (let i = 0; i < 20; i++) {
            const rx = ((i * 71) % 512);
            const ry = ((i * 113) % 512);
            const rad = 60 + (i % 6) * 25;
            const cloudGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad);
            cloudGrad.addColorStop(0, 'rgba(32, 28, 42, 0.35)');
            cloudGrad.addColorStop(0.7, 'rgba(16, 14, 20, 0.12)');
            cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = cloudGrad;
            ctx.beginPath();
            ctx.arc(rx, ry, rad, 0, Math.PI * 2);
            ctx.fill();
        }

        // Faint golden calcite fracture lines running across slabs
        ctx.strokeStyle = 'rgba(215, 175, 80, 0.18)';
        ctx.lineWidth = 1.4;
        for (let v = 0; v < 4; v++) {
            ctx.beginPath();
            let vx = 50 + v * 120;
            let vy = 480 - v * 110;
            ctx.moveTo(vx, vy);
            ctx.bezierCurveTo(vx + 90, vy - 100, vx - 50, vy - 220, vx + 60, vy - 350);
            ctx.stroke();
        }

        // Polished stone tile joint seams (2x2 grid within 512x512)
        ctx.strokeStyle = 'rgba(2, 2, 4, 0.95)';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, 506, 506);
        ctx.beginPath();
        ctx.moveTo(256, 0); ctx.lineTo(256, 512);
        ctx.moveTo(0, 256); ctx.lineTo(512, 256);
        ctx.stroke();

        // Delicate bevel highlight along tile joint edges
        ctx.strokeStyle = 'rgba(215, 180, 95, 0.08)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(8, 8, 496, 496);

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(8, 8);
        return tex;
    }

    function initMaterials() {
        contactShadowTexture = createContactShadowTexture();

        const lightMarbleTex = createMarbleTexture(true);
        const darkMarbleTex = createMarbleTexture(false);
        const floorTex = createPalaceFloorTexture();

        // Warm Sculpted Ivory Alabaster (Smooth satin finish, royal calcite tone)
        goldPieceMat = new THREE.MeshStandardMaterial({
            color: 0xf6efe4,
            roughness: 0.24,
            metalness: 0.06,
            envMapIntensity: 1.15
        });

        // Antique Champagne Gold Accent
        goldAccentMat = new THREE.MeshStandardMaterial({
            color: 0xdfb758,
            roughness: 0.18,
            metalness: 0.90,
            envMapIntensity: 1.3
        });

        // Polished Obsidian Stone (Deep black stone with clear specular highlight)
        obsidianPieceMat = new THREE.MeshStandardMaterial({
            color: 0x111016,
            roughness: 0.18,
            metalness: 0.28,
            envMapIntensity: 1.2
        });

        // Antique Champagne Gold for Obsidian Side Trims & Crowns
        obsidianAccentMat = new THREE.MeshStandardMaterial({
            color: 0xdfb758,
            roughness: 0.18,
            metalness: 0.90,
            envMapIntensity: 1.3
        });

        lightSquareMat = new THREE.MeshStandardMaterial({
            map: lightMarbleTex,
            roughness: 0.30,
            metalness: 0.08
        });

        darkSquareMat = new THREE.MeshStandardMaterial({
            map: darkMarbleTex,
            roughness: 0.22,
            metalness: 0.20
        });

        inlaidGoldMat = new THREE.MeshStandardMaterial({
            color: 0xc8a248,
            roughness: 0.20,
            metalness: 0.88
        });

        pedestalMat = new THREE.MeshStandardMaterial({
            color: 0x0c0a12,
            roughness: 0.48,
            metalness: 0.18
        });

        columnMat = new THREE.MeshStandardMaterial({
            color: 0x0c0a14,
            roughness: 0.58,
            metalness: 0.18
        });

        floorMat = new THREE.MeshStandardMaterial({
            map: floorTex,
            roughness: 0.30,
            metalness: 0.22
        });
    }

    /********************************************************************
     * 4. PROCEDURAL MASTER-CRAFTED CHESS PIECES (LATHE & SCULPTING)
     ********************************************************************/
    function createPieceMesh(type, color) {
        const group = new THREE.Group();
        const mainMat = color === 'w' ? goldPieceMat : obsidianPieceMat;
        const accentMat = color === 'w' ? goldAccentMat : obsidianAccentMat;

        // Soft Radial Contact Shadow Disk
        const shadowGeo = getSharedGeometry('contactShadowGeo', () => new THREE.PlaneGeometry(0.96, 0.96));
        const shadowMat = getSharedGeometry('contactShadowMat', () => new THREE.MeshBasicMaterial({
            map: contactShadowTexture,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        }));
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.y = 0.075;
        group.add(shadowMesh);

        // Universal Champagne Gold Base Ring on every royal piece
        const baseRingRad = (type === 'p') ? 0.42 : ((type === 'k' || type === 'q') ? 0.46 : 0.44);
        const baseRingGeo = getSharedGeometry('pieceBaseRingGeo_' + type, () => new THREE.TorusGeometry(baseRingRad, 0.022, 8, 24));
        const baseRing = new THREE.Mesh(baseRingGeo, accentMat);
        baseRing.rotation.x = Math.PI / 2;
        baseRing.position.y = 0.082;
        group.add(baseRing);

        if (type === 'p') {
            // Classical Staunton Royal Pawn (LatheGeometry)
            const pawnGeo = getSharedGeometry('pawnLatheGeo', () => {
                const pts = [];
                pts.push(new THREE.Vector2(0, 0));
                pts.push(new THREE.Vector2(0.44, 0));
                pts.push(new THREE.Vector2(0.44, 0.06));
                pts.push(new THREE.Vector2(0.40, 0.10));
                pts.push(new THREE.Vector2(0.35, 0.14));
                pts.push(new THREE.Vector2(0.27, 0.20));
                pts.push(new THREE.Vector2(0.19, 0.32));
                pts.push(new THREE.Vector2(0.16, 0.46));
                pts.push(new THREE.Vector2(0.22, 0.50));
                pts.push(new THREE.Vector2(0.22, 0.54));
                pts.push(new THREE.Vector2(0.16, 0.57));
                // Head sphere arc
                for (let a = -Math.PI / 2; a <= Math.PI / 2; a += Math.PI / 10) {
                    const r = 0.20;
                    pts.push(new THREE.Vector2(Math.cos(a) * r, 0.77 + Math.sin(a) * r));
                }
                pts.push(new THREE.Vector2(0.06, 0.98));
                pts.push(new THREE.Vector2(0, 1.02));
                return new THREE.LatheGeometry(pts, 24);
            });

            const body = new THREE.Mesh(pawnGeo, mainMat);
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);

            // Gold Collar Ring beneath head
            const collarGeo = getSharedGeometry('pawnCollarGeo', () => new THREE.TorusGeometry(0.18, 0.020, 8, 20));
            const collar = new THREE.Mesh(collarGeo, accentMat);
            collar.rotation.x = Math.PI / 2;
            collar.position.y = 0.52;
            group.add(collar);

            // Gold Finial Bead
            const beadGeo = getSharedGeometry('pawnBeadGeo', () => new THREE.SphereGeometry(0.06, 12, 10));
            const bead = new THREE.Mesh(beadGeo, accentMat);
            bead.position.y = 1.02;
            group.add(bead);

        } else if (type === 'r') {
            // Fortress Battlement Rook (Lathe + 4 Crenellations)
            const rookBodyGeo = getSharedGeometry('rookBodyLatheGeo', () => {
                const pts = [];
                pts.push(new THREE.Vector2(0, 0));
                pts.push(new THREE.Vector2(0.46, 0));
                pts.push(new THREE.Vector2(0.46, 0.08));
                pts.push(new THREE.Vector2(0.41, 0.12));
                pts.push(new THREE.Vector2(0.37, 0.16));
                pts.push(new THREE.Vector2(0.34, 0.30));
                pts.push(new THREE.Vector2(0.31, 0.55));
                pts.push(new THREE.Vector2(0.29, 0.72));
                pts.push(new THREE.Vector2(0.33, 0.78));
                pts.push(new THREE.Vector2(0.37, 0.84));
                pts.push(new THREE.Vector2(0.39, 0.90));
                pts.push(new THREE.Vector2(0.40, 1.10));
                pts.push(new THREE.Vector2(0.28, 1.10));
                pts.push(new THREE.Vector2(0.28, 0.96));
                pts.push(new THREE.Vector2(0, 0.96));
                return new THREE.LatheGeometry(pts, 24);
            });

            const body = new THREE.Mesh(rookBodyGeo, mainMat);
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);

            // Gold Collar Ring beneath turret
            const rookCollarGeo = getSharedGeometry('rookCollarGeo', () => new THREE.TorusGeometry(0.35, 0.022, 8, 24));
            const rookCollar = new THREE.Mesh(rookCollarGeo, accentMat);
            rookCollar.rotation.x = Math.PI / 2;
            rookCollar.position.y = 0.86;
            group.add(rookCollar);

            // 4 Crenellated Battlements
            const crenelGeo = getSharedGeometry('rookCrenelGeo', () => new THREE.BoxGeometry(0.16, 0.16, 0.13));
            const c1 = new THREE.Mesh(crenelGeo, mainMat); c1.position.set(0, 1.16, 0.33); c1.castShadow = true; group.add(c1);
            const c2 = new THREE.Mesh(crenelGeo, mainMat); c2.position.set(0, 1.16, -0.33); c2.castShadow = true; group.add(c2);
            const c3 = new THREE.Mesh(crenelGeo, mainMat); c3.position.set(0.33, 1.16, 0); c3.castShadow = true; group.add(c3);
            const c4 = new THREE.Mesh(crenelGeo, mainMat); c4.position.set(-0.33, 1.16, 0); c4.castShadow = true; group.add(c4);

            // Central Jewel inside turret
            const jewelGeo = getSharedGeometry('rookJewelGeo', () => new THREE.OctahedronGeometry(0.12, 0));
            const jewel = new THREE.Mesh(jewelGeo, accentMat);
            jewel.position.y = 1.04;
            group.add(jewel);

            // 4 Castle Wall Arrow-Slit Embrasures
            const slitGeo = getSharedGeometry('rookSlitGeo', () => new THREE.BoxGeometry(0.04, 0.20, 0.08));
            const s1 = new THREE.Mesh(slitGeo, accentMat); s1.position.set(0, 0.58, 0.32); group.add(s1);
            const s2 = new THREE.Mesh(slitGeo, accentMat); s2.position.set(0, 0.58, -0.32); group.add(s2);
            const s3 = new THREE.Mesh(slitGeo, accentMat); s3.position.set(0.32, 0.58, 0); s3.rotation.y = Math.PI / 2; group.add(s3);
            const s4 = new THREE.Mesh(slitGeo, accentMat); s4.position.set(-0.32, 0.58, 0); s4.rotation.y = Math.PI / 2; group.add(s4);

        } else if (type === 'n') {
            // Sculpted Royal Knight (Horse Head Bust)
            const basePts = [
                new THREE.Vector2(0, 0),
                new THREE.Vector2(0.44, 0),
                new THREE.Vector2(0.44, 0.08),
                new THREE.Vector2(0.40, 0.13),
                new THREE.Vector2(0.35, 0.17),
                new THREE.Vector2(0.32, 0.22),
                new THREE.Vector2(0, 0.22)
            ];
            const baseMesh = new THREE.Mesh(new THREE.LatheGeometry(basePts, 24), mainMat);
            baseMesh.castShadow = true;
            baseMesh.receiveShadow = true;
            group.add(baseMesh);

            // Gold accent ring on base
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.024, 8, 24), accentMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 0.13;
            group.add(ring);

            // Bust Group (Taller, proud Staunton steed)
            const bust = new THREE.Group();
            bust.position.y = 0.22;

            // Muscular Chest
            const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.36, 16), mainMat);
            chest.position.set(0, 0.18, 0.02);
            chest.castShadow = true;
            bust.add(chest);

            // Stately Arched Neck
            const neck = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.68, 0.36), mainMat);
            neck.position.set(0, 0.52, -0.02);
            neck.rotation.x = -0.20;
            neck.castShadow = true;
            bust.add(neck);

            // Layered Mane Crest along back of neck
            const mane = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.18), accentMat);
            mane.position.set(0, 0.56, -0.22);
            mane.rotation.x = -0.18;
            bust.add(mane);

            // Cranium Brow
            const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 14), mainMat);
            cranium.position.set(0, 0.85, 0.06);
            cranium.scale.set(0.92, 1.1, 1.25);
            cranium.castShadow = true;
            bust.add(cranium);

            // Sculpted Snout / Muzzle
            const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.44, 12), mainMat);
            snout.position.set(0, 0.72, 0.34);
            snout.rotation.x = Math.PI / 2.5;
            snout.castShadow = true;
            bust.add(snout);

            // Flared Cheeks / Jaw
            const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), mainMat);
            cheekL.position.set(0.13, 0.68, 0.16);
            bust.add(cheekL);

            const cheekR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), mainMat);
            cheekR.position.set(-0.13, 0.68, 0.16);
            bust.add(cheekR);

            // Chin curve
            const chin = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), mainMat);
            chin.position.set(0, 0.56, 0.48);
            bust.add(chin);

            // Pointed Upright Ears
            const earGeo = getSharedGeometry('knightEarGeo', () => new THREE.ConeGeometry(0.065, 0.24, 6));
            const earL = new THREE.Mesh(earGeo, mainMat);
            earL.position.set(0.09, 1.05, -0.02);
            earL.rotation.set(-0.12, 0, -0.22);
            bust.add(earL);

            const earR = new THREE.Mesh(earGeo, mainMat);
            earR.position.set(-0.09, 1.05, -0.02);
            earR.rotation.set(-0.12, 0, 0.22);
            bust.add(earR);

            // Inset Eyes
            const eyeGeo = getSharedGeometry('knightEyeGeo', () => new THREE.SphereGeometry(0.04, 8, 8));
            const eyeL = new THREE.Mesh(eyeGeo, accentMat);
            eyeL.position.set(0.16, 0.86, 0.18);
            bust.add(eyeL);

            const eyeR = new THREE.Mesh(eyeGeo, accentMat);
            eyeR.position.set(-0.16, 0.86, 0.18);
            bust.add(eyeR);

            // Iconic Three-Quarter Profile Angle so the horse head is clearly recognizable from player camera
            bust.rotation.y = color === 'w' ? Math.PI * 0.76 : Math.PI * 0.24;
            group.add(bust);

        } else if (type === 'b') {
            // Inquisitor Mitre Bishop (Lathe + Diagonal Cleft + Finial)
            const bishopGeo = getSharedGeometry('bishopLatheGeo', () => {
                const pts = [];
                pts.push(new THREE.Vector2(0, 0));
                pts.push(new THREE.Vector2(0.45, 0));
                pts.push(new THREE.Vector2(0.45, 0.08));
                pts.push(new THREE.Vector2(0.41, 0.12));
                pts.push(new THREE.Vector2(0.36, 0.16));
                pts.push(new THREE.Vector2(0.28, 0.26));
                pts.push(new THREE.Vector2(0.21, 0.44));
                pts.push(new THREE.Vector2(0.18, 0.68));
                pts.push(new THREE.Vector2(0.23, 0.73));
                pts.push(new THREE.Vector2(0.23, 0.77));
                pts.push(new THREE.Vector2(0.18, 0.80));
                pts.push(new THREE.Vector2(0.24, 0.84));
                pts.push(new THREE.Vector2(0.18, 0.88));
                // Teardrop mitre head
                pts.push(new THREE.Vector2(0.23, 0.96));
                pts.push(new THREE.Vector2(0.26, 1.10));
                pts.push(new THREE.Vector2(0.24, 1.22));
                pts.push(new THREE.Vector2(0.16, 1.36));
                pts.push(new THREE.Vector2(0.08, 1.44));
                pts.push(new THREE.Vector2(0, 1.48));
                return new THREE.LatheGeometry(pts, 24);
            });

            const body = new THREE.Mesh(bishopGeo, mainMat);
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);

            // Diagonal Cut Cleft Inlay
            const cleftGeo = getSharedGeometry('bishopCleftGeo', () => new THREE.BoxGeometry(0.06, 0.36, 0.26));
            const cleft = new THREE.Mesh(cleftGeo, accentMat);
            cleft.position.set(0, 1.20, 0.02);
            cleft.rotation.z = 0.35;
            group.add(cleft);

            // Inlaid Gold Collar Ring
            const collarGeo = getSharedGeometry('bishopCollarGeo', () => new THREE.TorusGeometry(0.24, 0.022, 8, 24));
            const collar = new THREE.Mesh(collarGeo, accentMat);
            collar.rotation.x = Math.PI / 2;
            collar.position.y = 0.82;
            group.add(collar);

            // Polished Spherical Finial Bead
            const finialGeo = getSharedGeometry('bishopFinialGeo', () => new THREE.SphereGeometry(0.08, 12, 10));
            const finial = new THREE.Mesh(finialGeo, accentMat);
            finial.position.y = 1.50;
            group.add(finial);

        } else if (type === 'q') {
            // Sovereign Queen (Lathe + Coronet + 8 Pearls + Orb)
            const queenGeo = getSharedGeometry('queenLatheGeo', () => {
                const pts = [];
                pts.push(new THREE.Vector2(0, 0));
                pts.push(new THREE.Vector2(0.46, 0));
                pts.push(new THREE.Vector2(0.46, 0.08));
                pts.push(new THREE.Vector2(0.42, 0.12));
                pts.push(new THREE.Vector2(0.38, 0.16));
                pts.push(new THREE.Vector2(0.33, 0.25));
                pts.push(new THREE.Vector2(0.25, 0.50));
                pts.push(new THREE.Vector2(0.20, 0.80));
                pts.push(new THREE.Vector2(0.26, 0.86));
                pts.push(new THREE.Vector2(0.26, 0.90));
                pts.push(new THREE.Vector2(0.21, 0.94));
                pts.push(new THREE.Vector2(0.28, 0.98));
                pts.push(new THREE.Vector2(0.22, 1.02));
                // Coronet bowl flaring outward
                pts.push(new THREE.Vector2(0.26, 1.06));
                pts.push(new THREE.Vector2(0.35, 1.25));
                pts.push(new THREE.Vector2(0.28, 1.25));
                pts.push(new THREE.Vector2(0, 1.15));
                return new THREE.LatheGeometry(pts, 24);
            });

            const body = new THREE.Mesh(queenGeo, mainMat);
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);

            // 8 Coronet Pearls
            const pearlGeo = getSharedGeometry('queenPearlGeo', () => new THREE.SphereGeometry(0.048, 8, 8));
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const pearl = new THREE.Mesh(pearlGeo, accentMat);
                pearl.position.set(Math.cos(angle) * 0.33, 1.28, Math.sin(angle) * 0.33);
                group.add(pearl);
            }

            // Central Sovereign Orb
            const orbGeo = getSharedGeometry('queenOrbGeo', () => new THREE.SphereGeometry(0.14, 16, 14));
            const orb = new THREE.Mesh(orbGeo, accentMat);
            orb.position.y = 1.34;
            group.add(orb);

            // Top Finial Jewel Pearl
            const queenTopJewelGeo = getSharedGeometry('queenTopJewelGeo', () => new THREE.SphereGeometry(0.055, 10, 10));
            const queenTopJewel = new THREE.Mesh(queenTopJewelGeo, accentMat);
            queenTopJewel.position.y = 1.48;
            group.add(queenTopJewel);

        } else if (type === 'k') {
            // Imperial Monarch King (Lathe + Coronet + Dome + Imperial Cross)
            const kingGeo = getSharedGeometry('kingLatheGeo', () => {
                const pts = [];
                pts.push(new THREE.Vector2(0, 0));
                pts.push(new THREE.Vector2(0.48, 0));
                pts.push(new THREE.Vector2(0.48, 0.09));
                pts.push(new THREE.Vector2(0.44, 0.14));
                pts.push(new THREE.Vector2(0.40, 0.18));
                pts.push(new THREE.Vector2(0.36, 0.28));
                pts.push(new THREE.Vector2(0.29, 0.55));
                pts.push(new THREE.Vector2(0.24, 0.90));
                pts.push(new THREE.Vector2(0.30, 0.96));
                pts.push(new THREE.Vector2(0.30, 1.00));
                pts.push(new THREE.Vector2(0.24, 1.04));
                pts.push(new THREE.Vector2(0.32, 1.08));
                pts.push(new THREE.Vector2(0.25, 1.12));
                // Coronet bowl
                pts.push(new THREE.Vector2(0.29, 1.16));
                pts.push(new THREE.Vector2(0.35, 1.32));
                pts.push(new THREE.Vector2(0.28, 1.32));
                pts.push(new THREE.Vector2(0, 1.24));
                return new THREE.LatheGeometry(pts, 24);
            });

            const body = new THREE.Mesh(kingGeo, mainMat);
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);

            // Velvet/Gold Crown Dome
            const domeGeo = getSharedGeometry('kingDomeGeo', () => new THREE.SphereGeometry(0.26, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65));
            const dome = new THREE.Mesh(domeGeo, mainMat);
            dome.position.y = 1.26;
            group.add(dome);

            // 4 Crown Ruby Cabochons in the rim
            const rubyMat = getSharedGeometry('rubyMat', () => new THREE.MeshStandardMaterial({
                color: 0x9e1220,
                roughness: 0.12,
                metalness: 0.35,
                emissive: 0x440008,
                emissiveIntensity: 0.5
            }));
            const rubyGeo = getSharedGeometry('rubyGeo', () => new THREE.SphereGeometry(0.045, 8, 8));
            const rubyCoords = [
                [0.32, 0], [-0.32, 0], [0, 0.32], [0, -0.32]
            ];
            rubyCoords.forEach(([rx, rz]) => {
                const ruby = new THREE.Mesh(rubyGeo, rubyMat);
                ruby.position.set(rx, 1.24, rz);
                group.add(ruby);
            });

            // 3D Imperial Cross Finial
            const crossVGeo = getSharedGeometry('crossVGeo', () => new THREE.BoxGeometry(0.08, 0.36, 0.08));
            const crossV = new THREE.Mesh(crossVGeo, accentMat);
            crossV.position.y = 1.62;
            group.add(crossV);

            const crossHGeo = getSharedGeometry('crossHGeo', () => new THREE.BoxGeometry(0.26, 0.08, 0.08));
            const crossH = new THREE.Mesh(crossHGeo, accentMat);
            crossH.position.y = 1.66;
            group.add(crossH);

            // Center Ruby Gem at Imperial Cross intersection
            const crossGem = new THREE.Mesh(rubyGeo, rubyMat);
            crossGem.position.set(0, 1.66, 0.05);
            group.add(crossGem);
            const crossGemBack = new THREE.Mesh(rubyGeo, rubyMat);
            crossGemBack.position.set(0, 1.66, -0.05);
            group.add(crossGemBack);
        }

        group.userData = {
            type,
            color,
            square: null,
            baseY: 0.0
        };

        return group;
    }

    /********************************************************************
     * 5. COORDINATE & BOARD MATHEMATICS
     ********************************************************************/
    function squareToWorld(square) {
        const fileChar = square[0];
        const rankChar = square[1];
        const fileIdx = FILES.indexOf(fileChar);
        const rankIdx = parseInt(rankChar, 10) - 1;

        const x = (fileIdx - 3.5) * SQUARE_SIZE;
        const z = (3.5 - rankIdx) * SQUARE_SIZE;

        return { x, z };
    }

    function worldToSquare(worldX, worldZ) {
        const fileIdx = Math.round(worldX / SQUARE_SIZE + 3.5);
        const rankIdx = Math.round(3.5 - worldZ / SQUARE_SIZE);

        if (fileIdx >= 0 && fileIdx < 8 && rankIdx >= 0 && rankIdx < 8) {
            return FILES[fileIdx] + (rankIdx + 1);
        }
        return null;
    }

    /********************************************************************
     * 6. BOARD, PEDESTAL, SANCTUM ARCHITECTURE & DUST SCENE BUILDER
     ********************************************************************/
    function buildPedestalAndBoard() {
        if (boardGroup) scene.remove(boardGroup);
        boardGroup = new THREE.Group();
        boardSquares = [];
        coordLabels = [];

        // Stepped Architectural Royal Dias (Base tier widest at bottom)
        const tier1 = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.55, 12.2), pedestalMat);
        tier1.position.y = -0.75;
        tier1.receiveShadow = true;
        boardGroup.add(tier1);

        const tier2 = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.50, 11.2), pedestalMat);
        tier2.position.y = -0.32;
        tier2.receiveShadow = true;
        boardGroup.add(tier2);

        // Gold Inlaid Frame Trim
        const frame = new THREE.Mesh(new THREE.BoxGeometry(10.35, 0.18, 10.35), inlaidGoldMat);
        frame.position.y = -0.09;
        frame.receiveShadow = true;
        boardGroup.add(frame);

        // Inlaid Champagne Gold Inner Border Framing the 64 Squares
        const innerBorder = new THREE.Mesh(
            getSharedGeometry('innerBorderGeo', () => new THREE.BoxGeometry(9.65, 0.04, 9.65)),
            inlaidGoldMat
        );
        innerBorder.position.y = -0.01;
        innerBorder.receiveShadow = true;
        boardGroup.add(innerBorder);

        // 4 Ornate Gold Corner Brackets with Pyramid Studs
        const cornerBracketGeo = getSharedGeometry('cornerBracketGeo', () => new THREE.BoxGeometry(0.75, 0.22, 0.75));
        const cornerStudGeo = getSharedGeometry('cornerStudGeo', () => new THREE.ConeGeometry(0.18, 0.22, 4));
        const cornerCoords = [
            [5.22, 5.22], [-5.22, 5.22], [5.22, -5.22], [-5.22, -5.22]
        ];
        cornerCoords.forEach(([cx, cz]) => {
            const bracket = new THREE.Mesh(cornerBracketGeo, inlaidGoldMat);
            bracket.position.set(cx, -0.05, cz);
            bracket.receiveShadow = true;
            boardGroup.add(bracket);

            const stud = new THREE.Mesh(cornerStudGeo, goldAccentMat);
            stud.position.set(cx, 0.12, cz);
            stud.rotation.y = Math.PI / 4;
            boardGroup.add(stud);
        });

        // Royal Inscription Dedication Plaque Generator
        function createDedicationPlaqueTexture() {
            const c = document.createElement('canvas');
            c.width = 1024;
            c.height = 256;
            const ctx = c.getContext('2d');

            // Dark royal obsidian stone plate
            const grad = ctx.createLinearGradient(0, 0, 1024, 256);
            grad.addColorStop(0, '#100f18');
            grad.addColorStop(0.5, '#191824');
            grad.addColorStop(1, '#0f0e16');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1024, 256);

            // Double Gold Trim Border
            ctx.strokeStyle = '#c8a248';
            ctx.lineWidth = 6;
            ctx.strokeRect(12, 12, 1000, 232);

            ctx.strokeStyle = 'rgba(255, 240, 190, 0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(22, 22, 980, 212);

            // Corner Diamond Accents
            [[22, 22], [1002, 22], [22, 234], [1002, 234]].forEach(([cx, cy]) => {
                ctx.fillStyle = '#dfb758';
                ctx.beginPath();
                ctx.arc(cx, cy, 6, 0, Math.PI * 2);
                ctx.fill();
            });

            // Title: SAKSHAM: THE CROWN
            ctx.font = 'bold 52px Cinzel, serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#dfb758';
            ctx.shadowColor = 'rgba(0,0,0,0.85)';
            ctx.shadowBlur = 12;
            ctx.fillText('SAKSHAM : THE CROWN', 512, 85);

            // Tagline: EVERY MOVE BUILDS A LEGACY
            ctx.font = 'italic 25px Cinzel, serif';
            ctx.fillStyle = '#c5a044';
            ctx.shadowBlur = 6;
            ctx.fillText('\u2014  EVERY MOVE BUILDS A LEGACY  \u2014', 512, 138);

            // Dedication: MADE FOR SAKSHAM PARASHAR * CREATED BY OM GUPTA
            ctx.font = '600 23px Cinzel, serif';
            ctx.fillStyle = '#fff0bf';
            ctx.shadowBlur = 8;
            ctx.fillText('MADE FOR SAKSHAM PARASHAR   \u2022   CREATED BY OM GUPTA', 512, 198);

            return new THREE.CanvasTexture(c);
        }

        const plaqueTex = createDedicationPlaqueTexture();
        const plaqueMat = new THREE.MeshStandardMaterial({
            map: plaqueTex,
            roughness: 0.28,
            metalness: 0.4
        });

        // Plaque on South face (facing player playing White)
        const plaqueGeo = new THREE.PlaneGeometry(6.4, 1.6);
        const plaqueSouth = new THREE.Mesh(plaqueGeo, plaqueMat);
        plaqueSouth.position.set(0, -0.32, 5.61);
        boardGroup.add(plaqueSouth);

        // Plaque on North face (facing player playing Black / flipped view)
        const plaqueNorth = new THREE.Mesh(plaqueGeo, plaqueMat);
        plaqueNorth.position.set(0, -0.32, -5.61);
        plaqueNorth.rotation.y = Math.PI;
        boardGroup.add(plaqueNorth);

        // Coordinate Label Tile Generator
        function createCoordTile(char) {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fillRect(0, 0, 64, 64);
            ctx.font = 'bold 36px Cinzel, serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#dfb758';
            ctx.fillText(char, 32, 34);

            const tex = new THREE.CanvasTexture(canvas);
            const plane = new THREE.Mesh(
                new THREE.PlaneGeometry(0.38, 0.38),
                new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
            );
            plane.rotation.x = -Math.PI / 2;
            return plane;
        }

        const filesUpper = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const ranksUpper = ['1', '2', '3', '4', '5', '6', '7', '8'];

        for (let i = 0; i < 8; i++) {
            const xPos = (i - 3.5) * SQUARE_SIZE;
            const zPos = (3.5 - i) * SQUARE_SIZE;

            // South & North File Labels
            const lblS = createCoordTile(filesUpper[i]);
            lblS.position.set(xPos, 0.02, 5.06);
            boardGroup.add(lblS);
            coordLabels.push(lblS);

            const lblN = createCoordTile(filesUpper[i]);
            lblN.position.set(xPos, 0.02, -5.06);
            lblN.rotation.z = Math.PI;
            boardGroup.add(lblN);
            coordLabels.push(lblN);

            // West & East Rank Labels
            const lblW = createCoordTile(ranksUpper[i]);
            lblW.position.set(-5.06, 0.02, zPos);
            boardGroup.add(lblW);
            coordLabels.push(lblW);

            const lblE = createCoordTile(ranksUpper[i]);
            lblE.position.set(5.06, 0.02, zPos);
            boardGroup.add(lblE);
            coordLabels.push(lblE);
        }

        // 64 Alternating Board Squares
        const sqGeo = getSharedGeometry('sqGeo', () => new THREE.BoxGeometry(SQUARE_SIZE * 0.985, 0.14, SQUARE_SIZE * 0.985));

        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                const isLight = (r + f) % 2 !== 0; // standard chess parity
                const sqMesh = new THREE.Mesh(sqGeo, isLight ? lightSquareMat.clone() : darkSquareMat.clone());
                const square = FILES[f] + (r + 1);
                const pos = squareToWorld(square);

                sqMesh.position.set(pos.x, 0, pos.z);
                sqMesh.receiveShadow = true;
                sqMesh.userData = { square, isLight };

                boardGroup.add(sqMesh);
                boardSquares.push(sqMesh);
            }
        }

        scene.add(boardGroup);
    }

    function buildPalaceSanctum() {
        if (palaceGroup) scene.remove(palaceGroup);
        palaceGroup = new THREE.Group();

        // 1. Classical Architectural Column Geometries
        const plinthBaseGeo = getSharedGeometry('colPlinthBaseGeo', () => new THREE.BoxGeometry(2.2, 0.45, 2.2));
        const plinthUpperGeo = getSharedGeometry('colPlinthUpperGeo', () => new THREE.BoxGeometry(1.7, 0.40, 1.7));
        const colBaseTorusGeo = getSharedGeometry('colBaseTorusGeo', () => new THREE.TorusGeometry(0.72, 0.08, 10, 24));
        const shaftGeo = getSharedGeometry('colShaftGeo', () => new THREE.CylinderGeometry(0.58, 0.68, 13.5, 24));
        const colCapitalCollarGeo = getSharedGeometry('colCapitalCollarGeo', () => new THREE.TorusGeometry(0.66, 0.06, 8, 24));
        const capitalBellGeo = getSharedGeometry('colCapitalBellGeo', () => new THREE.CylinderGeometry(0.96, 0.58, 0.85, 20));
        const capitalAbacusGeo = getSharedGeometry('colCapitalAbacusGeo', () => new THREE.BoxGeometry(1.9, 0.35, 1.9));

        // Shared Sconce Geometries
        const sconceArmGeo = getSharedGeometry('sconceArmGeo', () => new THREE.BoxGeometry(0.12, 0.12, 0.6));
        const sconceCupGeo = getSharedGeometry('sconceCupGeo', () => new THREE.CylinderGeometry(0.22, 0.12, 0.22, 12));
        const flameGeo = getSharedGeometry('flameGeo', () => new THREE.ConeGeometry(0.09, 0.26, 8));
        const flameMat = getSharedGeometry('flameMat', () => new THREE.MeshBasicMaterial({
            color: 0xffb844
        }));

        // Grand Colonnade Positions
        // 5 Columns along the background arcade (framing behind royal dias):
        const backColPositions = [
            [-9.5, -9.6], [-4.8, -10.0], [0.0, -10.2], [4.8, -10.0], [9.5, -9.6]
        ];
        // 6 Flanking Side Columns:
        const sideColPositions = [
            [-11.5, -5.0], [-11.5, 0.0], [-11.5, 5.0],
            [11.5, -5.0], [11.5, 0.0], [11.5, 5.0]
        ];

        const allColumns = [...backColPositions, ...sideColPositions];

        allColumns.forEach(([cx, cz], idx) => {
            const col = new THREE.Group();
            col.position.set(cx, 0, cz);

            // Lower Plinth Tier
            const p1 = new THREE.Mesh(plinthBaseGeo, columnMat);
            p1.position.y = -1.02;
            p1.receiveShadow = true;
            col.add(p1);

            // Upper Plinth Tier
            const p2 = new THREE.Mesh(plinthUpperGeo, columnMat);
            p2.position.y = -0.60;
            p2.receiveShadow = true;
            col.add(p2);

            // Gold Base Molding Ring
            const bRing = new THREE.Mesh(colBaseTorusGeo, inlaidGoldMat);
            bRing.rotation.x = Math.PI / 2;
            bRing.position.y = -0.38;
            col.add(bRing);

            // Fluted Shaft
            const shaft = new THREE.Mesh(shaftGeo, columnMat);
            shaft.position.y = 5.25;
            shaft.castShadow = true;
            shaft.receiveShadow = true;
            col.add(shaft);

            // Gold Capital Collar
            const cRing = new THREE.Mesh(colCapitalCollarGeo, inlaidGoldMat);
            cRing.rotation.x = Math.PI / 2;
            cRing.position.y = 10.75;
            col.add(cRing);

            // Corinthian Flaring Capital Bell
            const cBell = new THREE.Mesh(capitalBellGeo, columnMat);
            cBell.position.y = 11.15;
            col.add(cBell);

            // Gilded Abacus Block
            const abacus = new THREE.Mesh(capitalAbacusGeo, inlaidGoldMat);
            abacus.position.y = 11.55;
            col.add(abacus);

            // Wall Sconces on selected columns facing inward
            const isSconceCol = idx === 1 || idx === 3 || idx === 5 || idx === 8; // prominent colonnade pillars
            if (isSconceCol) {
                const sconce = new THREE.Group();
                sconce.position.y = 4.0;

                if (Math.abs(cx) > 10) {
                    const dir = cx < 0 ? 1 : -1;
                    sconce.position.x = dir * 0.7;
                    const arm = new THREE.Mesh(sconceArmGeo, inlaidGoldMat);
                    arm.position.x = dir * 0.25;
                    arm.rotation.y = Math.PI / 2;
                    sconce.add(arm);

                    const cup = new THREE.Mesh(sconceCupGeo, inlaidGoldMat);
                    cup.position.x = dir * 0.55;
                    sconce.add(cup);

                    const flame = new THREE.Mesh(flameGeo, flameMat);
                    flame.position.set(dir * 0.55, 0.22, 0);
                    sconce.add(flame);

                    if (graphicsQuality === 'high') {
                        const pLight = new THREE.PointLight(0xffa834, 0.45, 14, 1.8);
                        pLight.position.set(cx + dir * 0.65, 4.3, cz);
                        palaceGroup.add(pLight);
                    }
                } else {
                    sconce.position.z = 0.7;
                    const arm = new THREE.Mesh(sconceArmGeo, inlaidGoldMat);
                    arm.position.z = 0.25;
                    sconce.add(arm);

                    const cup = new THREE.Mesh(sconceCupGeo, inlaidGoldMat);
                    cup.position.z = 0.55;
                    sconce.add(cup);

                    const flame = new THREE.Mesh(flameGeo, flameMat);
                    flame.position.set(0, 0.22, 0.55);
                    sconce.add(flame);

                    if (graphicsQuality === 'high') {
                        const pLight = new THREE.PointLight(0xffa834, 0.45, 14, 1.8);
                        pLight.position.set(cx, 4.3, cz + 0.65);
                        palaceGroup.add(pLight);
                    }
                }
                col.add(sconce);
            }

            palaceGroup.add(col);
        });

        // 2. Vaulted Romanesque/Gothic Arches spanning the background arcade
        const archGeo = getSharedGeometry('arcadeArchGeo', () => new THREE.TorusGeometry(2.4, 0.26, 10, 32, Math.PI));
        const keystoneGeo = getSharedGeometry('arcadeKeystoneGeo', () => new THREE.BoxGeometry(0.55, 0.65, 0.65));
        const keystoneStudGeo = getSharedGeometry('arcadeKeystoneStudGeo', () => new THREE.ConeGeometry(0.18, 0.22, 4));

        const archSpans = [
            { x: -7.15, z: -9.8 },
            { x: -2.4, z: -10.1 },
            { x: 2.4, z: -10.1 },
            { x: 7.15, z: -9.8 }
        ];

        archSpans.forEach(span => {
            const arch = new THREE.Mesh(archGeo, columnMat);
            arch.position.set(span.x, 11.6, span.z);
            arch.rotation.z = Math.PI; // curves upwards from capital level
            arch.receiveShadow = true;
            palaceGroup.add(arch);

            const keystone = new THREE.Mesh(keystoneGeo, inlaidGoldMat);
            keystone.position.set(span.x, 14.1, span.z);
            palaceGroup.add(keystone);

            const stud = new THREE.Mesh(keystoneStudGeo, goldAccentMat);
            stud.position.set(span.x, 14.1, span.z + 0.35);
            stud.rotation.x = Math.PI / 2;
            palaceGroup.add(stud);
        });

        // Continuous Horizontal Entablature Frieze Beam across background arcade
        const entablatureGeo = getSharedGeometry('entablatureGeo', () => new THREE.BoxGeometry(22.5, 0.55, 1.4));
        const entablature = new THREE.Mesh(entablatureGeo, columnMat);
        entablature.position.set(0, 14.4, -10.0);
        palaceGroup.add(entablature);

        const corniceTrimGeo = getSharedGeometry('corniceTrimGeo', () => new THREE.BoxGeometry(22.8, 0.14, 1.6));
        const corniceTrim = new THREE.Mesh(corniceTrimGeo, inlaidGoldMat);
        corniceTrim.position.set(0, 14.7, -10.0);
        palaceGroup.add(corniceTrim);

        // Flanking Longitudinal Beams linking side columns
        const sideBeamGeo = getSharedGeometry('sideBeamGeo', () => new THREE.BoxGeometry(1.2, 0.50, 12));
        const leftBeam = new THREE.Mesh(sideBeamGeo, columnMat);
        leftBeam.position.set(-11.5, 11.8, 0);
        palaceGroup.add(leftBeam);

        const rightBeam = new THREE.Mesh(sideBeamGeo, columnMat);
        rightBeam.position.set(11.5, 11.8, 0);
        palaceGroup.add(rightBeam);

        // Distant Palace Sanctuary Wall behind the arcade (Creates infinite regal depth)
        const wallGeo = getSharedGeometry('backWallGeo', () => new THREE.PlaneGeometry(55, 26));
        const wallMat = getSharedGeometry('backWallMat', () => new THREE.MeshStandardMaterial({
            color: 0x06050a,
            roughness: 0.85,
            metalness: 0.10
        }));
        const backWall = new THREE.Mesh(wallGeo, wallMat);
        backWall.position.set(0, 9, -16);
        backWall.receiveShadow = true;
        palaceGroup.add(backWall);

        // 3. Suspended Imperial Crown Chandelier overhead
        const chandelierGroup = new THREE.Group();
        chandelierGroup.position.set(0, 17.5, 0);

        const chOuterRingGeo = getSharedGeometry('chOuterRingGeo', () => new THREE.TorusGeometry(2.6, 0.10, 10, 32));
        const chOuterRing = new THREE.Mesh(chOuterRingGeo, inlaidGoldMat);
        chOuterRing.rotation.x = Math.PI / 2;
        chandelierGroup.add(chOuterRing);

        const chInnerRingGeo = getSharedGeometry('chInnerRingGeo', () => new THREE.TorusGeometry(1.4, 0.08, 10, 24));
        const chInnerRing = new THREE.Mesh(chInnerRingGeo, inlaidGoldMat);
        chInnerRing.rotation.x = Math.PI / 2;
        chandelierGroup.add(chInnerRing);

        // 8 Radiating Arms and Candle Flames
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const armGeo = getSharedGeometry('chArmGeo', () => new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8));
            const arm = new THREE.Mesh(armGeo, inlaidGoldMat);
            arm.position.set(Math.cos(angle) * 2.0, 0, Math.sin(angle) * 2.0);
            arm.rotation.z = Math.PI / 2;
            arm.rotation.y = -angle;
            chandelierGroup.add(arm);

            // Candle flame
            const chFlame = new THREE.Mesh(flameGeo, flameMat);
            chFlame.position.set(Math.cos(angle) * 2.6, 0.25, Math.sin(angle) * 2.6);
            chandelierGroup.add(chFlame);
        }

        // 4 Suspension Chains rising toward high palace ceiling
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const chainGeo = getSharedGeometry('chChainGeo', () => new THREE.CylinderGeometry(0.025, 0.025, 9, 6));
            const chain = new THREE.Mesh(chainGeo, inlaidGoldMat);
            chain.position.set(Math.cos(angle) * 1.3, 4.5, Math.sin(angle) * 1.3);
            chandelierGroup.add(chain);
        }

        palaceGroup.add(chandelierGroup);

        scene.add(palaceGroup);
    }

    function buildDustMotes() {
        if (floatingDust) scene.remove(floatingDust);
        const count = graphicsQuality === 'high' ? 140 : 35;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 24;
            positions[i * 3 + 1] = Math.random() * 12;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: 0xdfb758,
            size: 0.065,
            transparent: true,
            opacity: 0.38
        });

        floatingDust = new THREE.Points(geo, mat);
        scene.add(floatingDust);
    }

    /********************************************************************
     * 7. 3D HIGHLIGHTS & VISUAL FEEDBACK
     ********************************************************************/
    function initHighlights() {
        // Selected Square Ring
        const selGeo = new THREE.RingGeometry(0.48, 0.58, 32);
        const selMat = new THREE.MeshBasicMaterial({
            color: 0xdfb758,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });
        selectedRingMesh = new THREE.Mesh(selGeo, selMat);
        selectedRingMesh.rotation.x = -Math.PI / 2;
        selectedRingMesh.position.y = 0.08;
        selectedRingMesh.visible = false;
        scene.add(selectedRingMesh);

        // In-Check Warning Ring
        const checkGeo = new THREE.RingGeometry(0.52, 0.62, 32);
        const checkMat = new THREE.MeshBasicMaterial({
            color: 0xe63946,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95
        });
        checkRingMesh = new THREE.Mesh(checkGeo, checkMat);
        checkRingMesh.rotation.x = -Math.PI / 2;
        checkRingMesh.position.y = 0.082;
        checkRingMesh.visible = false;
        scene.add(checkRingMesh);
    }

    function clearHighlights() {
        if (selectedRingMesh) selectedRingMesh.visible = false;

        destinationMarkerMeshes.forEach(mesh => scene.remove(mesh));
        destinationMarkerMeshes = [];

        if (hintArcMesh) {
            scene.remove(hintArcMesh);
            hintArcMesh = null;
        }
    }

    function clearLastMoveHighlights() {
        lastMoveMarkerMeshes.forEach(mesh => scene.remove(mesh));
        lastMoveMarkerMeshes = [];
    }

    function updateLastMoveHighlights(fromSq, toSq) {
        clearLastMoveHighlights();
        if (!fromSq || !toSq) return;

        const geo = new THREE.RingGeometry(0.45, 0.52, 24);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xcaa24a,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4
        });

        [fromSq, toSq].forEach(sq => {
            const p = squareToWorld(sq);
            const ring = new THREE.Mesh(geo, mat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(p.x, 0.076, p.z);
            scene.add(ring);
            lastMoveMarkerMeshes.push(ring);
        });
    }

    function showLegalMoveHighlights(moves) {
        destinationMarkerMeshes.forEach(mesh => scene.remove(mesh));
        destinationMarkerMeshes = [];

        moves.forEach(m => {
            const pos = squareToWorld(m.to);
            const isCapture = !!m.captured;

            if (isCapture) {
                // Ruby Capture Ring
                const ringGeo = new THREE.RingGeometry(0.46, 0.54, 24);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: 0xe63946,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.85
                });
                const mesh = new THREE.Mesh(ringGeo, ringMat);
                mesh.rotation.x = -Math.PI / 2;
                mesh.position.set(pos.x, 0.08, pos.z);
                scene.add(mesh);
                destinationMarkerMeshes.push(mesh);
            } else {
                // Golden Destination Disc
                const discGeo = new THREE.CircleGeometry(0.18, 20);
                const discMat = new THREE.MeshBasicMaterial({
                    color: 0xdfb758,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.75
                });
                const mesh = new THREE.Mesh(discGeo, discMat);
                mesh.rotation.x = -Math.PI / 2;
                mesh.position.set(pos.x, 0.08, pos.z);
                scene.add(mesh);
                destinationMarkerMeshes.push(mesh);
            }
        });
    }

    function updateCheckHighlight() {
        if (!checkRingMesh) return;
        if (chess.in_check()) {
            const turn = chess.turn();
            let kingSquare = null;
            const b = chess.board();
            for (let r = 0; r < 8; r++) {
                for (let f = 0; f < 8; f++) {
                    const p = b[r][f];
                    if (p && p.type === 'k' && p.color === turn) {
                        kingSquare = FILES[f] + (8 - r);
                        break;
                    }
                }
                if (kingSquare) break;
            }

            if (kingSquare) {
                const pos = squareToWorld(kingSquare);
                checkRingMesh.position.set(pos.x, 0.082, pos.z);
                checkRingMesh.visible = true;
            }
        } else {
            checkRingMesh.visible = false;
        }
    }

    /********************************************************************
     * 8. BOARD RESYNCHRONIZATION (PIECES & 3D MESHES)
     ********************************************************************/
    function syncAllPiecesFromBoard() {
        // Remove old pieces from scene
        pieceMeshes.forEach(mesh => scene.remove(mesh));
        pieceMeshes.clear();

        const board = chess.board();
        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                const p = board[r][f];
                if (!p) continue;

                const square = FILES[f] + (8 - r);
                const mesh = createPieceMesh(p.type, p.color);
                const pos = squareToWorld(square);

                mesh.position.set(pos.x, 0, pos.z);
                mesh.userData.square = square;
                mesh.userData.type = p.type;
                mesh.userData.color = p.color;

                scene.add(mesh);
                pieceMeshes.set(square, mesh);
            }
        }

        updateCheckHighlight();
        updateHUDGraveyardAndTurn();
    }

    /********************************************************************
     * 9. PIECE MOVE ANIMATION & EASING
     ********************************************************************/
    function animatePieceMove(fromSq, toSq, onComplete) {
        isAnimating = true;
        const pieceMesh = pieceMeshes.get(fromSq);
        if (!pieceMesh) {
            isAnimating = false;
            if (onComplete) onComplete();
            return;
        }

        const startPos = squareToWorld(fromSq);
        const endPos = squareToWorld(toSq);
        const duration = 380; // ms
        const startTime = performance.now();

        sound.playMove(0.38);

        function step(now) {
            const elapsed = now - startTime;
            const t = Math.min(1.0, elapsed / duration);

            // Smooth cubic ease-in-out
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            pieceMesh.position.x = startPos.x + (endPos.x - startPos.x) * ease;
            pieceMesh.position.z = startPos.z + (endPos.z - startPos.z) * ease;
            // Parabolic Arc
            pieceMesh.position.y = Math.sin(t * Math.PI) * 1.25;

            if (t < 1.0) {
                requestAnimationFrame(step);
            } else {
                pieceMesh.position.set(endPos.x, 0, endPos.z);
                pieceMesh.userData.square = toSq;
                isAnimating = false;
                if (onComplete) onComplete();
            }
        }

        requestAnimationFrame(step);
    }

    /********************************************************************
     * 10. CHESS MOVE EXECUTION & AUTHORITATIVE COMMIT
     ********************************************************************/
    function handleSquareSelect(square) {
        if (isAnimating || aiThinking || chess.game_over()) return;

        // If playing AI and not player turn, ignore piece interaction
        if (gameMode === 'ai' && chess.turn() !== playerSide) return;

        const pieceOnSquare = chess.get(square);

        // If clicking own piece
        if (pieceOnSquare && pieceOnSquare.color === chess.turn()) {
            if (selectedSquare === square) {
                // Deselect
                selectedSquare = null;
                legalMovesForSelected = [];
                clearHighlights();
                sound.playClick();
                return;
            }

            // Select Piece
            selectedSquare = square;
            legalMovesForSelected = chess.moves({ square, verbose: true });

            clearHighlights();
            const pos = squareToWorld(square);
            if (selectedRingMesh) {
                selectedRingMesh.position.set(pos.x, 0.08, pos.z);
                selectedRingMesh.visible = true;
            }

            showLegalMoveHighlights(legalMovesForSelected);
            sound.playSelect();
            return;
        }

        // If a piece is already selected, check if destination is legal
        if (selectedSquare) {
            const legalMove = legalMovesForSelected.find(m => m.to === square);
            if (legalMove) {
                // Check for Pawn Promotion
                if (legalMove.flags.includes('p') || legalMove.promotion) {
                    pendingPromotionMove = legalMove;
                    openPromotionModal();
                    return;
                }

                // Execute Move
                executeCommittedMove(legalMove);
            } else {
                // Clicked illegal destination -> deselect
                selectedSquare = null;
                legalMovesForSelected = [];
                clearHighlights();
                sound.playClick();
            }
        }
    }

    function executeCommittedMove(moveObj) {
        const fromSq = moveObj.from;
        const toSq = moveObj.to;
        const token = ++currentRequestId;

        clearHighlights();
        selectedSquare = null;
        legalMovesForSelected = [];

        const isCapture = !!moveObj.captured;
        if (isCapture) {
            sound.playCapture();
        }

        animatePieceMove(fromSq, toSq, () => {
            if (token !== currentRequestId) return;

            const committed = chess.move(moveObj);
            if (!committed) {
                syncAllPiecesFromBoard();
                return;
            }

            lastMoveSquares = [fromSq, toSq];
            updateLastMoveHighlights(fromSq, toSq);
            syncAllPiecesFromBoard();

            showToast(\`\${committed.color === 'w' ? 'Gold' : 'Obsidian'}: \${committed.san}\`);

            if (chess.in_checkmate()) {
                sound.playVictory();
                triggerGameOver('checkmate');
                return;
            } else if (chess.in_check()) {
                sound.playCheck();
            } else if (chess.game_over()) {
                sound.playDraw();
                triggerGameOver('draw');
                return;
            }

            // Trigger AI if appropriate
            if (gameMode === 'ai' && chess.turn() !== playerSide && !chess.game_over()) {
                triggerRoyalAI();
            }
        });
    }

    /********************************************************************
     * 11. PAWN PROMOTION HANDLING
     ********************************************************************/
    function openPromotionModal() {
        const modal = document.getElementById('promotion-modal');
        if (modal) modal.classList.add('open');
    }

    function closePromotionModal() {
        const modal = document.getElementById('promotion-modal');
        if (modal) modal.classList.remove('open');
    }

    window.commitPromotion = function(pieceCode) {
        closePromotionModal();
        if (!pendingPromotionMove) return;

        const moveWithPromo = Object.assign({}, pendingPromotionMove, { promotion: pieceCode });
        pendingPromotionMove = null;
        executeCommittedMove(moveWithPromo);
    };

    window.cancelPromotion = function() {
        closePromotionModal();
        pendingPromotionMove = null;
        selectedSquare = null;
        legalMovesForSelected = [];
        clearHighlights();
        showToast('Promotion Cancelled');
    };

    /********************************************************************
     * 12. THE ROYAL AI ENGINE (HEURISTIC MINIMAX + PIECE-SQUARE TABLES)
     ********************************************************************/
    const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

    const PAWN_PST = [
        0,  0,  0,  0,  0,  0,  0,  0,
       50, 50, 50, 50, 50, 50, 50, 50,
       10, 10, 20, 30, 30, 20, 10, 10,
        5,  5, 10, 25, 25, 10,  5,  5,
        0,  0,  0, 20, 20,  0,  0,  0,
        5, -5,-10,  0,  0,-10, -5,  5,
        5, 10, 10,-20,-20, 10, 10,  5,
        0,  0,  0,  0,  0,  0,  0,  0
    ];

    const KNIGHT_PST = [
      -50,-40,-30,-30,-30,-30,-40,-50,
      -40,-20,  0,  0,  0,  0,-20,-40,
      -30,  0, 10, 15, 15, 10,  0,-30,
      -30,  5, 15, 20, 20, 15,  5,-30,
      -30,  0, 15, 20, 20, 15,  0,-30,
      -30,  5, 10, 15, 15, 10,  5,-30,
      -40,-20,  0,  5,  5,  0,-20,-40,
      -50,-40,-30,-30,-30,-30,-40,-50
    ];

    function evaluateBoard(gameInstance) {
        if (gameInstance.in_checkmate()) {
            return gameInstance.turn() === 'w' ? -99999 : 99999;
        }
        if (gameInstance.in_draw() || gameInstance.in_stalemate() || gameInstance.in_threefold_repetition()) {
            return 0;
        }

        let score = 0;
        const b = gameInstance.board();
        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                const piece = b[r][f];
                if (!piece) continue;
                const baseVal = PIECE_VALUES[piece.type] || 0;
                let pst = 0;
                const sqIdx = piece.color === 'w' ? r * 8 + f : (7 - r) * 8 + f;
                if (piece.type === 'p') pst = PAWN_PST[sqIdx];
                else if (piece.type === 'n') pst = KNIGHT_PST[sqIdx];

                const total = baseVal + pst;
                score += piece.color === 'w' ? total : -total;
            }
        }
        return score;
    }

    function minimaxAlphaBeta(gameInstance, depth, alpha, beta, isMaximizing, startTime, maxTime) {
        if (performance.now() - startTime > maxTime) return evaluateBoard(gameInstance);
        if (depth === 0 || gameInstance.game_over()) return evaluateBoard(gameInstance);

        const moves = gameInstance.moves({ verbose: true });
        moves.sort((a, b) => {
            let scoreA = a.captured ? (PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece]) : 0;
            let scoreB = b.captured ? (PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece]) : 0;
            return scoreB - scoreA;
        });

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                gameInstance.move(moves[i]);
                const ev = minimaxAlphaBeta(gameInstance, depth - 1, alpha, beta, false, startTime, maxTime);
                gameInstance.undo();
                maxEval = Math.max(maxEval, ev);
                alpha = Math.max(alpha, ev);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < moves.length; i++) {
                gameInstance.move(moves[i]);
                const ev = minimaxAlphaBeta(gameInstance, depth - 1, alpha, beta, true, startTime, maxTime);
                gameInstance.undo();
                minEval = Math.min(minEval, ev);
                beta = Math.min(beta, ev);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    function computeBestRoyalMove() {
        const moves = chess.moves({ verbose: true });
        if (moves.length === 0) return null;

        const isWhite = chess.turn() === 'w';
        const depth = aiDifficulty === 'novice' ? 2 : (aiDifficulty === 'adept' ? 3 : 4);
        const maxTime = 1100;
        const startTime = performance.now();

        moves.sort((a, b) => {
            let scoreA = a.captured ? (PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece]) : 0;
            let scoreB = b.captured ? (PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece]) : 0;
            return scoreB - scoreA;
        });

        let bestMove = moves[0];
        let bestVal = isWhite ? -Infinity : Infinity;

        for (let i = 0; i < moves.length; i++) {
            chess.move(moves[i]);
            let val = minimaxAlphaBeta(chess, depth - 1, -Infinity, Infinity, !isWhite, startTime, maxTime);
            chess.undo();

            if (aiDifficulty === 'novice') {
                val += (Math.random() - 0.5) * 35;
            }

            if (isWhite ? val > bestVal : val < bestVal) {
                bestVal = val;
                bestMove = moves[i];
            }
        }
        return bestMove;
    }

    function triggerRoyalAI() {
        if (aiThinking || isAnimating || chess.game_over()) return;
        aiThinking = true;
        const token = currentRequestId;

        const turnBadge = document.getElementById('status-badge');
        if (turnBadge) turnBadge.textContent = 'Thinking...';

        setTimeout(() => {
            if (token !== currentRequestId || !aiThinking || chess.game_over()) {
                aiThinking = false;
                return;
            }

            const chosenMove = computeBestRoyalMove();
            aiThinking = false;

            if (turnBadge) turnBadge.textContent = 'Live';

            if (chosenMove) {
                executeCommittedMove(chosenMove);
            }
        }, 360);
    }

    /********************************************************************
     * 13. ROYAL HINT / INSIGHT FEATURE
     ********************************************************************/
    window.requestRoyalHint = function() {
        if (isAnimating || aiThinking || chess.game_over()) return;
        sound.playSelect();

        const bestMove = computeBestRoyalMove();
        if (!bestMove) {
            showToast('No legal hint available.');
            return;
        }

        showToast(\`Hint: \${bestMove.from.toUpperCase()} \u2192 \${bestMove.to.toUpperCase()}\`);

        if (hintArcMesh) scene.remove(hintArcMesh);

        const startP = squareToWorld(bestMove.from);
        const endP = squareToWorld(bestMove.to);
        const midP = {
            x: (startP.x + endP.x) / 2,
            y: 2.2,
            z: (startP.z + endP.z) / 2
        };

        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(startP.x, 0.1, startP.z),
            new THREE.Vector3(midP.x, midP.y, midP.z),
            new THREE.Vector3(endP.x, 0.1, endP.z)
        );

        const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
            color: 0xdfb758,
            transparent: true,
            opacity: 0.95
        });

        hintArcMesh = new THREE.Mesh(tubeGeo, tubeMat);
        scene.add(hintArcMesh);

        setTimeout(() => {
            if (hintArcMesh) {
                scene.remove(hintArcMesh);
                hintArcMesh = null;
            }
        }, 3200);
    };

    /********************************************************************
     * 14. UNDO MOVE & RESTORATION GUARD
     ********************************************************************/
    window.undoLastMove = function() {
        if (isAnimating || aiThinking) return;

        const hist = chess.history();
        if (hist.length === 0) {
            showToast('Initial position \u2014 no moves to undo.');
            sound.playClick();
            return;
        }

        currentRequestId++;
        cancelPromotion();
        clearHighlights();
        clearLastMoveHighlights();

        if (gameMode === 'ai') {
            if (chess.turn() === playerSide && hist.length >= 2) {
                chess.undo();
                chess.undo();
            } else {
                chess.undo();
            }
        } else {
            chess.undo();
        }

        syncAllPiecesFromBoard();
        sound.playMove(0.25);
        showToast('Move Reverted');
    };

    /********************************************************************
     * 15. RESTART & MATCH LIFECYCLE MANAGEMENT
     ********************************************************************/
    window.confirmRestart = function() {
        if (chess.history().length === 0) {
            executeRestart();
            return;
        }
        const m = document.getElementById('restart-modal');
        if (m) m.classList.add('open');
    };

    window.closeRestartModal = function() {
        const m = document.getElementById('restart-modal');
        if (m) m.classList.remove('open');
    };

    window.executeRestart = function() {
        closeRestartModal();
        currentRequestId++;
        isAnimating = false;
        aiThinking = false;
        cancelPromotion();
        clearHighlights();
        clearLastMoveHighlights();

        chess.reset();
        syncAllPiecesFromBoard();
        sound.playVictory();
        showToast('New Match Begun');

        if (gameMode === 'ai' && playerSide === 'b') {
            triggerRoyalAI();
        }
    };

    window.confirmReturnToMenu = function() {
        if (chess.history().length === 0) {
            executeReturnToMenu();
            return;
        }
        const m = document.getElementById('menu-confirm-modal');
        if (m) m.classList.add('open');
    };

    window.closeMenuConfirmModal = function() {
        const m = document.getElementById('menu-confirm-modal');
        if (m) m.classList.remove('open');
    };

    window.executeReturnToMenu = function() {
        closeMenuConfirmModal();
        currentRequestId++;
        isAnimating = false;
        aiThinking = false;
        cancelPromotion();
        clearHighlights();

        isTitleScreenActive = true;
        const params = getAdaptiveCameraParams();
        camTargetRadius = Math.max(21.0, params.targetRadius * 1.25);
        camTargetPhi = 0.65;
        camTargetTheta = 0.38;

        const screen = document.getElementById('title-screen');
        if (screen) screen.classList.remove('hidden');
        sound.playClick();
    };

    window.startGameFromMenu = function() {
        sound.init();
        sound.playClick();
        sound.playSanctumEnter();

        isTitleScreenActive = false;

        const screen = document.getElementById('title-screen');
        if (screen) screen.classList.add('hidden');

        // Cinematic swoop down into the adaptive royal perspective
        const params = getAdaptiveCameraParams();
        camTargetRadius = params.targetRadius;
        camTargetPhi = params.targetPhi;
        camTargetTheta = isFlipped ? Math.PI : 0.0;

        executeRestart();
    };

    window.playAgain = function() {
        closeGameOverModal();
        executeRestart();
    };

    window.returnToMenuFromGameOver = function() {
        closeGameOverModal();
        executeReturnToMenu();
    };

    window.closeGameOverModal = function() {
        const m = document.getElementById('game-over-modal');
        if (m) m.classList.remove('open');
    };

    function triggerGameOver(reasonType) {
        const modal = document.getElementById('game-over-modal');
        const titleEl = document.getElementById('game-over-title');
        const reasonEl = document.getElementById('game-over-reason');
        const statMoves = document.getElementById('stat-moves');
        const statCaptures = document.getElementById('stat-captures');

        if (statMoves) statMoves.textContent = chess.history().length;
        if (statCaptures) {
            const currentCount = Array.from(pieceMeshes.values()).length;
            statCaptures.textContent = Math.max(0, 32 - currentCount);
        }

        if (reasonType === 'checkmate') {
            const winner = chess.turn() === 'w' ? 'Obsidian' : 'Gold';
            if (titleEl) titleEl.textContent = 'ROYAL CHECKMATE';
            if (reasonEl) reasonEl.textContent = \`\${winner} claims sovereign victory upon the board!\`;
        } else {
            let reasonStr = 'Draw by Agreement.';
            if (chess.in_stalemate()) reasonStr = 'Draw by Stalemate (No legal moves).';
            else if (chess.in_threefold_repetition()) reasonStr = 'Draw by Threefold Repetition.';
            else if (chess.insufficient_material()) reasonStr = 'Draw by Insufficient Material.';
            else if (chess.history().length >= 100) reasonStr = 'Draw by 50-Move Rule.';

            if (titleEl) titleEl.textContent = 'ACCORD OF MONARCHS';
            if (reasonEl) reasonEl.textContent = reasonStr;
        }

        if (modal) modal.classList.add('open');
    }

    /********************************************************************
     * 16. CAMERA PRESETS & BOARD FLIP
     ********************************************************************/
    window.toggleFlipBoard = function() {
        isFlipped = !isFlipped;
        camTargetTheta += Math.PI;
        sound.playClick();
        showToast(isFlipped ? 'Board Flipped (Black Horizon)' : 'Board Flipped (White Horizon)');
    };

    let currentCameraPreset = 0;
    const CAMERA_PRESETS = [
        { name: 'Cinematic 3D', radiusMult: 1.0, phi: 0.94 },
        { name: 'Overhead Angle', radiusMult: 0.90, phi: 0.52 },
        { name: 'Top-Down Tactical', radiusMult: 0.88, phi: 0.05 }
    ];

    window.cycleCameraView = function() {
        currentCameraPreset = (currentCameraPreset + 1) % CAMERA_PRESETS.length;
        const p = CAMERA_PRESETS[currentCameraPreset];
        const params = getAdaptiveCameraParams();
        if (currentCameraPreset === 0) {
            camTargetRadius = params.targetRadius;
            camTargetPhi = params.targetPhi;
        } else {
            camTargetRadius = params.targetRadius * p.radiusMult;
            camTargetPhi = p.phi;
        }
        sound.playClick();
        showToast(\`Camera: \${p.name}\`);
        updateOverflowLabels();
    };

    /********************************************************************
     * 17. HUD GRAVEYARD, TURN ORB & MOVE HISTORY
     ********************************************************************/
    function updateHUDGraveyardAndTurn() {
        const turn = chess.turn();
        const turnOrb = document.getElementById('turn-orb');
        const turnText = document.getElementById('turn-text');
        const statusBadge = document.getElementById('status-badge');
        const materialPill = document.getElementById('material-pill');

        if (turnOrb) {
            if (turn === 'w') {
                turnOrb.style.background = '#fbe6a8';
                turnOrb.style.boxShadow = '0 0 10px #fbe6a8';
            } else {
                turnOrb.style.background = '#1e1c28';
                turnOrb.style.boxShadow = '0 0 10px #dfb758';
            }
        }

        if (turnText) {
            turnText.textContent = turn === 'w' ? "Gold's Move" : "Obsidian's Move";
        }

        if (statusBadge) {
            if (chess.in_checkmate()) {
                statusBadge.textContent = 'CHECKMATE';
                statusBadge.style.color = '#e63946';
                statusBadge.classList.add('check-pulse');
            } else if (chess.in_check()) {
                statusBadge.textContent = 'IN CHECK!';
                statusBadge.style.color = '#e63946';
                statusBadge.classList.add('check-pulse');
            } else {
                statusBadge.textContent = 'Live';
                statusBadge.style.color = 'var(--gold-light)';
                statusBadge.classList.remove('check-pulse');
            }
        }

        let wScore = 0;
        let bScore = 0;
        const b = chess.board();
        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                const p = b[r][f];
                if (!p) continue;
                const v = PIECE_VALUES[p.type] || 0;
                if (p.color === 'w') wScore += v;
                else bScore += v;
            }
        }

        const diff = (wScore - bScore) / 100;
        if (materialPill) {
            if (diff > 0) materialPill.textContent = \`+\${diff.toFixed(1)} Gold\`;
            else if (diff < 0) materialPill.textContent = \`+\${Math.abs(diff).toFixed(1)} Obs\`;
            else materialPill.textContent = 'Even';
        }

        const pieceIcons = {
            p: '\u265F', r: '\u265C', n: '\u265E', b: '\u265D', q: '\u265B', k: '\u265A'
        };

        const standardCounts = { p: 8, r: 2, n: 2, b: 2, q: 1 };
        const liveCountsW = { p: 0, r: 0, n: 0, b: 0, q: 0 };
        const liveCountsB = { p: 0, r: 0, n: 0, b: 0, q: 0 };

        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                const p = b[r][f];
                if (!p || p.type === 'k') continue;
                if (p.color === 'w') liveCountsW[p.type]++;
                else liveCountsB[p.type]++;
            }
        }

        const gyGold = document.getElementById('graveyard-gold');
        const gyObsidian = document.getElementById('graveyard-obsidian');

        if (gyGold) {
            gyGold.innerHTML = '';
            ['q', 'r', 'b', 'n', 'p'].forEach(type => {
                const lost = standardCounts[type] - liveCountsW[type];
                for (let i = 0; i < lost; i++) {
                    const span = document.createElement('span');
                    span.className = 'dead-piece-icon dead-piece-gold';
                    span.textContent = pieceIcons[type];
                    gyGold.appendChild(span);
                }
            });
        }

        if (gyObsidian) {
            gyObsidian.innerHTML = '';
            ['q', 'r', 'b', 'n', 'p'].forEach(type => {
                const lost = standardCounts[type] - liveCountsB[type];
                for (let i = 0; i < lost; i++) {
                    const span = document.createElement('span');
                    span.className = 'dead-piece-icon dead-piece-obsidian';
                    span.textContent = pieceIcons[type];
                    gyObsidian.appendChild(span);
                }
            });
        }

        updateMoveHistoryDrawer();
    }

    function updateMoveHistoryDrawer() {
        const tbody = document.getElementById('move-list-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const history = chess.history();
        for (let i = 0; i < history.length; i += 2) {
            const tr = document.createElement('tr');
            const moveNum = (i / 2) + 1;

            const tdNum = document.createElement('td');
            tdNum.className = 'move-num';
            tdNum.textContent = \`\${moveNum}.\`;

            const tdW = document.createElement('td');
            tdW.className = 'move-white';
            tdW.textContent = history[i] || '';

            const tdB = document.createElement('td');
            tdB.className = 'move-black';
            tdB.textContent = history[i + 1] || '';

            tr.appendChild(tdNum);
            tr.appendChild(tdW);
            tr.appendChild(tdB);
            tbody.appendChild(tr);
        }
    }

    window.openHistoryDrawer = function() {
        const d = document.getElementById('history-drawer');
        if (d) d.classList.add('open');
        sound.playClick();
    };

    window.closeHistoryDrawer = function() {
        const d = document.getElementById('history-drawer');
        if (d) d.classList.remove('open');
        sound.playClick();
    };

    window.openDedicationModal = function() {
        const m = document.getElementById('dedication-modal');
        if (m) m.classList.add('open');
        sound.playClick();
    };

    window.closeDedicationModal = function() {
        const m = document.getElementById('dedication-modal');
        if (m) m.classList.remove('open');
        sound.playClick();
    };

    window.openActionsOverflow = function() {
        sound.playClick();
        const m = document.getElementById('actions-overflow-modal');
        if (m) m.classList.add('open');
        updateOverflowLabels();
    };

    window.closeActionsOverflow = function() {
        const m = document.getElementById('actions-overflow-modal');
        if (m) m.classList.remove('open');
    };

    function updateOverflowLabels() {
        const camTitle = document.getElementById('overflow-cam-title');
        if (camTitle) camTitle.textContent = \`Camera: \${CAMERA_PRESETS[currentCameraPreset].name}\`;

        const soundTitle = document.getElementById('overflow-sound-title');
        const soundIcon = document.getElementById('overflow-sound-icon');
        if (soundTitle) soundTitle.textContent = sound.enabled ? 'Audio: Enabled' : 'Audio: Muted';
        if (soundIcon) soundIcon.textContent = sound.enabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';

        const coordsTitle = document.getElementById('overflow-coords-title');
        if (coordsTitle) coordsTitle.textContent = \`Coordinates: \${showCoordinates ? 'On' : 'Off'}\`;

        const gfxTitle = document.getElementById('overflow-gfx-title');
        if (gfxTitle) gfxTitle.textContent = \`Graphics: \${graphicsQuality === 'high' ? 'High' : 'Battery'}\`;
    }

    window.toggleSound = function() {
        sound.enabled = !sound.enabled;
        try {
            localStorage.setItem('crown_chess_sound', String(sound.enabled));
        } catch (e) {}

        const btn = document.getElementById('sound-btn');
        if (btn) btn.textContent = sound.enabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';
        showToast(sound.enabled ? 'Sound Enabled' : 'Sound Muted');
        updateOverflowLabels();
    };

    window.toggleCoords = function() {
        showCoordinates = !showCoordinates;
        coordLabels.forEach(lbl => lbl.visible = showCoordinates);
        const btn = document.getElementById('coords-btn');
        if (btn) btn.textContent = showCoordinates ? 'Coords: On' : 'Coords: Off';
        sound.playClick();
        updateOverflowLabels();
    };

    window.toggleGraphicsMode = function() {
        graphicsQuality = graphicsQuality === 'high' ? 'battery' : 'high';
        const btn = document.getElementById('graphics-toggle-btn');
        if (btn) btn.textContent = graphicsQuality === 'high' ? 'Graphics: High' : 'Graphics: Battery';

        if (renderer) {
            renderer.shadowMap.enabled = (graphicsQuality === 'high');
            renderer.setPixelRatio(graphicsQuality === 'high' ? Math.min(window.devicePixelRatio, 2.0) : 1.0);
        }
        buildDustMotes();
        sound.playClick();
        showToast(\`Graphics: \${graphicsQuality === 'high' ? 'High Fidelity' : 'Battery Saver'}\`);
        updateOverflowLabels();
    };

    window.selectGameMode = function(mode) {
        gameMode = mode;
        const card2p = document.getElementById('mode-card-2p');
        const cardAi = document.getElementById('mode-card-ai');
        const aiPanel = document.getElementById('ai-options-panel');

        if (mode === 'pass_and_play') {
            if (card2p) card2p.classList.add('active');
            if (cardAi) cardAi.classList.remove('active');
            if (aiPanel) aiPanel.style.display = 'none';
        } else {
            if (card2p) card2p.classList.remove('active');
            if (cardAi) cardAi.classList.add('active');
            if (aiPanel) aiPanel.style.display = 'flex';
        }
        sound.playClick();
    };

    window.selectPlayerSide = function(side) {
        playerSide = side;
        const btnG = document.getElementById('side-gold');
        const btnO = document.getElementById('side-obsidian');
        if (side === 'w') {
            if (btnG) btnG.classList.add('active');
            if (btnO) btnO.classList.remove('active');
        } else {
            if (btnG) btnG.classList.remove('active');
            if (btnO) btnO.classList.add('active');
        }
        sound.playClick();
    };

    window.selectDifficulty = function(diff) {
        aiDifficulty = diff;
        ['novice', 'adept', 'master'].forEach(d => {
            const el = document.getElementById(\`diff-\${d}\`);
            if (el) {
                if (d === diff) el.classList.add('active');
                else el.classList.remove('active');
            }
        });
        sound.playClick();
    };

    window.__crown = {
        chess,
        syncAllPiecesFromBoard,
        updateHUDGraveyardAndTurn,
        handleSquareSelect,
        triggerGameOver,
        executeCommittedMove,
        makeMoveSAN: function(san) {
            const m = chess.move(san);
            if (m) {
                chess.undo();
                executeCommittedMove(m);
            }
        }
    };

    function showToast(msg) {
        const box = document.getElementById('toast-container');
        const msgEl = document.getElementById('toast-msg');
        if (!box || !msgEl) return;
        msgEl.textContent = msg;
        box.classList.add('show');
        clearTimeout(box._timer);
        box._timer = setTimeout(() => {
            box.classList.remove('show');
        }, 2200);
    }

    /********************************************************************
     * 18. UNIFIED POINTER CONTROLLER (ORBIT, PINCH-ZOOM & TAP PICKING)
     ********************************************************************/
    function setupPointerInteractions(domElement) {
        domElement.addEventListener('pointerdown', (e) => {
            domElement.setPointerCapture(e.pointerId);
            activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            if (activePointers.size === 1) {
                pointerDownPos = { x: e.clientX, y: e.clientY };
                isDraggingCamera = false;
            } else if (activePointers.size === 2) {
                const pts = Array.from(activePointers.values());
                const dx = pts[0].x - pts[1].x;
                const dy = pts[0].y - pts[1].y;
                initialPinchDist = Math.hypot(dx, dy);
            }
        });

        domElement.addEventListener('pointermove', (e) => {
            if (!activePointers.has(e.pointerId)) return;
            const prev = activePointers.get(e.pointerId);
            const dx = e.clientX - prev.x;
            const dy = e.clientY - prev.y;
            activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            if (activePointers.size === 1) {
                const totalDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
                if (totalDist > 8) {
                    isDraggingCamera = true;
                    camTargetTheta -= dx * 0.0065;
                    camTargetPhi = Math.max(0.08, Math.min(1.42, camTargetPhi - dy * 0.0055));
                }
            } else if (activePointers.size === 2) {
                const pts = Array.from(activePointers.values());
                const curDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                if (initialPinchDist > 0) {
                    const factor = curDist / initialPinchDist;
                    camTargetRadius = Math.max(9.0, Math.min(26.0, camTargetRadius / factor));
                    initialPinchDist = curDist;
                }
            }
        });

        domElement.addEventListener('pointerup', (e) => {
            domElement.releasePointerCapture(e.pointerId);
            activePointers.delete(e.pointerId);

            if (!isDraggingCamera && activePointers.size === 0) {
                handlePointerTap(e.clientX, e.clientY);
            }
            isDraggingCamera = false;
        });

        domElement.addEventListener('pointercancel', (e) => {
            activePointers.delete(e.pointerId);
            isDraggingCamera = false;
        });

        domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            camTargetRadius = Math.max(9.0, Math.min(26.0, camTargetRadius + e.deltaY * 0.012));
        }, { passive: false });
    }

    function handlePointerTap(clientX, clientY) {
        if (!camera || !scene) return;
        const rect = renderer.domElement.getBoundingClientRect();
        mouseVector.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouseVector.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseVector, camera);

        const allPieceMeshes = Array.from(pieceMeshes.values());
        const pieceHits = raycaster.intersectObjects(allPieceMeshes, true);
        const sqHits = raycaster.intersectObjects(boardSquares, false);

        // Priority 1: Direct piece tap (with distance-check so pieces take precedence)
        if (pieceHits.length > 0 && (sqHits.length === 0 || pieceHits[0].distance <= sqHits[0].distance + 0.6)) {
            let curr = pieceHits[0].object;
            while (curr && curr.parent && curr.parent !== scene) {
                if (curr.userData && curr.userData.square) {
                    handleSquareSelect(curr.userData.square);
                    return;
                }
                curr = curr.parent;
            }
        }

        // Priority 2: Direct square tap
        if (sqHits.length > 0) {
            const sq = sqHits[0].object.userData.square;
            if (sq) {
                handleSquareSelect(sq);
                return;
            }
        }

        // Tap on empty space clears active selection
        clearHighlights();
        selectedSquare = null;
        legalMovesForSelected = [];
    }

    /********************************************************************
     * 19. ADAPTIVE RESPONSIVE CAMERA, SCENE SETUP & ANIMATION LOOP
     ********************************************************************/
    function getAdaptiveCameraParams() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const aspect = w / h;

        let baseFov = 38;
        let targetRadius = 16.5;
        let targetPhi = 0.94;
        let lookAtY = 0.15;
        let lookAtZ = 0.25;

        if (aspect < 0.60) {
            // Compact & standard portrait phone (e.g. 320x568, 360x800, 390x844, 412x915)
            const targetHFOV = 44.0;
            const vFOV = 2 * Math.atan(Math.tan((targetHFOV * Math.PI / 180) / 2) / aspect) * (180 / Math.PI);
            baseFov = Math.min(Math.max(vFOV, 45), 76);
            targetRadius = 17.2;
            targetPhi = 0.88;
            lookAtY = 0.20;
            lookAtZ = 0.45;
        } else if (aspect < 0.95) {
            // Broad vertical phone / portrait tablet (e.g. 600x960, 768x1024, 820x1180)
            const targetHFOV = 42.0;
            const vFOV = 2 * Math.atan(Math.tan((targetHFOV * Math.PI / 180) / 2) / aspect) * (180 / Math.PI);
            baseFov = Math.min(Math.max(vFOV, 40), 65);
            targetRadius = 16.8;
            targetPhi = 0.90;
            lookAtY = 0.18;
            lookAtZ = 0.35;
        } else if (h < 500) {
            // Landscape phone (e.g. 844x390, 667x375, 800x360)
            baseFov = 36;
            targetRadius = 14.8;
            targetPhi = 0.98;
            lookAtY = 0.10;
            lookAtZ = 0.10;
        } else {
            // Standard Desktop / Laptop / Landscape Tablet
            baseFov = 38;
            targetRadius = 16.5;
            targetPhi = 0.94;
            lookAtY = 0.15;
            lookAtZ = 0.25;
        }

        return { baseFov, targetRadius, targetPhi, lookAtY, lookAtZ, aspect };
    }

    function updateAdaptiveCamera(instant) {
        if (!camera || !renderer) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const params = getAdaptiveCameraParams();

        camera.aspect = params.aspect;
        camera.fov = params.baseFov;
        camera.updateProjectionMatrix();

        renderer.setSize(w, h);
        renderer.setPixelRatio(graphicsQuality === 'high' ? Math.min(window.devicePixelRatio || 1, 2.0) : 1.0);

        camLookAt.set(0, params.lookAtY, params.lookAtZ);

        if (!isTitleScreenActive) {
            if (currentCameraPreset === 0) {
                camTargetRadius = params.targetRadius;
                camTargetPhi = params.targetPhi;
                if (instant) {
                    camRadius = camTargetRadius;
                    camPhi = camTargetPhi;
                }
            }
        }
    }

    function initThreeScene() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        container.innerHTML = '';

        const width = window.innerWidth;
        const height = window.innerHeight;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x06050b, 0.015);

        const params = getAdaptiveCameraParams();
        camera = new THREE.PerspectiveCamera(params.baseFov, width / height, 0.1, 100);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(graphicsQuality === 'high' ? Math.min(window.devicePixelRatio || 1, 2.0) : 1.0);
        renderer.shadowMap.enabled = (graphicsQuality === 'high');
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(renderer.domElement);

        initMaterials();

        // 1. Deep Warm Ambient Lighting (Preserves shadow clarity without crushing blacks)
        const ambientLight = new THREE.AmbientLight(0x1a1624, 0.52);
        scene.add(ambientLight);

        // 2. Warm Royal Key Directional Light (Chandelier casting soft shadows)
        const keyLight = new THREE.DirectionalLight(0xfff2de, 1.25);
        keyLight.position.set(6, 18, 8);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.near = 2;
        keyLight.shadow.camera.far = 40;
        keyLight.shadow.camera.left = -7.5;
        keyLight.shadow.camera.right = 7.5;
        keyLight.shadow.camera.top = 7.5;
        keyLight.shadow.camera.bottom = -7.5;
        keyLight.shadow.bias = -0.0004;
        scene.add(keyLight);

        // 3. Overhead Warm Amber Fill Point Light (Palace Luminary)
        const fillLight = new THREE.PointLight(0xe8c15a, 0.55, 28);
        fillLight.position.set(0, 9.0, 0);
        scene.add(fillLight);

        // 4. Cool Sapphire Rim Backlight (Accentuates obsidian piece silhouettes)
        const rimLight = new THREE.DirectionalLight(0x788cd2, 0.88);
        rimLight.position.set(-8, 14, -10);
        scene.add(rimLight);

        // 5. Polished Dark Royal Marble Hall Floor (With reflections and seams)
        const groundGeo = new THREE.PlaneGeometry(80, 80);
        const ground = new THREE.Mesh(groundGeo, floorMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1.25;
        ground.receiveShadow = true;
        scene.add(ground);

        buildPedestalAndBoard();
        buildPalaceSanctum();
        buildDustMotes();
        initHighlights();
        setupPointerInteractions(renderer.domElement);

        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener('orientationchange', () => {
            setTimeout(() => updateAdaptiveCamera(true), 120);
        });

        if (window.ResizeObserver && container) {
            const ro = new ResizeObserver(() => {
                updateAdaptiveCamera(false);
            });
            ro.observe(container);
        }
    }

    function onWindowResize() {
        updateAdaptiveCamera(false);
    }

    let lastFrameTime = performance.now();
    function animate() {
        requestAnimationFrame(animate);

        const now = performance.now();
        const delta = Math.min((now - lastFrameTime) * 0.001, 0.1);
        lastFrameTime = now;

        // Slow cinematic camera drift during title screen
        if (isTitleScreenActive) {
            camTargetTheta += delta * 0.035;
        }

        // Smooth Camera Spherical Interpolation
        camRadius += (camTargetRadius - camRadius) * 0.1;
        camTheta += (camTargetTheta - camTheta) * 0.1;
        camPhi += (camTargetPhi - camPhi) * 0.1;

        camera.position.x = camRadius * Math.sin(camPhi) * Math.sin(camTheta);
        camera.position.y = camRadius * Math.cos(camPhi);
        camera.position.z = camRadius * Math.sin(camPhi) * Math.cos(camTheta);
        camera.lookAt(camLookAt);

        // Subtle Dust Floating
        if (floatingDust && floatingDust.geometry) {
            const posAttr = floatingDust.geometry.attributes.position;
            const arr = posAttr.array;
            for (let i = 1; i < arr.length; i += 3) {
                arr[i] += delta * 0.30;
                if (arr[i] > 12) arr[i] = 0;
            }
            posAttr.needsUpdate = true;
        }

        // Pulsing Selection Ring
        if (selectedRingMesh && selectedRingMesh.visible) {
            const scale = 1.0 + Math.sin(now * 0.005) * 0.04;
            selectedRingMesh.scale.set(scale, scale, scale);
        }

        // Pulsing Check Ring
        if (checkRingMesh && checkRingMesh.visible) {
            const scale = 1.0 + Math.sin(now * 0.008) * 0.08;
            checkRingMesh.scale.set(scale, scale, scale);
        }

        renderer.render(scene, camera);
    }

    /********************************************************************
     * 20. KEYBOARD SHORTCUTS & INITIAL BOOTSTRAP
     ********************************************************************/
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (pendingPromotionMove) {
            if (key === 'q') commitPromotion('q');
            else if (key === 'r') commitPromotion('r');
            else if (key === 'b') commitPromotion('b');
            else if (key === 'n') commitPromotion('n');
            else if (key === 'escape') cancelPromotion();
            return;
        }

        if (key === 'z' && (e.ctrlKey || e.metaKey)) {
            undoLastMove();
        } else if (key === 'f') {
            toggleFlipBoard();
        } else if (key === 'c') {
            cycleCameraView();
        } else if (key === 'h') {
            requestRoyalHint();
        } else if (key === 'escape') {
            closePromotionModal();
            closeGameOverModal();
            closeRestartModal();
            closeMenuConfirmModal();
            closeHistoryDrawer();
            closeDedicationModal();
            closeActionsOverflow();
        }
    });

    window.addEventListener('DOMContentLoaded', () => {
        initThreeScene();
        syncAllPiecesFromBoard();
        animate();
    });

})();
`;
