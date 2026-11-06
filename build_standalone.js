import fs from 'fs';
import path from 'path';

console.log('=== GENERATING STANDALONE SINGLE-FILE FALLBACK ===');

const distPath = path.resolve('dist');
const indexHtmlPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('Error: dist/index.html not found. Run build first.');
  process.exit(1);
}

let html = fs.readFileSync(indexHtmlPath, 'utf8');

// Find and inline CSS
const assetsDir = path.join(distPath, 'assets');
const cssFile = fs.readdirSync(assetsDir).find(f => f.endsWith('.css'));
if (cssFile) {
  const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
  // Replace <link rel="stylesheet" ... href="./assets/...css"> with inline <style>
  html = html.replace(/<link[^>]+rel="stylesheet"[^>]+href="\.\/assets\/[^"]+\.css"[^>]*>/i, `<style>\n${cssContent}\n</style>`);
}

// Find and inline JS
const jsFile = fs.readdirSync(assetsDir).find(f => f.endsWith('.js') && !f.endsWith('.map'));
if (jsFile) {
  const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
  // Replace <script type="module" crossorigin src="./assets/...js"></script> with inline script
  html = html.replace(/<script[^>]+src="\.\/assets\/[^"]+\.js"[^>]*><\/script>/i, `<script>\n${jsContent}\n</script>`);
}

// Save standalone to dist/standalone.html and root standalone.html
fs.writeFileSync(path.join(distPath, 'standalone.html'), html, 'utf8');
fs.writeFileSync(path.resolve('standalone.html'), html, 'utf8');

console.log('Successfully generated dist/standalone.html and standalone.html (frictionless local viewing)');
