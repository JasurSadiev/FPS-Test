/**
 * electron-build.js
 * 
 * Cross-platform build script for the Electron app.
 * Sets ELECTRON_BUILD=true in process.env BEFORE spawning next build,
 * which guarantees the static export (out/) is always created.
 * Avoids all PowerShell/CMD/cross-env compatibility issues.
 */

const { execSync } = require('child_process');

// Set the flag in the CURRENT process env so child processes inherit it
process.env.ELECTRON_BUILD = 'true';

console.log('🔧 ELECTRON_BUILD =', process.env.ELECTRON_BUILD);
console.log('📦 Running Next.js static export...');

const fs = require('fs');
const path = require('path');

// Temporarily hide the API folder from Next.js so it doesn't fail the static export
const apiDir = path.join(__dirname, '../app/api');
const hiddenApiDir = path.join(__dirname, '../app/_api');

if (fs.existsSync(apiDir)) {
  console.log('🙈 Hiding API directory for static build...');
  fs.renameSync(apiDir, hiddenApiDir);
}

try {
  execSync('next build', {
    stdio: 'inherit',
    env: process.env, // explicitly pass the env with ELECTRON_BUILD=true
  });
  console.log('✅ Next.js build complete, out/ folder created.');
} catch (err) {
  console.error('❌ Next.js build failed:', err.message);
  // Restore API directory if build fails
  if (fs.existsSync(hiddenApiDir)) {
    console.log('🙉 Restoring API directory...');
    fs.renameSync(hiddenApiDir, apiDir);
  }
  process.exit(1);
}

// Restore API directory
if (fs.existsSync(hiddenApiDir)) {
  console.log('🙉 Restoring API directory...');
  fs.renameSync(hiddenApiDir, apiDir);
}

console.log('📦 Running electron-builder...');
try {
  execSync('electron-builder', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('✅ Electron build complete!');
} catch (err) {
  console.error('❌ electron-builder failed:', err.message);
  process.exit(1);
}
