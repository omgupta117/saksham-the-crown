const { spawn } = require('child_process');
const fs = require('fs');

console.log('Capturing real browser screenshots via Chrome CDP...');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = 'file:///C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/SAKSHAM_THE_CROWN.html';

const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9228',
    '--disable-gpu',
    '--window-size=1280,800',
    '--no-first-run',
    '--no-default-browser-check',
    fileUrl
]);

setTimeout(async () => {
    try {
        const res = await fetch('http://127.0.0.1:9228/json');
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

            // Wait 1200ms for Three.js render
            await new Promise(r => setTimeout(r, 1200));

            // Capture Screenshot 1: Title Screen
            const shot1 = await send('Page.captureScreenshot', { format: 'png' });
            if (shot1.result && shot1.result.data) {
                const buf1 = Buffer.from(shot1.result.data, 'base64');
                fs.writeFileSync('C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/screenshot_title.png', buf1);
                console.log('Saved screenshot_title.png (', buf1.length, 'bytes)');
            }

            // Click PLAY CHESS to enter the 3D game
            await send('Runtime.evaluate', { expression: 'startGameFromMenu()' });

            // Wait 800ms for camera / board to settle
            await new Promise(r => setTimeout(r, 800));

            // Capture Screenshot 2: In-Game 3D Board & Pieces
            const shot2 = await send('Page.captureScreenshot', { format: 'png' });
            if (shot2.result && shot2.result.data) {
                const buf2 = Buffer.from(shot2.result.data, 'base64');
                fs.writeFileSync('C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/screenshot_board.png', buf2);
                console.log('Saved screenshot_board.png (', buf2.length, 'bytes)');
            }

            ws.close();
            chrome.kill();
            console.log('Screenshots captured successfully!');
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
