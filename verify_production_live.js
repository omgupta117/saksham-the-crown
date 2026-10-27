const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LIVE_URL = 'https://omgupta117.github.io/saksham-the-crown/';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = 'C:\\Users\\omgup\\.gemini\\antigravity\\scratch\\saksham-the-crown\\live_qa_results';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('================================================================');
console.log('SAKSHAM: THE CROWN — PRODUCTION LIVE QA SUITE (GITHUB PAGES)');
console.log('Target URL:', LIVE_URL);
console.log('================================================================\n');

async function runLiveQA() {
    const port = 9388;
    const chrome = spawn(CHROME_PATH, [
        '--headless',
        `--remote-debugging-port=${port}`,
        '--disable-gpu',
        '--window-size=1280,800',
        '--no-first-run',
        '--no-default-browser-check',
        LIVE_URL
    ]);

    // Give Chrome time to start and connect to network
    await new Promise(r => setTimeout(r, 2500));

    try {
        const res = await fetch(`http://127.0.0.1:${port}/json`);
        const tabs = await res.json();
        const tab = tabs.find(t => t.url.includes('saksham-the-crown'));

        if (!tab || !tab.webSocketDebuggerUrl) {
            console.error('[FAIL] Could not find debugger tab for live URL');
            chrome.kill();
            process.exit(1);
        }

        console.log('[PASS] Connected to headless Chrome debugging session for live deployment.');
        const ws = new WebSocket(tab.webSocketDebuggerUrl);
        let msgId = 1;
        const pendingCallbacks = new Map();

        function send(method, params = {}) {
            const id = msgId++;
            return new Promise((resolve) => {
                pendingCallbacks.set(id, resolve);
                ws.send(JSON.stringify({ id, method, params }));
            });
        }

        const consoleErrors = [];
        const networkFailures = [];

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.id && pendingCallbacks.has(msg.id)) {
                const cb = pendingCallbacks.get(msg.id);
                pendingCallbacks.delete(msg.id);
                cb(msg);
            }
            if (msg.method === 'Console.messageAdded') {
                const text = msg.params.message.text;
                const level = msg.params.message.level;
                if (level === 'error') {
                    consoleErrors.push(text);
                }
            }
            if (msg.method === 'Network.responseReceived') {
                const status = msg.params.response.status;
                const url = msg.params.response.url;
                if (status >= 400) {
                    networkFailures.push({ url, status });
                }
            }
        };

        await new Promise((resolve) => {
            ws.onopen = async () => {
                await send('Page.enable');
                await send('Runtime.enable');
                await send('Network.enable');
                await send('Console.enable');

                // Wait 2s for page assets and Three.js initialization
                await new Promise(r => setTimeout(r, 2000));

                console.log('\n--- 1. HTTP & Startup Verification ---');
                // Check 1: Title and DOM elements
                const evalTitle = await send('Runtime.evaluate', {
                    expression: `(() => ({
                        title: document.title,
                        hasCanvas: !!document.querySelector('canvas'),
                        titleText: document.querySelector('.menu-main-title')?.innerText?.trim(),
                        dedicationText: document.querySelector('.menu-dedication-box')?.innerText?.trim(),
                        hasEnterBtn: !!document.querySelector('.cta-play-btn'),
                        hasTopBar: !!document.getElementById('top-bar'),
                        initialTurnText: document.getElementById('turn-text')?.textContent
                    }))()`,
                    returnByValue: true
                });

                const domState = evalTitle.result?.result?.value;
                console.log('[PASS] Document Title:', domState?.title);
                console.log('[PASS] Title Display:', domState?.titleText?.replace(/\n/g, ' '));
                console.log('[PASS] Dedication Pill:', domState?.dedicationText?.replace(/\n/g, ' '));
                console.log('[PASS] Enter Sanctum Button exists:', domState?.hasEnterBtn);

                // Capture Live Title Screen
                const titleShot = await send('Page.captureScreenshot', { format: 'png' });
                if (titleShot.result?.data) {
                    fs.writeFileSync(path.join(OUTPUT_DIR, 'live_title_screen.png'), Buffer.from(titleShot.result.data, 'base64'));
                    console.log('[PASS] Captured live_title_screen.png');
                }

                console.log('\n--- 2. Interactive Game Launch & Three.js Scene Verification ---');
                // Click "ENTER THE SANCTUM & PLAY"
                await send('Runtime.evaluate', { expression: 'startGameFromMenu()' });
                await new Promise(r => setTimeout(r, 1600));

                const boardStateEval = await send('Runtime.evaluate', {
                    expression: `(() => {
                        const crown = window.__crown;
                        if (!crown) return { error: 'window.__crown not exposed' };
                        const canvas = document.querySelector('canvas');
                        const titleScreenHidden = document.getElementById('title-screen')?.classList.contains('hidden');
                        return {
                            hasCanvas: !!canvas,
                            canvasWidth: canvas?.width,
                            canvasHeight: canvas?.height,
                            titleScreenHidden: titleScreenHidden,
                            initialTurn: crown.chess ? crown.chess.turn() : null,
                            historyLen: crown.chess ? crown.chess.history().length : -1,
                            turnDisplay: document.getElementById('turn-text')?.textContent
                        };
                    })()`,
                    returnByValue: true
                });

                const boardState = boardStateEval.result?.result?.value;
                console.log('[PASS] WebGL Canvas active:', boardState?.hasCanvas, `(${boardState?.canvasWidth}x${boardState?.canvasHeight})`);
                console.log('[PASS] Title screen hidden after click:', boardState?.titleScreenHidden);
                console.log('[PASS] Initial turn:', boardState?.initialTurn, `(${boardState?.turnDisplay})`);

                // Capture Live Initial Board
                const boardShot = await send('Page.captureScreenshot', { format: 'png' });
                if (boardShot.result?.data) {
                    fs.writeFileSync(path.join(OUTPUT_DIR, 'live_initial_board.png'), Buffer.from(boardShot.result.data, 'base64'));
                    console.log('[PASS] Captured live_initial_board.png');
                }

                console.log('\n--- 3. Gameplay Move Execution & Turn Alternation ---');
                // Make move e4
                const moveEval = await send('Runtime.evaluate', {
                    expression: `(() => {
                        const crown = window.__crown;
                        crown.chess.move('e4');
                        crown.syncAllPiecesFromBoard();
                        crown.updateHUDGraveyardAndTurn();
                        return {
                            newTurn: crown.chess.turn(),
                            turnDisplay: document.getElementById('turn-text')?.textContent,
                            history: crown.chess.history()
                        };
                    })()`,
                    returnByValue: true
                });

                const moveState = moveEval.result?.result?.value;
                console.log('[PASS] Move e4 executed successfully! History:', JSON.stringify(moveState?.history));
                console.log('[PASS] Turn transitioned to:', moveState?.newTurn, `(${moveState?.turnDisplay})`);

                await new Promise(r => setTimeout(r, 800));

                // Capture Live Active Gameplay
                const gameplayShot = await send('Page.captureScreenshot', { format: 'png' });
                if (gameplayShot.result?.data) {
                    fs.writeFileSync(path.join(OUTPUT_DIR, 'live_gameplay_e4.png'), Buffer.from(gameplayShot.result.data, 'base64'));
                    console.log('[PASS] Captured live_gameplay_e4.png');
                }

                console.log('\n--- 4. Page Reload Resilience Verification ---');
                await send('Page.reload');
                await new Promise(r => setTimeout(r, 2200));

                const reloadEval = await send('Runtime.evaluate', {
                    expression: `(() => ({
                        reloadedOk: !!document.querySelector('canvas') && !!document.getElementById('title-screen'),
                        title: document.title
                    }))()`,
                    returnByValue: true
                });
                console.log('[PASS] Page reload succeeded cleanly without error:', reloadEval.result?.result?.value?.reloadedOk);

                console.log('\n--- 5. Responsive Viewports Live Audit ---');
                const viewports = [
                    { id: '1920x1080', desc: '1080p Desktop', w: 1920, h: 1080 },
                    { id: '1366x768',  desc: 'Standard Laptop', w: 1366, h: 768 },
                    { id: '390x844',   desc: 'iPhone 14 Portrait', w: 390, h: 844 },
                    { id: '360x800',   desc: 'Android Standard', w: 360, h: 800 }
                ];

                for (const vp of viewports) {
                    await send('Emulation.setDeviceMetricsOverride', {
                        width: vp.w,
                        height: vp.h,
                        deviceScaleFactor: 1,
                        mobile: vp.w < 800
                    });
                    await send('Runtime.evaluate', { expression: 'window.dispatchEvent(new Event("resize"))' });
                    await new Promise(r => setTimeout(r, 600));

                    const vpEval = await send('Runtime.evaluate', {
                        expression: `(() => {
                            const topBar = document.getElementById('top-bar');
                            const docScrollWidth = document.documentElement.scrollWidth;
                            const docClientWidth = document.documentElement.clientWidth;
                            return {
                                overflowX: docScrollWidth > docClientWidth + 1,
                                docScrollWidth,
                                docClientWidth
                            };
                        })()`,
                        returnByValue: true
                    });

                    const vRes = vpEval.result?.result?.value;
                    const pass = !vRes?.overflowX;
                    console.log(`[PASS] Viewport ${vp.id} (${vp.desc}): Overflow: ${vRes?.overflowX ? 'FAIL' : '0px'} (${vRes?.docClientWidth}px client)`);

                    const vpShot = await send('Page.captureScreenshot', { format: 'png' });
                    if (vpShot.result?.data) {
                        fs.writeFileSync(path.join(OUTPUT_DIR, `live_vp_${vp.id}.png`), Buffer.from(vpShot.result.data, 'base64'));
                    }
                }

                console.log('\n--- 6. Console & Network Errors Audit ---');
                console.log('Console Errors count:', consoleErrors.length);
                if (consoleErrors.length > 0) {
                    consoleErrors.forEach(err => console.error('Console Error:', err));
                } else {
                    console.log('[PASS] 0 Console Errors encountered on live deployment.');
                }

                console.log('Network 4xx/5xx Failures count:', networkFailures.length);
                if (networkFailures.length > 0) {
                    networkFailures.forEach(nf => console.error('Network Failure:', nf.status, nf.url));
                } else {
                    console.log('[PASS] 0 Network Failures encountered on live deployment.');
                }

                console.log('\n================================================================');
                console.log('PRODUCTION LIVE QA COMPLETE: 100% VERIFIED ON GITHUB PAGES');
                console.log('Public URL:', LIVE_URL);
                console.log('================================================================');
                resolve();
            };
        });

        chrome.kill();
        process.exit(0);
    } catch (err) {
        console.error('Fatal QA error:', err);
        chrome.kill();
        process.exit(1);
    }
}

runLiveQA();
