# AI_CONTEXT.md — Contexto Arquitetural para IAs

> Este arquivo NÃO é para usuários comuns.
> É destinado a IAs que irão evoluir, modificar ou dar manutenção neste projeto.
> Leia este arquivo antes de qualquer alteração para não quebrar a coerência do projeto.

---

## Visão geral do projeto

MCP Server educacional em Node.js + Express.
Expõe tools via HTTP que uma IA pode chamar remotamente.
O projeto é **propositalmente simples** — não use padrões enterprise aqui.

**Stack:** Node.js, Express.js, módulos nativos (fs, os, path, child_process).
**Sem:** TypeScript, banco de dados, Docker, autenticação, ORM, filas, websocket.

---

## Fluxos internos

### Listagem de ferramentas
```
GET /tools
  → server.js             (define a rota)
  → tools.controller.js   (chama o serviço de listagem)
  → tools.service.js      (retorna tools e descrições do registry)
  → response.js           (formata a resposta)
  → JSON ao cliente
```

### Execução de uma ferramenta
```
POST /tool
  → tools.routes.js       (define a rota)
  → tools.controller.js   (valida o body, trata erros HTTP)
  → tools.service.js      (consulta o registry, chama a tool)
  → tools/<toolName>.js   (executa a lógica real)
  → response.js           (formata a resposta)
  → JSON ao cliente
```

---

## Responsabilidades por arquivo

| Arquivo | Responsabilidade |
|---|---|
| `server.js` | Inicializa Express, registra middleware e rotas, sobe o servidor |
| `routes/tools.routes.js` | Define `POST /tool` e aponta para o controller |
| `controllers/tools.controller.js` | Valida presença do campo `tool`; captura erros e devolve HTTP 400 |
| `services/tools.service.js` | Contém o **registry** (objeto que mapeia nome → função); executa a tool |
| `tools/*.js` | Cada arquivo é uma tool isolada; recebe `args` e retorna dados brutos |
| `utils/response.js` | Exporta `success(result)` e `error(message)` para padronizar JSON |

---

## O Registry e Schemas

```js
// Em tools.service.js
const schemas = {
  create_file: {
    name: 'create_file',
    description: '...',
    parameters: {
      type: 'object',
      properties: { ... },
      required: ['filename']
    }
  },
  // ... outras tools
};
```

**Conceito de Tool Calling:** O endpoint `GET /tools` agora exporta schemas completos no padrão JSON Schema. Isso permite que uma IA entenda não apenas *o que* a ferramenta faz, mas *quais parâmetros* ela deve enviar, tornando a integração muito mais robusta.

---

## Segurança e Sandbox

Para manter o projeto seguro em ambiente acadêmico, aplicamos:

1.  **Sandbox de Arquivos:** A tool `create_file` está restrita à pasta `/files` na raiz do projeto. O uso de `path.basename()` impede que a IA ou o usuário tentem criar arquivos em diretórios protegidos do sistema operacional (ex: `../../etc/passwd`).
2.  **Sanitização de Comandos:** A tool `ping_host` valida o input `host` com uma regex (`/^[a-zA-Z0-9.-]+$/`). Isso impede ataques de **Command Injection**, onde comandos arbitrários poderiam ser executados concatenados ao ping (ex: `8.8.8.8 && rm -rf /`).

---

## Como adicionar uma nova tool

**Passo 1:** Crie o arquivo em `src/tools/nomeDaTool.js`:

```js
// src/tools/minhaNovaFerramenta.js
const minhaFerramenta = async ({ param1, param2 } = {}) => {
  if (!param1) throw new Error('param1 é obrigatório');
  // lógica aqui
  return { resultado: '...' };
};

module.exports = minhaFerramenta;
```

**Passo 2:** Registre em `src/services/tools.service.js`:

```js
const minhaFerramenta = require('../tools/minhaNovaFerramenta');

const registry = {
  // ... tools existentes ...
  minha_ferramenta: minhaFerramenta,
};
```

Pronto. Nenhum outro arquivo precisa ser alterado.

---

## Contrato de uma tool

