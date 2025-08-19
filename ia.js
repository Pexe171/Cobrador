const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const API_KEY = 'AIzaSyBBfP9jDBZzcuFxlf3VkU19uiQfoZn6ofw';

/**
 * Envia a conversa para o Google Gemini e devolve resumo, intenções e sugestão.
 * @param {object} conversation Objeto com cliente e mensagens.
 */
async function analyzeConversation(conversation) {
  const textoConversa = conversation.mensagens
    .map(m => `${m.de}: ${m.texto}`)
    .join('\n');

  const prompt = `Analise a conversa a seguir e responda em JSON com as chaves: resumo, intencoes (array) e sugestao.\nConversa:\n${textoConversa}`;

  const body = {
    contents: [
      { parts: [{ text: prompt }] }
    ]
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  let result;
  try {
    result = JSON.parse(rawText);
  } catch (e) {
    result = { resumo: '', intencoes: [], sugestao: '' };
  }

  await saveAnalysis(conversation, result, prompt);
  return { ...result, log: 'Conversa adicionada ao banco de dados com sucesso.' };
}

async function saveAnalysis(conversation, resultado, prompt) {
  const dir = path.join(__dirname, 'analises');
  await fs.promises.mkdir(dir, { recursive: true });
  const dbPath = path.join(dir, 'analises.db');
  const date = new Date().toISOString();
  const mensagens = JSON.stringify(conversation.mensagens);
  const resultadoStr = JSON.stringify(resultado);

  await new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS conversas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT,
        mensagens TEXT,
        prompt TEXT,
        resultado TEXT
      )`);
      db.run(
        'INSERT INTO conversas (data, mensagens, prompt, resultado) VALUES (?, ?, ?, ?)',
        [date, mensagens, prompt, resultadoStr],
        err => {
          db.close();
          if (err) reject(err); else resolve();
        }
      );
    });
  });
}

module.exports = { analyzeConversation };
