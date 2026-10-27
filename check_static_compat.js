const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');

// Check for external scripts/stylesheets
const scriptSrcs = [...content.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
const linkHrefs = [...content.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map(m => m[1]);

console.log('Script srcs:', scriptSrcs);
console.log('Link hrefs:', linkHrefs);

// Check for domain root paths
const rootPaths = [...content.matchAll(/["']\/[a-zA-Z0-9_\-\.\/]+["']/g)]
    .map(m => m[0])
    .filter(p => !p.startsWith('"//') && !p.startsWith("'/") && !p.includes('schema.org') && !p.includes('w3.org'));
console.log('Suspicious domain root paths count:', rootPaths.length);
if (rootPaths.length > 0) {
    console.log('Samples:', rootPaths.slice(0, 10));
}

// Check for localhost or api keys
const localhostMatches = content.match(/localhost|127\.0\.0\.1/gi) || [];
console.log('Localhost references count:', localhostMatches.length);

const apiKeyMatches = content.match(/AIza[0-9A-Za-z-_]{35}|ghp_[0-9A-Za-z]{36}/g) || [];
console.log('API key matches count:', apiKeyMatches.length);
