import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🚀 Starting Quran Study App (مطالعہ قرآن اسٹیشن)...');
console.log('👉 Open your browser at: http://localhost:5173\n');

// 1. Start Backend API Server
const apiProcess = spawn('node', ['server/index.mjs'], {
  cwd: rootDir,
  stdio: 'inherit'
});

// 2. Start Vite Dev Server
const viteProcess = spawn('npx', ['vite', '--host'], {
  cwd: rootDir,
  stdio: 'inherit'
});

process.on('SIGINT', () => {
  apiProcess.kill();
  viteProcess.kill();
  process.exit();
});
