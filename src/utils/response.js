// Padroniza todas as respostas da API em dois formatos: sucesso e erro

const success = (result) => ({
  success: true,
  result,
});

const error = (message) => ({
  success: false,
  error: message,
});

module.exports = { success, error };
