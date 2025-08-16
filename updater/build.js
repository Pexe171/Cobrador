const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

async function criarPacote() {
  const raiz = path.resolve(__dirname, '..');
  const destinoZip = path.join(__dirname, 'payload.zip');

  const saida = fs.createWriteStream(destinoZip);
  const arquivo = archiver('zip', { zlib: { level: 9 } });

  arquivo.glob('**/*', {
    cwd: raiz,
    dot: true,
    ignore: [
      'dados/**',
      'updater/**',
      'dist_electron/**',
      'node_modules/**',
      '.git/**'
    ]
  });

  arquivo.pipe(saida);
  arquivo.finalize();

  await new Promise((resolve, reject) => {
    saida.on('close', resolve);
    arquivo.on('error', reject);
  });

  console.log('Pacote criado em', destinoZip);
}

async function gerarExecutavel() {
  try {
    execSync('npx pkg updater/index.js --out-path dist_atualizador', {
      stdio: 'inherit'
    });
    console.log('Executável gerado em dist_atualizador/');
  } catch (erro) {
    console.error('Falha ao gerar executável:', erro.message);
  }
}

async function main() {
  await criarPacote();
  await gerarExecutavel();
}

main();
