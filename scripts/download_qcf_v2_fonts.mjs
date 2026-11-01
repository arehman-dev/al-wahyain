import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'fonts', 'qcf_v2');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function downloadPage(page) {
  const filePath = path.join(OUT_DIR, `p${page}.woff2`);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
    return { page, status: 'cached' };
  }

  const url = `https://quran.com/fonts/quran/hafs/v2/woff2/p${page}.woff2`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filePath, buf);
      return { page, status: 'downloaded', size: buf.length };
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

async function main() {
  console.log(`Starting QCF v2 font download for 604 pages...`);
  const concurrency = 16;
  const pages = Array.from({ length: 604 }, (_, i) => i + 1);
  let completed = 0;

  async function worker() {
    while (pages.length > 0) {
      const p = pages.shift();
      if (!p) break;
      try {
        const res = await downloadPage(p);
        completed++;
        if (completed % 50 === 0 || completed === 604) {
          console.log(`Progress: ${completed}/604 pages downloaded`);
        }
      } catch (err) {
        console.error(`Failed page ${p}:`, err.message);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  console.log(`Finished! Total fonts in ${OUT_DIR}: ${fs.readdirSync(OUT_DIR).length}`);
}

main().catch(console.error);
