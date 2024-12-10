const http = require('http');
const config = require('./config');
const setupGame = require('./server');

const server = http.createServer();
setupGame(server);

server.listen(config.port, () => {
    console.log(`WebSocket server running at http://${config.hostname}:${config.port}`);
});
