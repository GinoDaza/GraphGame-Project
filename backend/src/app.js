const express = require('express');
const http = require('http');
const config = require('./config');
const menuLogic = require('./menuLogic');
const setupGame = require('./game');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api', menuLogic);

// Start WebSocket server
setupGame(server);

// Start the server
server.listen(config.httpPort, config.hostname, () => {
    console.log(`Server running at http://${config.hostname}:${config.httpPort}/`);
});
