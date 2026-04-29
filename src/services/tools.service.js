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

// Descrições das tools para o endpoint informativo
const descriptions = {
  get_ip:       'Retorna os IPs locais da máquina.',
  get_hostname: 'Retorna o hostname, plataforma e arquitetura da máquina.',
  list_files:   'Lista arquivos e diretórios de um caminho.',
  create_file:  'Cria um arquivo no diretório de trabalho do servidor.',
  ping_host:    'Faz ping em um host ou IP e retorna o resultado.',
};

// Retorna a lista de todas as ferramentas disponíveis com descrição
const getAvailableTools = () => {
  return Object.keys(registry).map(name => ({
    name,
    description: descriptions[name] || 'Sem descrição disponível'
  }));
};

// Executa a tool solicitada com os argumentos recebidos
const run = async (toolName, args) => {
  const tool = registry[toolName];

  if (!tool) {
    throw new Error(`Tool "${toolName}" não encontrada. Tools disponíveis: ${Object.keys(registry).join(', ')}`);
  }

  return await tool(args);
};

module.exports = { run, registry, getAvailableTools };
