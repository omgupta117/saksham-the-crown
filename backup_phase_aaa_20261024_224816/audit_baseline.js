const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = 'file:///C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/SAKSHAM_THE_CROWN.html';
const outDir = 'C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/audit_baseline';

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const auditTargets = [
    { name: '320x568_compact_phone', w: 320, h: 568 },
    { name: '360x800_standard_android', w: 360, h: 800 },
    { name: '390x844_iphone14_portrait', w: 390, h: 844 },
    { name: '844x390_iphone14_landscape', w: 844, h: 390 },
    { name: '768x1024_ipad_portrait', w: 768, h: 1024 },
    { name: '1280x720_desktop', w: 1280, h: 720 }
];

async function runAudit() {
    console.log('Running responsive audit baseline...');
    for (const target of auditTargets) {
        const port = 9300 + Math.floor(Math.random() * 500);
        console.log(`Auditing ${target.name} (${target.w}x${target.h})...`);

        const chrome = spawn(chromePath, [
            '--headless',
            `--remote-debugging-port=${port}`,
            '--disable-gpu',
            `--window-size=${target.w},${target.h}`,
            '--no-first-run',
            '--no-default-browser-check',
            fileUrl
        ]);

        await new Promise(r => setTimeout(r, 1600));

        try {
            const res = await fetch(`http://127.0.0.1:${port}/json`);
            const tabs = await res.json();
            const tab = tabs.find(t => t.url.includes('SAKSHAM_THE_CROWN'));
            if (!tab || !tab.webSocketDebuggerUrl) {
                console.error(`Tab not found for ${target.name}`);
                chrome.kill();
                continue;
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

            await new Promise((resolve) => {
                ws.onopen = async () => {
                    await send('Page.enable');
                    await send('Runtime.enable');
                    await send('Emulation.setDeviceMetricsOverride', {
                        width: target.w,
                        height: target.h,
                        deviceScaleFactor: 1,
                        mobile: target.w < 800
                    });

                    // Trigger resize in window
                    await send('Runtime.evaluate', {
                        expression: 'window.dispatchEvent(new Event("resize"))'
                    });

                    await new Promise(r => setTimeout(r, 800));

                    // Capture Menu screen
                    const menuShot = await send('Page.captureScreenshot', { format: 'png' });
                    if (menuShot.result?.data) {
                        fs.writeFileSync(path.join(outDir, `${target.name}_menu.png`), Buffer.from(menuShot.result.data, 'base64'));
                    }

                    // Enter Game
                    await send('Runtime.evaluate', { expression: 'startGameFromMenu()' });
                    await new Promise(r => setTimeout(r, 1200));

                    // Capture Board screen
                    const boardShot = await send('Page.captureScreenshot', { format: 'png' });
                    if (boardShot.result?.data) {
                        fs.writeFileSync(path.join(outDir, `${target.name}_board.png`), Buffer.from(boardShot.result.data, 'base64'));
                    }

                    // Check layout metrics
                    const metrics = await send('Runtime.evaluate', {
                        expression: `(() => {
                            const topBar = document.getElementById('top-bar');
                            const bottomBar = document.getElementById('bottom-bar');
                            const canvas = document.querySelector('canvas');
                            return {
                                topBarWidth: topBar?.offsetWidth,
                                topBarHeight: topBar?.offsetHeight,
                                topBarScrollWidth: topBar?.scrollWidth,
                                bottomBarHeight: bottomBar?.offsetHeight,
                                bottomBarScrollWidth: bottomBar?.scrollWidth,
                                canvasWidth: canvas?.width,
                                canvasHeight: canvas?.height,
                                windowInnerWidth: window.innerWidth,
                                windowInnerHeight: window.innerHeight,
                                hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
                            };
                        })()`,
                        returnByValue: true
                    });

                    console.log(`[Metrics ${target.name}]`, JSON.stringify(metrics.result?.result?.value));

                    ws.close();
                    chrome.kill();
                    resolve();
                };

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.id && pendingCallbacks.has(data.id)) {
                        pendingCallbacks.get(data.id)(data);
                        pendingCallbacks.delete(data.id);
                    }
                };
            });
        } catch (e) {
            console.error(`Failed ${target.name}:`, e.message);
            chrome.kill();
        }
    }
    console.log('Responsive audit baseline completed.');
}

runAudit();
