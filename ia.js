const fs = require('fs');
const path = require('path');

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

  await saveAnalysis(conversation.cliente, result);
  return result;
}

async function saveAnalysis(cliente, resultado) {
  const dir = path.join(__dirname, 'analises');
  await fs.promises.mkdir(dir, { recursive: true });
  const date = new Date().toISOString().split('T')[0];
  const file = path.join(dir, `${cliente}-${date}.json`);
  await fs.promises.writeFile(file, JSON.stringify({ cliente, data: date, resultado }, null, 2));
}

module.exports = { analyzeConversation };
