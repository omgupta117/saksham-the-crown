const { spawn } = require('child_process');
const http = require('http');

console.log('Starting full browser end-to-end CDP verification...');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = 'file:///C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/SAKSHAM_THE_CROWN.html';

const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9225',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    fileUrl
]);

setTimeout(async () => {
    try {
        const res = await fetch('http://127.0.0.1:9225/json');
        const tabs = await res.json();
        const tab = tabs.find(t => t.url.includes('SAKSHAM_THE_CROWN'));
        if (!tab || !tab.webSocketDebuggerUrl) {
            console.error('Target tab not found or no WS debugger URL');
            chrome.kill();
            process.exit(1);
        }

        console.log('Connecting to WebSocket:', tab.webSocketDebuggerUrl);
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

        const errors = [];

        ws.onopen = async () => {
            console.log('WebSocket connected. Enabling Runtime and Console...');
            await send('Runtime.enable');
            await send('Console.enable');

            await new Promise(r => setTimeout(r, 800));

            // Test 1: Check document.title
            const titleRes = await send('Runtime.evaluate', {
                expression: 'document.title'
            });
            console.log('[Browser QA] document.title:', titleRes.result?.result?.value);

            // Test 2: Check canvas
            const canvasRes = await send('Runtime.evaluate', {
                expression: '(() => { const c = document.querySelector("canvas"); return c ? { w: c.width, h: c.height } : null; })()',
                returnByValue: true
            });
            console.log('[Browser QA] WebGL canvas:', canvasRes.result?.result?.value);

            // Test 3: Start Game
            const playRes = await send('Runtime.evaluate', {
                expression: '(() => { startGameFromMenu(); return document.getElementById("title-screen").classList.contains("hidden"); })()',
                returnByValue: true
            });
            console.log('[Browser QA] Start game called, title hidden:', playRes.result?.result?.value);

            // Test 4: Check piece meshes
            const piecesRes = await send('Runtime.evaluate', {
                expression: 'document.querySelectorAll(".dead-piece-icon").length',
                returnByValue: true
            });
            console.log('[Browser QA] Initial dead pieces:', piecesRes.result?.result?.value);

            // Test 5: Verify global function exists
            const fnRes = await send('Runtime.evaluate', {
                expression: 'typeof window.startGameFromMenu + " " + typeof window.undoLastMove + " " + typeof window.toggleFlipBoard',
                returnByValue: true
            });
            console.log('[Browser QA] UI functions active:', fnRes.result?.result?.value);

            console.log('\nTotal console errors captured:', errors.length);
            if (errors.length > 0) {
                console.error('Errors:', errors);
            }

            ws.close();
            chrome.kill();
            process.exit(errors.length > 0 ? 1 : 0);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.id && pendingCallbacks.has(data.id)) {
                pendingCallbacks.get(data.id)(data);
                pendingCallbacks.delete(data.id);
            }
            if (data.method === 'Runtime.exceptionThrown') {
                console.error('[Browser Exception]', data.params.exceptionDetails);
                errors.push(data.params.exceptionDetails);
            }
        };

    } catch (e) {
        console.error('Test error:', e);
        chrome.kill();
        process.exit(1);
    }
}, 1800);
