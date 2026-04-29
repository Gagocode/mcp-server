const os = require('os');

// Retorna o IP local da máquina
// Percorre as interfaces de rede e ignora loopback (127.0.0.1)
const getIp = async () => {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Pega apenas IPv4 e ignora o loopback
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({ interface: name, ip: iface.address });
      }
    }
  }

  return { ips };
};

module.exports = getIp;
