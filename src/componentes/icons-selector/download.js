#!/usr/bin/env node

/**
 * Script Node.js para baixar o JSON completo de Bootstrap Icons
 * e gerar um arquivo icons.json contendo apenas o array de nomes de ícone.
 *
 * Usage: node fetch-icons.js
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// URL do mapeamento oficial de ícones do Bootstrap Icons
const ICONS_URL = 'https://raw.githubusercontent.com/twbs/icons/main/font/bootstrap-icons.json';
// Arquivo de saída
const OUTPUT_FILE = path.resolve(__dirname, 'icons.json');

async function main() {
  try {
    console.log(`Baixando lista de ícones de ${ICONS_URL}...`);
    const mapping = await fetchJson(ICONS_URL);
    const allIcons = Object.keys(mapping)
    console.log(`Total de ícones encontrados: ${allIcons.length}`);

    console.log(`Gravando em ${OUTPUT_FILE}...`);
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(allIcons, null, 2), 'utf8');
    console.log('Arquivo gerado com sucesso!');
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  }
}

/**
 * Faz download de um recurso JSON via HTTPS e parseia para objeto
 * @param {string} url
 * @returns {Promise<Object>}
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const obj = JSON.parse(data);
          resolve(obj);
        } catch (e) {
          reject(new Error('Falha ao parsear JSON: ' + e.message));
        }
      });
    }).on('error', err => reject(err));
  });
}

// Executa
main();