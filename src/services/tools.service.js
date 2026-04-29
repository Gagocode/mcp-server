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

// Schemas das tools: define o que a tool faz e quais parâmetros ela aceita
// Esse formato (JSON Schema) é o que as IAs utilizam para entender como chamar ferramentas
const schemas = {
  get_ip: {
    name: 'get_ip',
    description: 'Retorna os IPs locais da máquina.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  get_hostname: {
    name: 'get_hostname',
    description: 'Retorna o hostname, plataforma e arquitetura da máquina.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  list_files: {
    name: 'list_files',
    description: 'Lista arquivos e diretórios de um caminho.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Caminho do diretório a ser listado (opcional, padrão é o diretório atual)'
        }
      },
      required: []
    }
  },
  create_file: {
    name: 'create_file',
    description: 'Cria um arquivo dentro da pasta /files.',
    parameters: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Nome do arquivo a ser criado'
        },
        content: {
          type: 'string',
          description: 'Conteúdo do arquivo'
        }
      },
      required: ['filename']
    }
  },
  ping_host: {
    name: 'ping_host',
    description: 'Faz ping em um host ou IP e retorna o resultado.',
    parameters: {
      type: 'object',
      properties: {
        host: {
          type: 'string',
          description: 'Endereço IP ou hostname para pingar'
        }
      },
      required: ['host']
    }
  }
};

// Retorna a lista de todas as ferramentas disponíveis com seus schemas
const getAvailableTools = () => {
  return Object.keys(registry).map(name => schemas[name]);
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
