const { spawn } = require('child_process');
const fs = require('fs');

console.log('Capturing full gallery of real browser screenshots via Chrome CDP...');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = 'file:///C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/SAKSHAM_THE_CROWN.html';

const port = 9235;
const chrome = spawn(chromePath, [
    '--headless',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--window-size=1280,800',
    '--no-first-run',
    '--no-default-browser-check',
    fileUrl
]);

setTimeout(async () => {
    try {
        const res = await fetch(`http://127.0.0.1:${port}/json`);
        const tabs = await res.json();
        const tab = tabs.find(t => t.url.includes('SAKSHAM_THE_CROWN'));
        if (!tab || !tab.webSocketDebuggerUrl) {
            console.error('Target tab not found');
            chrome.kill();
            process.exit(1);
        }

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

        ws.onopen = async () => {
            await send('Page.enable');
            await send('Runtime.enable');

            // Wait 1200ms for Three.js initialization and fonts
            await new Promise(r => setTimeout(r, 1200));

            // Capture 1: Title Screen
            const shot1 = await send('Page.captureScreenshot', { format: 'png' });
            if (shot1.result && shot1.result.data) {
                const buf1 = Buffer.from(shot1.result.data, 'base64');
                fs.writeFileSync('C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/screenshot_title.png', buf1);
                console.log('1. Saved screenshot_title.png (', buf1.length, 'bytes)');
            }

            // Click "ENTER THE SANCTUM & PLAY"
            await send('Runtime.evaluate', { expression: 'startGameFromMenu()' });
            // Wait for cinematic camera swoop
            await new Promise(r => setTimeout(r, 1500));

            // Capture 2: Initial Royal Board & Pieces
            const shot2 = await send('Page.captureScreenshot', { format: 'png' });
            if (shot2.result && shot2.result.data) {
                const buf2 = Buffer.from(shot2.result.data, 'base64');
                fs.writeFileSync('C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/screenshot_board.png', buf2);
                console.log('2. Saved screenshot_board.png (', buf2.length, 'bytes)');
            }

            // Play e4 move and select e7 to show legal move destinations
            await send('Runtime.evaluate', {
                expression: `
                    window.__crown.makeMoveSAN('e4');
                    setTimeout(() => {
                        window.__crown.handleSquareSelect('e7');
                    }, 500);
                `
            });
            await new Promise(r => setTimeout(r, 1000));

            // Capture 3: Active Gameplay with legal destination indicators
            const shot3 = await send('Page.captureScreenshot', { format: 'png' });
            if (shot3.result && shot3.result.data) {
                const buf3 = Buffer.from(shot3.result.data, 'base64');
                fs.writeFileSync('C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/screenshot_gameplay.png', buf3);
                console.log('3. Saved screenshot_gameplay.png (', buf3.length, 'bytes)');
            }

            // Play Scholar's mate moves to show checkmate / victory modal
            await send('Runtime.evaluate', {
                expression: `
                    window.__crown.chess.move('e5');
                    window.__crown.chess.move('Bc4');
                    window.__crown.chess.move('Nc6');
                    window.__crown.chess.move('Qh5');
                    window.__crown.chess.move('Nf6');
                    window.__crown.chess.move('Qxf7#');
                    window.__crown.syncAllPiecesFromBoard();
                    window.__crown.updateHUDGraveyardAndTurn();
                    window.__crown.triggerGameOver('checkmate');
                `
            });
            await new Promise(r => setTimeout(r, 800));

            // Capture 4: Checkmate & Sovereign Victory Screen
            const shot4 = await send('Page.captureScreenshot', { format: 'png' });
            if (shot4.result && shot4.result.data) {
                const buf4 = Buffer.from(shot4.result.data, 'base64');
                fs.writeFileSync('C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/screenshot_victory.png', buf4);
                console.log('4. Saved screenshot_victory.png (', buf4.length, 'bytes)');
            }

            ws.close();
            chrome.kill();
            console.log('All gallery screenshots captured successfully!');
            process.exit(0);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.id && pendingCallbacks.has(data.id)) {
                pendingCallbacks.get(data.id)(data);
                pendingCallbacks.delete(data.id);
            }
        };
    } catch (e) {
        console.error('Error during screenshot capture:', e);
        chrome.kill();
        process.exit(1);
    }
}, 2000);
