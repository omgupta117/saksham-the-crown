const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('SAKSHAM: THE CROWN — UNIVERSAL RESPONSIVE MATRIX VERIFICATION');
console.log('================================================================\n');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = 'file:///C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/SAKSHAM_THE_CROWN.html';
const galleryDir = 'C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/responsive_gallery';

if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
}

const matrix = [
    { id: '320x568', desc: 'Compact iPhone SE 1st Gen', w: 320, h: 568, capture: true },
    { id: '360x640', desc: 'Galaxy S5 / Budget Android', w: 360, h: 640, capture: false },
    { id: '360x800', desc: 'Modern Android Standard', w: 360, h: 800, capture: true },
    { id: '375x667', desc: 'iPhone 6/7/8/SE 2022', w: 375, h: 667, capture: false },
    { id: '390x844', desc: 'iPhone 12/13/14 Portrait', w: 390, h: 844, capture: true },
    { id: '393x873', desc: 'Google Pixel 7 Portrait', w: 393, h: 873, capture: false },
    { id: '412x915', desc: 'Galaxy S21/S22 Portrait', w: 412, h: 915, capture: false },
    { id: '440x956', desc: 'Large Flagship (Ultra)', w: 440, h: 956, capture: false },
    { id: '600x960', desc: '7-inch Tablet Portrait', w: 600, h: 960, capture: false },
    { id: '768x1024', desc: 'iPad / Tablet 4:3 Portrait', w: 768, h: 1024, capture: true },
    { id: '820x1180', desc: 'iPad Air Portrait', w: 820, h: 1180, capture: false },
    { id: '1024x768', desc: 'iPad Landscape / Small Laptop', w: 1024, h: 768, capture: true },
    { id: '1280x720', desc: '720p HD Desktop / Laptop', w: 1280, h: 720, capture: true },
    { id: '1440x900', desc: 'MacBook Standard Laptop', w: 1440, h: 900, capture: false },
    { id: '1920x1080', desc: '1080p Full HD Monitor', w: 1920, h: 1080, capture: true },
    // Landscape Phone Viewports
    { id: '844x390', desc: 'iPhone 14 Landscape', w: 844, h: 390, capture: true },
    { id: '800x360', desc: 'Android Landscape', w: 800, h: 360, capture: true }
];

