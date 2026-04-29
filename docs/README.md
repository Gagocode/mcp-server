# MCP Server — Servidor de Ferramentas para IA

> Projeto educacional que demonstra como uma IA pode se conectar a um servidor para executar ações reais em um sistema operacional.

---

## O que é este projeto?

Este projeto simula um **MCP Server** (Model Context Protocol Server) — um servidor HTTP que expõe **ferramentas (tools)** que uma Inteligência Artificial pode chamar remotamente.

A ideia central é simples: a IA não executa comandos no sistema operacional diretamente. Em vez disso, ela envia uma requisição HTTP para este servidor pedindo que uma tool seja executada. O servidor recebe, executa e devolve o resultado.

```
IA  →  POST /tool { "tool": "get_ip" }  →  MCP Server  →  Sistema Operacional
IA  ←  { "success": true, "result": { "ips": [...] } }  ←  MCP Server
```

---

## Objetivo do projeto

- Demonstrar arquitetura **cliente-servidor** aplicada à IA
- Mostrar como ferramentas podem ser **registradas e selecionadas dinamicamente**
- Servir como **base de aprendizado** para projetos maiores
- Ser fácil de entender, modificar e apresentar

---

## Stack utilizada

| Tecnologia | Uso |
|---|---|
| Node.js | Runtime JavaScript |
| Express.js | Framework HTTP |
| fs, os, path | Módulos nativos do Node |
| child_process | Execução de comandos do sistema |

---

## Estrutura de pastas

```
mcp-server/
│
├── src/
│   ├── server.js              ← Ponto de entrada — inicia o servidor
│   ├── routes/
│   │   └── tools.routes.js    ← Define as rotas HTTP
│   ├── controllers/
│   │   └── tools.controller.js ← Valida o input e chama o serviço
│   ├── services/
│   │   └── tools.service.js   ← Registry de tools + lógica de seleção
│   ├── tools/
│   │   ├── getIp.js           ← Tool: retorna o IP da máquina
│   │   ├── getHostname.js     ← Tool: retorna o hostname
│   │   ├── listFiles.js       ← Tool: lista arquivos de um diretório
│   │   ├── createFile.js      ← Tool: cria um arquivo
│   │   └── pingHost.js        ← Tool: faz ping em um host
│   └── utils/
│       └── response.js        ← Padroniza respostas JSON
│
├── docs/
│   ├── README.md              ← Este arquivo
│   └── AI_CONTEXT.md          ← Contexto arquitetural para IAs
│
├── package.json
└── .gitignore
```

---

## Como instalar

**Pré-requisito:** Node.js instalado (versão 18 ou superior recomendada).

```bash
# Clone ou copie o projeto para sua máquina
cd mcp-server

# Instale as dependências
npm install
```

---

## Como executar

```bash
# Modo normal
npm start

# Modo desenvolvimento (reinicia ao salvar arquivos — Node 18+)
npm run dev
```

O servidor irá iniciar na porta **3000** por padrão.

Para usar outra porta:
```bash
PORT=8080 npm start
```

---

## Como verificar que está funcionando

Acesse no navegador ou via curl:

```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{ "status": "ok", "message": "MCP Server rodando" }
```

---

## Como usar — API

Existem dois endpoints principais: um para listar ferramentas e outro para executá-las.

### Listar ferramentas disponíveis

Retorna todas as ferramentas registradas no servidor com suas descrições.

```
GET http://localhost:3000/tools
```

**Resposta:**
```json
{
  "success": true,
  "result": {
    "tools": [
      { "name": "get_ip", "description": "..." },
      { "name": "get_hostname", "description": "..." }
    ]
  }
}
```

### Executar uma ferramenta

```
POST http://localhost:3000/tool
Content-Type: application/json
```

#### Formato da requisição

```json
{
  "tool": "nome_da_tool",
  "args": {
    "parametro": "valor"
  }
}
```

#### Formato da resposta — sucesso

```json
{
  "success": true,
  "result": { ... }
}
```

#### Formato da resposta — erro

