const getIp       = require('../tools/getIp');
const getHostname  = require('../tools/getHostname');
const listFiles    = require('../tools/listFiles');
const createFile   = require('../tools/createFile');
const pingHost     = require('../tools/pingHost');

// Registry: mapeia o nome da tool para sua função
// É aqui que uma IA buscaria quais tools estão disponíveis
const registry = {
  get_ip:       getIp,
  get_hostname: getHostname,
  list_files:   listFiles,
  create_file:  createFile,
  ping_host:    pingHost,
};

// Executa a tool solicitada com os argumentos recebidos
const run = async (toolName, args) => {
  const tool = registry[toolName];

  if (!tool) {
    throw new Error(`Tool "${toolName}" não encontrada. Tools disponíveis: ${Object.keys(registry).join(', ')}`);
  }

  return await tool(args);
};

module.exports = { run, registry };
