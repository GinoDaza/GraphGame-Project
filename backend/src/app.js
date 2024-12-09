const http = require('http');
const config = require('./config');
const setupGame = require('./server');

const server = http.createServer(); // Crea el servidor HTTP
setupGame(server); // Configura el WebSocket Server con el servidor HTTP

server.listen(config.port, () => {
    console.log(`WebSocket server running at http://${config.hostname}:${config.port}`);
});