async function runMatrix() {
    const results = [];

    for (const item of matrix) {
        const port = 9350 + Math.floor(Math.random() * 400);
        const chrome = spawn(chromePath, [
            '--headless',
            `--remote-debugging-port=${port}`,
            '--disable-gpu',
            `--window-size=${item.w},${item.h}`,
            '--no-first-run',
            '--no-default-browser-check',
            fileUrl
        ]);

        await new Promise(r => setTimeout(r, 1400));

        try {
            const res = await fetch(`http://127.0.0.1:${port}/json`);
            const tabs = await res.json();
            const tab = tabs.find(t => t.url.includes('SAKSHAM_THE_CROWN'));
            if (!tab || !tab.webSocketDebuggerUrl) {
                console.error(`[FAIL] Could not find debugger for ${item.id}`);
                chrome.kill();
                results.push({ item, passed: false, error: 'Target tab missing' });
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

            const errors = [];

            await new Promise((resolve) => {
                ws.onopen = async () => {
                    await send('Page.enable');
                    await send('Runtime.enable');
                    await send('Console.enable');

                    await send('Emulation.setDeviceMetricsOverride', {
                        width: item.w,
                        height: item.h,
                        deviceScaleFactor: 1,
                        mobile: item.w < 800
                    });

                    await send('Runtime.evaluate', {
                        expression: 'window.dispatchEvent(new Event("resize"))'
                    });

                    await new Promise(r => setTimeout(r, 600));

                    if (item.capture) {
                        const titleShot = await send('Page.captureScreenshot', { format: 'png' });
                        if (titleShot.result?.data) {
                            fs.writeFileSync(path.join(galleryDir, `${item.id}_title.png`), Buffer.from(titleShot.result.data, 'base64'));
                        }
                    }

                    // Start Game
                    await send('Runtime.evaluate', { expression: 'startGameFromMenu()' });
                    await new Promise(r => setTimeout(r, 1000));

                    // Evaluate responsive layout criteria
                    const evalRes = await send('Runtime.evaluate', {
                        expression: `(() => {
                            const topBar = document.getElementById('top-bar');
                            const bottomBar = document.getElementById('bottom-bar');
                            const canvas = document.querySelector('canvas');
                            const titleScreen = document.getElementById('title-screen');

                            const docScrollWidth = document.documentElement.scrollWidth;
                            const docClientWidth = document.documentElement.clientWidth;
                            const hasDocHScroll = docScrollWidth > docClientWidth + 1;

                            const topScrollW = topBar ? topBar.scrollWidth : 0;
                            const topClientW = topBar ? topBar.clientWidth : 0;
                            const hasTopHScroll = topScrollW > topClientW + 2;

                            const bottomScrollW = bottomBar ? bottomBar.scrollWidth : 0;
                            const bottomClientW = bottomBar ? bottomBar.clientWidth : 0;
                            const hasBottomHScroll = bottomScrollW > bottomClientW + 2;

                            return {
                                hasDocHScroll,
                                hasTopHScroll,
                                hasBottomHScroll,
                                topClientW,
                                topScrollW,
                                bottomClientW,
                                bottomScrollW,
                                canvasW: canvas?.width,
                                canvasH: canvas?.height
                            };
                        })()`,
                        returnByValue: true
                    });

                    const metrics = evalRes.result?.result?.value;
                    const passed = !metrics.hasDocHScroll && !metrics.hasTopHScroll && errors.length === 0;

                    if (item.capture) {
                        const boardShot = await send('Page.captureScreenshot', { format: 'png' });
                        if (boardShot.result?.data) {
                            fs.writeFileSync(path.join(galleryDir, `${item.id}_board.png`), Buffer.from(boardShot.result.data, 'base64'));
                        }

                        // Open overflow controls if on mobile
                        if (item.w <= 768) {
                            await send('Runtime.evaluate', { expression: 'openActionsOverflow()' });
                            await new Promise(r => setTimeout(r, 500));
                            const overflowShot = await send('Page.captureScreenshot', { format: 'png' });
                            if (overflowShot.result?.data) {
                                fs.writeFileSync(path.join(galleryDir, `${item.id}_overflow.png`), Buffer.from(overflowShot.result.data, 'base64'));
                            }
                            await send('Runtime.evaluate', { expression: 'closeActionsOverflow()' });
                        }
                    }

                    results.push({ item, passed, metrics, errors });
                    ws.close();
                    chrome.kill();
                    resolve();
                };

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.method === 'Console.messageAdded' && data.params.message.level === 'error') {
                        errors.push(data.params.message.text);
                    }
                    if (data.id && pendingCallbacks.has(data.id)) {
                        pendingCallbacks.get(data.id)(data);
                        pendingCallbacks.delete(data.id);
                    }
                };
            });
        } catch (e) {
            chrome.kill();
            results.push({ item, passed: false, error: e.message });
        }
    }

    console.log('\n================================================================');
    console.log('RESPONSIVE MATRIX RESULTS REPORT:');
    console.log('================================================================');
    let passCount = 0;
    for (const r of results) {
        if (r.passed) {
            console.log(`[PASS] ${r.item.id.padEnd(10)} | ${r.item.desc.padEnd(30)} | TopBar: ${r.metrics?.topClientW}px (scroll: ${r.metrics?.topScrollW}px) | No Overflow`);
            passCount++;
        } else {
            console.error(`[FAIL] ${r.item.id.padEnd(10)} | ${r.item.desc.padEnd(30)} | Error: ${JSON.stringify(r.metrics || r.error)}`);
        }
    }
    console.log(`\nTOTAL MATRIX TESTS: ${results.length} | PASSED: ${passCount} | FAILED: ${results.length - passCount}`);
    console.log('================================================================\n');

    process.exit(results.length === passCount ? 0 : 1);
}

runMatrix();
