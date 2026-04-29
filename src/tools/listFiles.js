const fs = require('fs');
const path = require('path');

// Lista arquivos e diretórios de um caminho
// Se nenhum path for informado, usa o diretório atual do processo
const listFiles = async ({ path: dirPath } = {}) => {
  const targetPath = dirPath || process.cwd();

  // Verifica se o caminho existe
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Caminho não encontrado: ${targetPath}`);
  }

  const entries = fs.readdirSync(targetPath, { withFileTypes: true });

  const files = entries.map((entry) => ({
    name: entry.name,
    type: entry.isDirectory() ? 'directory' : 'file',
  }));

  return {
    path: targetPath,
    total: files.length,
    files,
  };
};

module.exports = listFiles;
