const { spawn } = require('child_process');

console.log('Testing mobile viewport (390x844) via CDP...');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = 'file:///C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/SAKSHAM_THE_CROWN.html';

const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9226',
    '--disable-gpu',
    '--window-size=390,844',
    fileUrl
]);

setTimeout(async () => {
    try {
        const res = await fetch('http://127.0.0.1:9226/json');
        const tabs = await res.json();
        const tab = tabs.find(t => t.url.includes('SAKSHAM_THE_CROWN'));
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
            await send('Runtime.enable');
            await send('Emulation.setDeviceMetricsOverride', {
                width: 390,
                height: 844,
                deviceScaleFactor: 2,
                mobile: true
            });

            await new Promise(r => setTimeout(r, 600));

            // Check scrollWidth vs clientWidth to verify NO horizontal scroll overflow!
            const scrollRes = await send('Runtime.evaluate', {
                expression: '(() => { return { bodyScroll: document.body.scrollWidth, clientW: document.documentElement.clientWidth, overflow: document.body.scrollWidth > document.documentElement.clientWidth }; })()',
                returnByValue: true
            });
            console.log('[Mobile QA] Viewport check (390x844):', scrollRes.result?.result?.value);

            // Check if top bar and bottom bar are within screen bounds
            const boundsRes = await send('Runtime.evaluate', {
                expression: '(() => { const top = document.getElementById("top-bar").getBoundingClientRect(); const bot = document.getElementById("bottom-bar").getBoundingClientRect(); return { topW: top.width, botW: bot.width, screenW: window.innerWidth }; })()',
                returnByValue: true
            });
            console.log('[Mobile QA] Element bounds:', boundsRes.result?.result?.value);

            ws.close();
            chrome.kill();
            process.exit(0);
        };
    } catch (e) {
        console.error('Mobile test error:', e);
        chrome.kill();
        process.exit(1);
    }
}, 1800);
