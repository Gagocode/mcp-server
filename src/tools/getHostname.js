const os = require('os');

// Retorna o hostname e o tipo de sistema operacional da máquina
const getHostname = async () => {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
  };
};

module.exports = getHostname;
