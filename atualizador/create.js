const path = require('path');
const fs = require('fs');
const tar = require('tar');
const { execSync } = require('child_process');

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const outputDir = path.join(__dirname, 'dist');
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const payloadPath = path.join(outputDir, 'payload.tar.gz');
  await tar.c({
    gzip: true,
    file: payloadPath,
    cwd: rootDir,
    filter: p => {
      return !p.startsWith('node_modules') && !p.startsWith('atualizador') && !p.startsWith('dist') && !p.startsWith('.git') && !p.startsWith('dados');
    }
  }, ['.']);

  const payloadBase64 = fs.readFileSync(payloadPath).toString('base64');
  const version = require(path.join(rootDir, 'package.json')).version;
  const template = fs.readFileSync(path.join(__dirname, 'template.js'), 'utf8');
  const finalScript = template
    .replace('__PAYLOAD_BASE64__', payloadBase64)
    .replace('__VERSION__', version);

  const updaterScriptPath = path.join(outputDir, 'updater.js');
  fs.writeFileSync(updaterScriptPath, finalScript);

  execSync(`npx pkg ${updaterScriptPath} --out-dir ${outputDir}`, { stdio: 'inherit' });
  console.log('Atualizador gerado em', outputDir);
}

main().catch(err => {
  console.error('Falha ao gerar atualizador:', err);
  process.exit(1);
});