```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

---

## Tools disponíveis

### `get_ip`
Retorna os IPs locais da máquina.

**Request:**
```json
{ "tool": "get_ip", "args": {} }
```

**Response:**
```json
{
  "success": true,
  "result": {
    "ips": [
      { "interface": "eth0", "ip": "192.168.1.100" }
    ]
  }
}
```

---

### `get_hostname`
Retorna o hostname, plataforma e arquitetura da máquina.

**Request:**
```json
{ "tool": "get_hostname", "args": {} }
```

**Response:**
```json
{
  "success": true,
  "result": {
    "hostname": "meu-servidor",
    "platform": "linux",
    "arch": "x64"
  }
}
```

---

### `list_files`
Lista arquivos e diretórios de um caminho.

**Request:**
```json
{ "tool": "list_files", "args": { "path": "/home/user" } }
```

Se `path` for omitido, usa o diretório atual do processo.

**Response:**
```json
{
  "success": true,
  "result": {
    "path": "/home/user",
    "total": 3,
    "files": [
      { "name": "documentos", "type": "directory" },
      { "name": "notas.txt", "type": "file" }
    ]
  }
}
```

---

### `create_file`
Cria um arquivo no diretório de trabalho do servidor.

**Request:**
```json
{
  "tool": "create_file",
  "args": {
    "filename": "teste.txt",
    "content": "Olá, MCP!"
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "created": true,
    "filename": "teste.txt",
    "path": "/home/user/mcp-server/teste.txt",
    "size": 9
  }
}
```

---

### `ping_host`
Faz ping em um host ou IP e retorna o resultado.

**Request:**
```json
{ "tool": "ping_host", "args": { "host": "8.8.8.8" } }
```

**Response:**
```json
{
  "success": true,
  "result": {
    "host": "8.8.8.8",
    "reachable": true,
    "summary": "rtt min/avg/max/mdev = 10.1/11.2/12.3/1.1 ms",
    "output": "..."
  }
}
```

---

## Testando com curl

```bash
# get_ip
curl -X POST http://localhost:3000/tool \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_ip", "args": {}}'

# list_files
curl -X POST http://localhost:3000/tool \
  -H "Content-Type: application/json" \
  -d '{"tool": "list_files", "args": {"path": "/tmp"}}'

# create_file
curl -X POST http://localhost:3000/tool \
  -H "Content-Type: application/json" \
  -d '{"tool": "create_file", "args": {"filename": "ola.txt", "content": "Olá mundo!"}}'

# ping_host
curl -X POST http://localhost:3000/tool \
  -H "Content-Type: application/json" \
  -d '{"tool": "ping_host", "args": {"host": "8.8.8.8"}}'
```

---

## Fluxo completo — IA → MCP → Sistema

```
1. IA decide que precisa saber o IP da máquina
2. IA envia: POST /tool { "tool": "get_ip", "args": {} }
3. Express recebe a requisição
4. Route encaminha para o Controller
5. Controller valida o body e chama o Service
6. Service consulta o Registry e encontra a função getIp
7. getIp() usa o módulo "os" para ler as interfaces de rede
8. Resultado sobe de volta: getIp → Service → Controller → Response
9. IA recebe: { "success": true, "result": { "ips": [...] } }
10. IA usa o resultado para continuar sua tarefa
```

---

## Possíveis melhorias futuras

- Adicionar autenticação via API Key
- Implementar log de chamadas (quem chamou qual tool e quando)
- Adicionar suporte a WebSocket para resultados em streaming
- Integrar com modelos de IA locais (Ollama, LM Studio)
- Adicionar novas tools: leitura de CPU/memória, execução de scripts, etc.
- Criar um cliente de exemplo que simula uma IA chamando as tools

---

## Observações de segurança

Este projeto é **educacional**. Para uso em produção, seria necessário:

- Autenticação nas rotas
- Whitelist de caminhos para `list_files` e `create_file`
- Rate limiting
- Sanitização mais robusta de inputs
- HTTPS

---

*Projeto desenvolvido para fins acadêmicos e de demonstração.*
