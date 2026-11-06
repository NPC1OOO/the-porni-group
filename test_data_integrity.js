import fs from 'fs';
import path from 'path';
import { portfolioItems } from './src/data/portfolio.js';

console.log('=== RUNNING PORTFOLIO DATA INTEGRITY & EDGE CASE TESTS ===');

let failures = 0;
const ids = new Set();

portfolioItems.forEach((item, index) => {
  // Test ID uniqueness
  if (ids.has(item.id)) {
    console.error(`FAIL: Duplicate ID ${item.id} at index ${index}`);
    failures++;
  }
  ids.add(item.id);

  // Test Image existence
  const cleanImgPath = item.image.replace('./', '');
  const absPath = path.resolve(cleanImgPath);
  const publicAbsPath = path.resolve('public', cleanImgPath);
  if (!fs.existsSync(absPath) && !fs.existsSync(publicAbsPath)) {
    console.error(`FAIL: Missing image file ${item.image} for item ${item.id}`);
    failures++;
  }

  // Test Aspect ratio
  if (!['16:9', '3:2', '3:4'].includes(item.aspect)) {
    console.error(`FAIL: Invalid aspect ratio ${item.aspect} for item ${item.id}`);
    failures++;
  }

  // Test Specs completeness
  const requiredSpecs = ['model', 'seed', 'steps', 'cfg', 'sampler', 'resolution', 'c2paHash'];
  requiredSpecs.forEach(spec => {
    if (!item.specs || !item.specs[spec]) {
      console.error(`FAIL: Missing spec '${spec}' in item ${item.id}`);
      failures++;
    }
  });

  // Test Prompts
  if (!item.positivePrompt || item.positivePrompt.length < 20) {
    console.error(`FAIL: Positive prompt too short or missing in item ${item.id}`);
    failures++;
  }
  if (!item.negativePrompt || item.negativePrompt.length < 5) {
    console.error(`FAIL: Negative prompt too short or missing in item ${item.id}`);
    failures++;
  }
});

console.log(`Total Portfolio Items Tested: ${portfolioItems.length}`);
console.log(`Unique IDs Verified: ${ids.size}`);
console.log(`Integrity Failures: ${failures}`);

if (failures > 0) {
  process.exit(1);
} else {
  console.log('>>> DATA INTEGRITY & PROMPT MATRIX TESTS: 100% PASS <<<');
}
