const Server = require('./modules/server');
const config = require('./config');

try {
  const server = new Server(config);
  server.initialize();
} catch (e) {
  console.error(e);
  process.exit(-1);
}
