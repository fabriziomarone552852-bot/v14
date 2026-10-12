// frontend/scripts/checkSync.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');

let hasErrors = false;

console.log('🔍 [Verifica Integrità & Sincronizzazione Frontend] Avvio controlli automatici...');

const readJsonSafely = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  // Rimozione Byte Order Mark (BOM) UTF-8 generato da PowerShell/Windows
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return JSON.parse(content.trim());
};

// 1. Controllo Versione (package.json vs changelogData.ts vs public/version.json)
try {
  const pkgPath = path.join(frontendDir, 'package.json');
  const changelogPath = path.join(frontendDir, 'src/data/changelogData.ts');
  const versionJsonPath = path.join(frontendDir, 'public/version.json');
  const mainTsxPath = path.join(frontendDir, 'src/main.tsx');

  const pkg = readJsonSafely(pkgPath);
  const currentVersion = pkg.version;

  // Controllo changelogData.ts
  const changelogContent = fs.readFileSync(changelogPath, 'utf8');
  const versionMatch = changelogContent.match(/version:\s*['"]([^'"]+)['"]/);
  if (!versionMatch) {
    console.error('❌ [ERRORE VERSIONING] Impossibile estrarre la versione da changelogData.ts!');
    hasErrors = true;
  } else if (versionMatch[1] !== currentVersion) {
    console.error(`❌ [ERRORE VERSIONING] Disallineamento versione! package.json è v${currentVersion}, mentre changelogData.ts è v${versionMatch[1]}!`);
    hasErrors = true;
  } else {
    console.log(`✅ [VERSIONING] Allineato: package.json e changelogData.ts concordano su v${currentVersion}`);
  }

  // Controllo public/version.json
  if (fs.existsSync(versionJsonPath)) {
    const vJson = readJsonSafely(versionJsonPath);
    if (vJson.version !== currentVersion) {
      console.warn(`⚠️ [VERSIONING] public/version.json ha v${vJson.version} anziché v${currentVersion}. Aggiornamento automatico in corso...`);
      vJson.version = currentVersion;
      fs.writeFileSync(versionJsonPath, JSON.stringify(vJson, null, 4), 'utf8');
      console.log(`✅ [VERSIONING] public/version.json sincronizzato a v${currentVersion}`);
    }
  }

  // Controllo buster in main.tsx
  if (fs.existsSync(mainTsxPath)) {
    const mainContent = fs.readFileSync(mainTsxPath, 'utf8');
    const busterMatch = mainContent.match(/buster:\s*['"]v([^'"]+)['"]/);
    if (busterMatch && busterMatch[1] !== currentVersion) {
      console.warn(`⚠️ [CACHE BUSTER] main.tsx buster è v${busterMatch[1]} anziché v${currentVersion}. Aggiornamento automatico in corso...`);
      const updatedMain = mainContent.replace(/buster:\s*['"]v[^'"]+['"]/, `buster: 'v${currentVersion}'`);
      fs.writeFileSync(mainTsxPath, updatedMain, 'utf8');
      console.log(`✅ [CACHE BUSTER] main.tsx sincronizzato a v${currentVersion}`);
    }
  }
} catch (err) {
  console.error('❌ [ERRORE VERSIONING]', err);
  hasErrors = true;
}

// 2. Controllo Rotte API Reverse Proxy (vite.config.ts vs nginx.conf)
try {
  const viteConfigPath = path.join(frontendDir, 'vite.config.ts');
  const nginxConfPath = path.join(frontendDir, 'nginx.conf');

  if (fs.existsSync(viteConfigPath) && fs.existsSync(nginxConfPath)) {
    const viteContent = fs.readFileSync(viteConfigPath, 'utf8');
    const nginxContent = fs.readFileSync(nginxConfPath, 'utf8');

    // Estrai tutti i path proxy da vite.config.ts (es. '/interactions': apiProxyConfig)
    const viteProxyMatches = [...viteContent.matchAll(/['"]\/([a-zA-Z0-9_\-]+)['"]:\s*apiProxyConfig/g)];
    const viteRoutes = viteProxyMatches.map((m) => m[1]);

    // Estrai il gruppo regex da nginx.conf (es. location ~ ^/(auth|users|...)(/|$))
    const nginxRegexMatch = nginxContent.match(/location\s*~\s*\^\/\(([^)]+)\)\(\/\|\$\)/);
    if (!nginxRegexMatch) {
      console.error('❌ [ERRORE PROXY] Impossibile estrarre la regex delle location da nginx.conf!');
      hasErrors = true;
    } else {
      const nginxRoutes = nginxRegexMatch[1].split('|').map((r) => r.replace(/\\/g, ''));
      const missingInNginx = viteRoutes.filter((r) => !nginxRoutes.includes(r));

      if (missingInNginx.length > 0) {
        console.error(`❌ [ERRORE PROXY NGINX] Trovate route in vite.config.ts MANCANTI in nginx.conf: ${missingInNginx.join(', ')}`);
        console.error('   👉 Aggiungi queste route a nginx.conf per evitare crash nei container Docker!');
        hasErrors = true;
      } else {
        console.log(`✅ [PROXY NGINX] Tutte le ${viteRoutes.length} route API di vite.config.ts sono presenti nel reverse proxy nginx.conf`);
      }
    }
  }
} catch (err) {
  console.error('❌ [ERRORE PROXY]', err);
  hasErrors = true;
}

if (hasErrors) {
  console.error('\n🛑 [VERIFICA FALLITA] Correggi gli errori sopra prima di procedere con la build o il deploy.\n');
  process.exit(1);
} else {
  console.log('🎉 [VERIFICA COMPLETATA] Tutti i controlli di integrità sono superati con successo.\n');
}
