const { spawn } = require('child_process');
const http = require('http');

console.log('Testing Chrome console errors via CDP...');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = 'file:///C:/Users/omgup/.gemini/antigravity/scratch/saksham-the-crown/SAKSHAM_THE_CROWN.html';

const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    fileUrl
]);

setTimeout(() => {
    http.get('http://127.0.0.1:9222/json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const tabs = JSON.parse(data);
                console.log('Opened tabs in Chrome:', tabs.length);
                const targetTab = tabs.find(t => t.url.includes('SAKSHAM_THE_CROWN'));
                if (targetTab) {
                    console.log('Target tab found:', targetTab.title, targetTab.url);
                } else {
                    console.log('Tabs:', tabs.map(t => t.url));
                }
            } catch (e) {
                console.error('Error parsing tab info:', e.message);
            }
            chrome.kill();
            process.exit(0);
        });
    }).on('error', (err) => {
        console.error('HTTP error connecting to CDP:', err.message);
        chrome.kill();
        process.exit(0);
    });
}, 2000);
