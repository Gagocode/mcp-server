const fs = require('fs');
const path = require('path');

// Cria um arquivo no sistema com nome e conteúdo opcionais
// O arquivo é criado no diretório de trabalho atual do processo
const createFile = async ({ filename, content } = {}) => {
  if (!filename) {
    throw new Error('O campo "filename" é obrigatório');
  }

  // Sanitiza o nome — impede path traversal (ex: ../../etc/passwd)
  const safeName = path.basename(filename);
  
  // Define o diretório de sandbox (pasta /files na raiz do projeto)
  const filesDir = path.join(process.cwd(), 'files');
  const filePath = path.join(filesDir, safeName);
  const fileContent = content || '';

  // Cria a pasta /files se ela não existir
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
  }

  fs.writeFileSync(filePath, fileContent, 'utf8');

  return {
    created: true,
    filename: safeName,
    path: filePath,
    size: Buffer.byteLength(fileContent, 'utf8'),
  };
};

module.exports = createFile;
