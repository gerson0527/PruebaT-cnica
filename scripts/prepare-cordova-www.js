/**
 * Angular 20+ outputs to www/browser. Cordova expects assets in www/.
 */
const fs = require('fs');
const path = require('path');

const browserDir = path.join('www', 'browser');
const wwwDir = 'www';

if (!fs.existsSync(browserDir)) {
  console.error('Missing www/browser. Run "ng build" first.');
  process.exit(1);
}

const stagingDir = '.www-cordova-staging';

if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}

fs.cpSync(browserDir, stagingDir, { recursive: true });
fs.rmSync(wwwDir, { recursive: true, force: true });
fs.renameSync(stagingDir, wwwDir);

console.log('Cordova www folder ready at www/index.html');
