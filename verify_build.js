import fs from 'fs';
import path from 'path';

console.log('=== VERIFYING THE PORNI GROUP PRODUCTION BUILD ===');

const distPath = path.resolve('dist');
const indexHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');

// Find bundled CSS file
const assetsDir = path.join(distPath, 'assets');
const cssFile = fs.readdirSync(assetsDir).find(f => f.endsWith('.css'));
const cssContent = cssFile ? fs.readFileSync(path.join(assetsDir, cssFile), 'utf8') : '';

const checks = [
  { name: 'HTML file non-empty', pass: indexHtml.length > 5000 },
  { name: 'Contains canvas element', pass: indexHtml.includes('neuralCanvas') },
  { name: 'Contains ambient audio toggle', pass: indexHtml.includes('ambientAudioToggle') },
  { name: 'Contains showcase section', pass: indexHtml.includes('showcaseGrid') },
  { name: 'Contains commission form', pass: indexHtml.includes('commissionForm') },
  { name: 'Contains C2PA metadata mentions', pass: indexHtml.includes('C2PA') },
  { name: 'Contains .nojekyll in dist', pass: fs.existsSync(path.join(distPath, '.nojekyll')) },
  { name: 'Contains favicon.svg in dist', pass: fs.existsSync(path.join(distPath, 'favicon.svg')) },
  // Verified Master Prompt Requirements:
  { name: 'Nav links include Showcase, Mediums, Pipeline, Manifesto, Contact', pass: 
    indexHtml.includes('href="#showcase"') &&
    indexHtml.includes('href="#mediums"') &&
    indexHtml.includes('href="#pipeline"') &&
    indexHtml.includes('href="#manifesto"') &&
    indexHtml.includes('href="#contact"')
  },
  { name: 'Status pill text matches "LIVE SYSTEMS // GENERATIVE STUDIO 2026"', pass: indexHtml.includes('LIVE SYSTEMS // GENERATIVE STUDIO 2026') },
  { name: 'Modal sidebar includes Aspect Ratio parameter', pass: indexHtml.includes('modalAspect') && indexHtml.includes('Aspect Ratio') },
  { name: 'Modal contains interactive Web Audio waveform player', pass: indexHtml.includes('modalAudioPanel') && indexHtml.includes('modalWaveformCanvas') },
  { name: 'Dedicated commission confirmation feedback modal present', pass: indexHtml.includes('commissionFeedbackModal') && indexHtml.includes('feedbackReceiptBody') },
  { name: 'Footer contains synthetic media disclaimer', pass: indexHtml.includes('SYNTHETIC MEDIA DISCLAIMER') },
  { name: 'Footer contains exact synthetic copyright notice', pass: indexHtml.includes('© 2026 The Porni Group. All synthetic rights reserved.') },
  { name: 'CSS bundle includes OLED and dark zinc palette variables', pass: 
    cssContent.includes('#08080a') && 
    cssContent.includes('#121216') && 
    cssContent.includes('#18181f') && 
    cssContent.includes('#00f0ff') && 
    cssContent.includes('#ff007f') && 
    cssContent.includes('#dfff00')
  },
  // Seed Round & Pitch Memo Requirements:
  { name: 'Contains £30,000,000 seed round target', pass: indexHtml.includes('£30,000,000') },
  { name: 'Contains 3 founders founding team mention', pass: indexHtml.includes('3 founders') || indexHtml.includes('three founders') || indexHtml.includes('3 Founders') },
  { name: 'Contains boob physics and anatomical research thesis', pass: indexHtml.includes('boob physics') },
  { name: 'Contains interactive soft-body simulation canvas', pass: indexHtml.includes('softBodyCanvas') },
  { name: 'Contains simulation parameter sliders', pass: indexHtml.includes('simStiffness') && indexHtml.includes('simDamping') && indexHtml.includes('simPressure') && indexHtml.includes('simGravity') },
  { name: 'Contains interactive simulation mode toggles', pass: indexHtml.includes('data-mode="wireframe"') && indexHtml.includes('data-mode="dermal"') && indexHtml.includes('data-mode="heatmap"') },
  { name: 'Contains Pitch Memo text in HTML', pass: indexHtml.includes('Adults wanna come, and I wanna drain their wallets') },
  { name: 'Contains anti-corporate Teams satire', pass: indexHtml.includes('Microsoft Teams') },
  { name: 'Contains irresistible promise', pass: indexHtml.includes('wank at a clicks notice ;)') },
  { name: 'Contains Pitch_Memo.md in docs', pass: fs.existsSync(path.join(path.resolve('docs'), 'Pitch_Memo.md')) },
  { name: 'Pitch_Memo.md has valid Obsidian YAML frontmatter and callouts', pass: fs.existsSync(path.join(path.resolve('docs'), 'Pitch_Memo.md')) && fs.readFileSync(path.join(path.resolve('docs'), 'Pitch_Memo.md'), 'utf8').includes('type/pitch-memo') && fs.readFileSync(path.join(path.resolve('docs'), 'Pitch_Memo.md'), 'utf8').includes('> [!NOTE]') }
];

let allPassed = true;
checks.forEach(c => {
  console.log(`[${c.pass ? 'PASS' : 'FAIL'}] ${c.name}`);
  if (!c.pass) allPassed = false;
});

const mediaDir = path.join(distPath, 'assets', 'media');
const mediaFiles = fs.readdirSync(mediaDir);
console.log(`Found ${mediaFiles.length} media assets in dist/assets/media:`);
mediaFiles.forEach(f => console.log(`  - ${f}`));

if (mediaFiles.length < 5) {
  console.error('FAIL: Expected at least 5 media assets');
  allPassed = false;
}

const docsDir = path.resolve('docs');
const docFiles = fs.readdirSync(docsDir);
console.log(`Found ${docFiles.length} Obsidian documentation notes in docs/:`);
docFiles.forEach(f => console.log(`  - ${f}`));

if (docFiles.length < 4) {
  console.error('FAIL: Expected at least 4 Obsidian documentation notes');
  allPassed = false;
}

if (allPassed) {
  console.log('\n>>> ALL SYSTEM AUDITS PASSED SUCCESSFULLY! <<<');
} else {
  console.error('\n>>> SOME AUDITS FAILED! <<<');
  process.exit(1);
}
