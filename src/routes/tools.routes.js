const express = require('express');
const router = express.Router();
const toolsController = require('../controllers/tools.controller');

// Endpoint principal: recebe a tool a executar e seus argumentos
// Formato esperado: POST /tool  { "tool": "get_ip", "args": {} }
router.post('/', toolsController.executeTool);

module.exports = router;
