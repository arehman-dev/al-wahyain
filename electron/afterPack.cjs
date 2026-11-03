const fs = require('node:fs');
const path = require('node:path');

/**
 * electron-builder afterPack hook for Linux (Ubuntu 24.04+ AppArmor compatibility):
 * Wraps the binary with `--no-sandbox` so running `./release/linux-unpacked/al-wahyain`
 * directly works out-of-the-box without requiring root chown on chrome-sandbox.
 */
exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'linux') return;

  const appOutDir = context.appOutDir;
  const exeName = context.packager.executableName;
  const exePath = path.join(appOutDir, exeName);
  const binPath = path.join(appOutDir, `${exeName}.bin`);

  if (fs.existsSync(exePath) && !fs.existsSync(binPath)) {
    fs.renameSync(exePath, binPath);
    const wrapperScript = `#!/usr/bin/env bash
DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/${exeName}.bin" --no-sandbox "$@"
`;
    fs.writeFileSync(exePath, wrapperScript, { mode: 0o755 });
  }
};
