const express = require('express');
const toolRoutes = require('./routes/tools.routes');
const toolsController = require('./controllers/tools.controller');

const app = express();
const PORT = process.env.PORT || 8080;
const IP = '192.168.0.52';

// Middleware para parsear JSON no body das requisições
app.use(express.json());

// Rota de healthcheck — útil para saber se o servidor está rodando
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MCP Server rodando' });
});

// Endpoint para listar ferramentas disponíveis
app.get('/tools', toolsController.listTools);

// Todas as rotas de tools ficam sob /tool
app.use('/tool', toolRoutes);

// Inicia o servidor
app.listen(PORT, IP,() => {
  console.log(`\n MCP Server iniciado!`);
  console.log(` Porta: ${PORT}`);
  console.log(` Acesse: http://${IP}:${PORT}/health\n`);
});
