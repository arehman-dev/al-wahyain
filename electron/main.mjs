import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Best Practice #1 & #2:
// - Keep 447MB Corpus DB (quran_study.db) outside app.asar in extraResources
// - Store writable User DB (user_study.db) in OS userData directory (%APPDATA% / ~/.config)
// ============================================================================
const isPackaged = app.isPackaged;
const rootDir = path.join(__dirname, '..');
const resourcesDir = isPackaged ? process.resourcesPath : rootDir;

const corpusDbPath = isPackaged
  ? path.join(resourcesDir, 'data', 'quran_study.db')
  : path.join(rootDir, 'data', 'quran_study.db');

const fontsDir = isPackaged
  ? path.join(resourcesDir, 'fonts')
  : path.join(rootDir, 'public', 'fonts');

const staticDir = path.join(rootDir, 'dist');
const userDataDir = app.getPath('userData');
const userDbPath = path.join(userDataDir, 'user_study.db');
const windowStatePath = path.join(userDataDir, 'window-state.json');

process.env.CORPUS_DB_PATH = corpusDbPath;
process.env.USER_DB_PATH = userDbPath;
process.env.STATIC_DIR = staticDir;
process.env.FONTS_DIR = fontsDir;

function loadWindowState() {
  try {
    if (fs.existsSync(windowStatePath)) {
      return JSON.parse(fs.readFileSync(windowStatePath, 'utf-8'));
    }
  } catch {
    // Ignore corrupted state file
  }
  return { width: 1380, height: 880, isMaximized: false };
}

function saveWindowState(win) {
  if (!win) return;
  try {
    const isMaximized = win.isMaximized();
    const bounds = win.getBounds();
    fs.mkdirSync(userDataDir, { recursive: true });
    fs.writeFileSync(
      windowStatePath,
      JSON.stringify({ ...bounds, isMaximized }, null, 2),
      'utf-8'
    );
  } catch {
    // Ignore write errors
  }
}

let mainWindow = null;
let backendInfo = null;

async function createWindow() {
  // Best Practice #3: Start local SQLite API & asset server on 127.0.0.1
  // Uses port 3001 in dev mode (for Vite proxy compatibility) or ephemeral port 0 in packaged desktop app
  const { startServer } = await import('../server/index.mjs');
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  const targetPort = devUrl ? Number(process.env.PORT || 3001) : 0;

  try {
    backendInfo = await startServer(targetPort, '127.0.0.1');
  } catch (err) {
    // Fallback to ephemeral port if 3001 is already running from `npm run start`
    backendInfo = await startServer(0, '127.0.0.1');
  }

  const winState = loadWindowState();

  mainWindow = new BrowserWindow({
    width: winState.width || 1380,
    height: winState.height || 880,
    x: winState.x,
    y: winState.y,
    minWidth: 960,
    minHeight: 640,
    title: 'الوحيين — Al-Wahyain | قرآنی مطالعہ، صرف و نحو اور تقابلی تفاسیر',
    backgroundColor: '#0f172a',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (winState.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.on('close', () => saveWindowState(mainWindow));

  // Open external links (https://...) in the system default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      if (!backendInfo || !url.startsWith(backendInfo.url)) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
    }
    return { action: 'allow' };
  });

  if (devUrl) {
    await mainWindow.loadURL(devUrl);
  } else {
    await mainWindow.loadURL(backendInfo.url);
  }
}

ipcMain.handle('alwahyain:get-runtime-info', () => ({
  appName: 'Al-Wahyain (الوحيين)',
  version: app.getVersion(),
  isDesktop: true,
  isPackaged,
  corpusDbPath,
  userDbPath,
  apiUrl: backendInfo?.url || null,
  platform: process.platform,
  arch: process.arch
}));

ipcMain.handle('alwahyain:open-external', async (_event, url) => {
  if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
