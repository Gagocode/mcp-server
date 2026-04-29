const toolsService = require('../services/tools.service');
const { success, error } = require('../utils/response');

// Controller: recebe a requisição HTTP, valida o input e chama o serviço
const executeTool = async (req, res) => {
  const { tool, args } = req.body;

  // Valida se o campo "tool" foi enviado
  if (!tool) {
    return res.status(400).json(error('Campo "tool" é obrigatório'));
  }

  try {
    const result = await toolsService.run(tool, args || {});
    return res.json(success(result));
  } catch (err) {
    return res.status(400).json(error(err.message));
  }
};

// Retorna a lista de todas as ferramentas disponíveis
const listTools = (req, res) => {
  const tools = toolsService.getAvailableTools();
  return res.json(success({ tools }));
};

module.exports = { executeTool, listTools };