Toda tool DEVE:
- Ser uma função assíncrona (`async`)
- Receber um único argumento objeto com destructuring: `async ({ param } = {})`
- Lançar `Error` com mensagem clara se args inválidos
- Retornar um objeto JavaScript simples (será serializado como JSON)

Toda tool NÃO DEVE:
- Retornar diretamente `{ success, result }` — isso é responsabilidade do `response.js`
- Fazer `console.log` em produção
- Acessar `req` ou `res` — ela não sabe que existe HTTP

---

## Padrão de resposta da API

**Sucesso:**
```json
{ "success": true, "result": { ... } }
```

**Erro:**
```json
{ "success": false, "error": "mensagem descritiva" }
```

O `response.js` centraliza isso. Sempre use `success()` e `error()` do utilitário — nunca monte o objeto manualmente no controller.

---

## Tratamento de erros

- Tools lançam `Error` com `throw new Error('...')`
- O controller captura com `try/catch` e responde HTTP 400
- Erros não tratados do Express caem no handler padrão (HTTP 500)
- Não há middleware global de erro — mantido simples propositalmente

---

## Convenções de nomenclatura

| Contexto | Padrão | Exemplo |
|---|---|---|
| Arquivos de tools | camelCase | `getIp.js`, `pingHost.js` |
| Nomes no registry | snake_case | `get_ip`, `ping_host` |
| Funções exportadas | camelCase | `const getIp = async () => {}` |
| Parâmetros de args | camelCase | `{ filename, dirPath }` |

---

## Dependências

```json
{
  "express": "^4.18.2"
}
```

Apenas `express`. Todos os outros módulos (`fs`, `os`, `path`, `child_process`) são nativos do Node.js e não precisam ser instalados.

---

## Decisões arquiteturais e por que foram tomadas

| Decisão | Motivo |
|---|---|
| Sem TypeScript | Reduz fricção para iniciantes; projeto é educacional |
| Sem banco de dados | Estado não é necessário para as tools atuais |
| Sem autenticação | Simplicidade; projeto roda em rede local controlada |
| Um único endpoint `POST /tool` | Simula como uma IA chamaria ferramentas via API |
| Registry como objeto JS simples | Didático; evita reflection/decorators/metaprogramming |
| Tools como funções isoladas | Cada tool é testável e compreensível individualmente |
| Sem classes | Funções simples são mais legíveis para quem está aprendendo |

---

## Limitações propositais

Estas limitações são **intencionais** para manter o caráter educacional:

- `create_file` só cria arquivos no `cwd()` do processo (sem path arbitrário)
- `ping_host` usa `exec()` — não é o método mais eficiente, mas é legível
- Sem validação de schema nos `args` (ex: Zod, Joi) — desnecessário neste nível
- Sem logs persistentes — apenas `console.log` no start
- Sem rate limiting — contexto acadêmico, rede local

---

## O que NÃO complexificar

Antes de adicionar qualquer padrão novo, pergunte: *isso torna mais fácil de entender ou mais difícil?*

**Não adicionar:**
- Dependency injection
- Factory pattern para tools
- Event emitters para comunicação interna
- Middleware de validação genérico
- Configuração com múltiplos ambientes (dev/staging/prod)
- Testes automatizados (a menos que seja o objetivo de uma aula)
- Cache de resultados

Se o projeto crescer e precisar de algo assim, crie um **branch separado** ou um **projeto derivado** — não polua o projeto base educacional.

---

## Objetivo didático — o que este projeto ensina

1. **Arquitetura MVC simplificada** — routes → controller → service → model(tools)
2. **Separação de responsabilidades** — cada arquivo tem uma função clara
3. **Registry pattern** — como mapear strings para funções (base do tool_use de IAs)
4. **Integração IA + sistema** — a IA não executa código diretamente; usa HTTP
5. **Módulos nativos do Node** — `os`, `fs`, `child_process` na prática
6. **API REST simples** — um endpoint, JSON in/out, erros padronizados

---

*Contexto gerado para uso por IAs em futuras iterações do projeto.*
*Última atualização: geração inicial.*
