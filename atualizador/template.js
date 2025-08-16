#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const tar = require('tar');

const PAYLOAD = '__PAYLOAD_BASE64__';
const VERSION = '__VERSION__';

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

async function main() {
  console.log('Atualizador do Cobrador');
  const installPath = await ask('Informe o caminho da instalação antiga: ');
  const binDir = path.join(installPath, 'bin');

  if (!fs.existsSync(installPath)) {
    console.error('Diretório inválido.');
    process.exit(1);
  }

  const backupDir = path.join(installPath, `backup_${Date.now()}`);
  if (fs.existsSync(binDir)) {
    fs.renameSync(binDir, backupDir);
    console.log(`Backup criado em ${backupDir}`);
  }

  fs.mkdirSync(binDir, { recursive: true });

  const payloadBuffer = Buffer.from(PAYLOAD, 'base64');
  const tmpFile = path.join(os.tmpdir(), `payload_${Date.now()}.tar.gz`);
  fs.writeFileSync(tmpFile, payloadBuffer);
  await tar.x({ file: tmpFile, cwd: binDir });
  fs.unlinkSync(tmpFile);

  fs.writeFileSync(path.join(installPath, 'versao.txt'), VERSION);
  console.log('Atualização concluída com sucesso.');
}

main().catch(err => {
  console.error('Falha na atualização:', err);
  process.exit(1);
});

