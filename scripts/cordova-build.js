/**
 * Build Cordova Android con JAVA_HOME, ANDROID_HOME y Gradle (Windows).
 * Uso: node scripts/cordova-build.js android [--release]
 */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const platform = process.argv[2] || 'android';
const isRelease = process.argv.includes('--release');
const gradleTask = isRelease ? 'assembleRelease' : 'assembleDebug';
const GRADLE_VERSION = '8.13';

const javaHomeCandidates = [
  process.env.JAVA_HOME,
  'C:\\Program Files\\Android\\Android Studio\\jbr',
  path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Android', 'Android Studio', 'jbr'),
].filter(Boolean);

const sdkCandidates = [
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
].filter(Boolean);

function findExisting(paths) {
  return paths.find(p => p && fs.existsSync(p));
}

function run(cmd, opts = {}) {
  execSync(cmd, {
    stdio: 'inherit',
    shell: true,
    cwd: projectRoot,
    ...opts,
  });
}

const javaHome = findExisting(javaHomeCandidates);
const androidHome = findExisting(sdkCandidates);

if (!javaHome) {
  console.error('No se encontró Java (JDK). Instala Android Studio o define JAVA_HOME.');
  process.exit(1);
}

if (!androidHome) {
  console.error('No se encontró Android SDK. Instálalo desde Android Studio → SDK Manager.');
  process.exit(1);
}

const androidPlatform = path.join(projectRoot, 'platforms', 'android');
const gradlewBat = path.join(androidPlatform, 'gradlew.bat');
const portableGradleDir = path.join(projectRoot, 'tools', `gradle-${GRADLE_VERSION}`);
const portableGradleBat = path.join(portableGradleDir, 'bin', 'gradle.bat');

function buildEnv(extraPath = []) {
  const pathExtras = [
    path.join(javaHome, 'bin'),
    path.join(androidHome, 'platform-tools'),
    path.join(androidHome, 'cmdline-tools', 'latest', 'bin'),
    ...extraPath,
  ].filter(p => fs.existsSync(p));

  return {
    ...process.env,
    JAVA_HOME: javaHome,
    ANDROID_HOME: androidHome,
    ANDROID_SDK_ROOT: androidHome,
    PATH: [...pathExtras, process.env.PATH].join(path.delimiter),
  };
}

function writeLocalProperties() {
  const propsPath = path.join(androidPlatform, 'local.properties');
  const sdkDir = androidHome.replace(/\\/g, '\\\\');
  fs.writeFileSync(propsPath, `sdk.dir=${sdkDir}\n`, 'utf8');
  console.log('local.properties actualizado');
}

function compareVersionsDesc(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pb[i] || 0) - (pa[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** Ajusta SDK y Build-Tools a lo instalado (cordova prepare resetea este archivo). */
function patchAndroidGradleConfig() {
  const buildToolsDir = path.join(androidHome, 'build-tools');
  if (!fs.existsSync(buildToolsDir)) {
    console.error('Instala Android SDK Build-Tools desde Android Studio → SDK Manager.');
    process.exit(1);
  }

  const buildTools = fs.readdirSync(buildToolsDir)
    .filter(name => fs.statSync(path.join(buildToolsDir, name)).isDirectory())
    .sort(compareVersionsDesc);

  const platformsDir = path.join(androidHome, 'platforms');
  const sdkLevels = fs.existsSync(platformsDir)
    ? fs.readdirSync(platformsDir)
      .filter(name => name.startsWith('android-'))
      .map(name => parseInt(name.replace('android-', ''), 10))
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => b - a)
    : [];

  const configPath = path.join(androidPlatform, 'cdv-gradle-config.json');
  if (!fs.existsSync(configPath)) {
    console.error('Falta cdv-gradle-config.json. Ejecuta: npx cordova prepare android');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const selectedTools = buildTools[0];
  config.MIN_BUILD_TOOLS_VERSION = selectedTools;

  if (sdkLevels.length > 0) {
    const targetSdk = sdkLevels[0];
    config.SDK_VERSION = targetSdk;
    config.COMPILE_SDK_VERSION = targetSdk;
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
  console.log('Build-Tools:', selectedTools, '| compileSdk:', config.SDK_VERSION);
}

function findSystemGradle() {
  const candidates = [
    process.env.GRADLE_HOME ? path.join(process.env.GRADLE_HOME, 'bin', 'gradle.bat') : null,
    'C:\\Gradle\\gradle-8.13\\bin\\gradle.bat',
    'C:\\Program Files\\Gradle\\gradle-8.13\\bin\\gradle.bat',
    portableGradleBat,
  ].filter(Boolean);

  return findExisting(candidates);
}

function ensurePortableGradle(env) {
  if (fs.existsSync(portableGradleBat)) {
    return portableGradleBat;
  }

  const toolsDir = path.join(projectRoot, 'tools');
  const zipPath = path.join(toolsDir, `gradle-${GRADLE_VERSION}-bin.zip`);
  const url = `https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip`;

  console.log(`\nDescargando Gradle ${GRADLE_VERSION} (solo la primera vez)...`);
  fs.mkdirSync(toolsDir, { recursive: true });

  const ps = [
    `$ProgressPreference = 'SilentlyContinue'`,
    `Invoke-WebRequest -Uri '${url}' -OutFile '${zipPath}'`,
    `Expand-Archive -Path '${zipPath}' -DestinationPath '${toolsDir}' -Force`,
    `Remove-Item '${zipPath}'`,
  ].join('; ');

  run(`powershell -NoProfile -Command "${ps}"`, { env });

  if (!fs.existsSync(portableGradleBat)) {
    console.error('No se pudo instalar Gradle portable en tools/');
    process.exit(1);
  }

  return portableGradleBat;
}

function ensureGradlew(env) {
  if (fs.existsSync(gradlewBat)) {
    return;
  }

  console.log('\nCreando Gradle Wrapper en platforms/android...');
  const gradleBin = findSystemGradle() || ensurePortableGradle(env);
  const gradleEnv = buildEnv([path.dirname(gradleBin)]);

  run(`"${gradleBin}" wrapper --gradle-version=${GRADLE_VERSION}`, {
    env: gradleEnv,
    cwd: androidPlatform,
  });

  if (!fs.existsSync(gradlewBat)) {
    console.error('No se generó gradlew.bat. Revisa la instalación de Gradle.');
    process.exit(1);
  }
}

console.log('JAVA_HOME   =', javaHome);
console.log('ANDROID_HOME=', androidHome);
console.log('');

const env = buildEnv();

run('npm run build:cordova', { env });

if (!fs.existsSync(androidPlatform)) {
  console.error('Falta platforms/android. Ejecuta: npx cordova platform add android');
  process.exit(1);
}

writeLocalProperties();
run('npx cordova prepare android', { env });
patchAndroidGradleConfig();
ensureGradlew(env);

console.log(`\nCompilando APK (${gradleTask})...\n`);
run(`"${gradlewBat}" ${gradleTask}`, { env, cwd: androidPlatform });

const apkSubdir = isRelease ? 'release' : 'debug';
const apkDir = path.join(androidPlatform, 'app', 'build', 'outputs', 'apk', apkSubdir);
console.log('\nBuild terminado. APK en:', apkDir);
