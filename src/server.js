const express = require('express');
const toolRoutes = require('./routes/tools.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON no body das requisições
app.use(express.json());

// Rota de healthcheck — útil para saber se o servidor está rodando
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MCP Server rodando' });
});

// Todas as rotas de tools ficam sob /tool
app.use('/tool', toolRoutes);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`\n MCP Server iniciado!`);
  console.log(` Porta: ${PORT}`);
  console.log(` Acesse: http://localhost:${PORT}/health\n`);
});
