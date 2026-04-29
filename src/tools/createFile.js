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
  const filePath = path.join(process.cwd(), safeName);
  const fileContent = content || '';

  fs.writeFileSync(filePath, fileContent, 'utf8');

  return {
    created: true,
    filename: safeName,
    path: filePath,
    size: Buffer.byteLength(fileContent, 'utf8'),
  };
};

module.exports = createFile;
