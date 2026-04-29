const { exec } = require('child_process');

// Executa um ping simples para um host/IP
// Usa -c 3 no Linux/Mac e -n 3 no Windows para limitar a 3 pacotes
const pingHost = ({ host } = {}) => {
  return new Promise((resolve, reject) => {
    if (!host) {
      return reject(new Error('O campo "host" é obrigatório'));
    }

    // Sanitização: permite apenas letras, números, pontos e hifens
    // Isso impede ataques de Command Injection (ex: 8.8.8.8 && rm -rf /)
    const hostRegex = /^[a-zA-Z0-9.-]+$/;
    if (!hostRegex.test(host)) {
      return reject(new Error('Host inválido. Utilize apenas letras, números, pontos ou hifens.'));
    }

    // Detecta o SO para usar a flag correta
    const isWindows = process.platform === 'win32';
    const countFlag = isWindows ? `-n 3` : `-c 3`;
    const command = `ping ${countFlag} ${host}`;

    exec(command, { timeout: 10000 }, (err, stdout, stderr) => {
      if (err) {
        // Ping pode falhar (host inacessível), mas ainda retornamos o output
        return resolve({
          host,
          reachable: false,
          output: stderr || err.message,
        });
      }

      // Extrai a linha de estatísticas do ping (última linha útil)
      const lines = stdout.trim().split('\n');
      const summary = lines[lines.length - 1];

      resolve({
        host,
        reachable: true,
        summary,
        output: stdout.trim(),
      });
    });
  });
};

module.exports = pingHost;
