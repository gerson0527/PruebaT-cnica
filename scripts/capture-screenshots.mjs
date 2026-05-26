/**
 * Genera capturas para la prueba técnica (Playwright).
 * Requiere Node >= 20. La app debe estar en BASE_URL o se inicia ng serve.
 */
import { chromium, devices } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'docs', 'screenshots');
const baseUrl = process.env.SCREENSHOT_BASE_URL || 'http://localhost:4200';
const viewport = devices['iPhone 13'];

const shots = [
  { name: '01-home', path: '/home', setup: 'home' },
  { name: '02-categories', path: '/categories', setup: 'categories' },
  { name: '03-nueva-tarea', path: '/task-detail', setup: 'task-detail' },
  { name: '04-filtros', path: '/home', setup: 'filters' },
];

function waitForServer(url, timeoutMs = 120000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) resolve();
        else if (Date.now() > deadline) reject(new Error(`Servidor no listo: ${url}`));
        else setTimeout(tick, 800);
      });
      req.on('error', () => {
        if (Date.now() > deadline) reject(new Error(`Timeout esperando ${url}`));
        else setTimeout(tick, 800);
      });
    };
    tick();
  });
}

function startDevServer() {
  const isWin = process.platform === 'win32';
  const child = spawn(isWin ? 'npx.cmd' : 'npx', ['ng', 'serve', '--port', '4200'], {
    cwd: root,
    stdio: 'ignore',
    shell: isWin,
    detached: !isWin,
  });
  return child;
}

async function seedDemoData(page) {
  await page.goto(`${baseUrl}/categories`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const fab = page.locator('ion-fab-button').first();
  if (await fab.isVisible().catch(() => false)) {
    await fab.click();
    await page.waitForTimeout(400);
    const alert = page.locator('ion-alert');
    if (await alert.isVisible().catch(() => false)) {
      await alert.locator('input').fill('Trabajo');
      await page.locator('ion-alert button', { hasText: 'Crear' }).click();
      await page.waitForTimeout(800);
    }
  }

  await page.goto(`${baseUrl}/task-detail`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.locator('ion-input input').first().fill('Preparar entrega prueba técnica');
  await page.waitForTimeout(500);
}

async function runSetup(page, setup) {
  if (setup === 'home') return;
  if (setup === 'categories') {
    await page.goto(`${baseUrl}/categories`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    return;
  }
  if (setup === 'task-detail') {
    await page.goto(`${baseUrl}/task-detail`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    return;
  }
  if (setup === 'filters') {
    await page.goto(`${baseUrl}/home`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const filterBtn = page.locator('button[aria-label="Filtros"]');
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(600);
    }
  }
}

async function main() {
  const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
  if (nodeMajor < 20) {
    console.error(`Node ${process.version} no sirve. Usa Node 20+ (nvm use 22).`);
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  let serverChild = null;
  try {
    await waitForServer(baseUrl);
    console.log('Servidor detectado en', baseUrl);
  } catch {
    console.log('Iniciando ng serve en puerto 4200...');
    serverChild = startDevServer();
    await waitForServer(baseUrl);
    console.log('Servidor listo.');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...viewport,
    locale: 'es-ES',
  });
  const page = await context.newPage();

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await seedDemoData(page);

  for (const shot of shots) {
    await runSetup(page, shot.setup);
    await page.waitForTimeout(700);
    const file = path.join(outDir, `${shot.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log('OK', path.relative(root, file));
  }

  await browser.close();
  if (serverChild) {
    try {
      process.kill(-serverChild.pid);
    } catch {
      serverChild.kill();
    }
  }

  console.log('\nCapturas en docs/screenshots/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
