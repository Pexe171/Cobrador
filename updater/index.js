#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const AdmZip = require('adm-zip');

function perguntarDiretorio() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question('Informe a pasta onde o Cobrador está instalado: ', resposta => {
      rl.close();
      resolve(resposta.trim());
    });
  });
}

function copiarRecursivo(origem, destino) {
  fs.readdirSync(origem).forEach(item => {
    if (item === 'dados') return;
    const origemPath = path.join(origem, item);
    const destinoPath = path.join(destino, item);
    const stat = fs.statSync(origemPath);
    if (stat.isDirectory()) {
      fs.mkdirSync(destinoPath, { recursive: true });
      copiarRecursivo(origemPath, destinoPath);
    } else {
      fs.copyFileSync(origemPath, destinoPath);
    }
  });
}

function extrairAtualizacao(destino) {
  const zipPath = path.join(__dirname, 'payload.zip');
  const zip = new AdmZip(zipPath);
  zip.getEntries().forEach(entry => {
    if (entry.entryName.startsWith('dados/')) return;
    const saida = path.join(destino, entry.entryName);
    if (entry.isDirectory) {
      fs.mkdirSync(saida, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(saida), { recursive: true });
      fs.writeFileSync(saida, entry.getData());
    }
  });
}

async function main() {
  const destino = await perguntarDiretorio();
  if (!destino) return;
  if (!fs.existsSync(destino)) {
    console.error('Caminho não encontrado.');
    return;
  }
  const dados = path.join(destino, 'dados');
  if (!fs.existsSync(dados)) {
    console.error('Instalação inválida: pasta "dados" não encontrada.');
    return;
  }

  const backupDir = path.join(destino, 'backup_' + Date.now());
  fs.mkdirSync(backupDir);
  console.log('Criando backup em', backupDir);
  copiarRecursivo(destino, backupDir);

  console.log('Atualizando arquivos...');
  extrairAtualizacao(destino);

  const versao = fs.readFileSync(path.join(destino, 'versao.txt'), 'utf8').trim();
  console.log('Atualização concluída. Versão instalada:', versao);
}

main().catch(err => {
  console.error('Erro ao atualizar:', err);
});
