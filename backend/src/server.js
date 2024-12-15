const http = require('http');
const config = require('./config');
const { Server } = require('socket.io');
const { handleRoomEvents } = require('./modules/rooms_io');
const { handlePlayerEvents } = require('./modules/playersInfo_io');
const { createPlayer } = require('./modules/playersinfo');
const { updateBullets, detectCollisions, bulletsInfo } = require('./modules/game');

// Create HTTP server
const server = http.createServer();

// Initialize WebSocket server
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

// Start the HTTP server
server.listen(config.port, () => {
    console.log(`WebSocket server running at http://${config.hostname}:${config.port}`);
});


io.on('connection', (socket) => {
    console.log(`A player connected: ${socket.id}`);

    createPlayer(socket.id);

    handleRoomEvents(socket, io);

    handlePlayerEvents(socket, io);

});

// Update bullets

let lastTime = Date.now();

setInterval(() => {
    const now = Date.now();
    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;
    updateBullets(deltaTime);
    detectCollisions(io);
}, 1000 / 60);

// Send updated bullets to clients
setInterval(() => {
    for(const roomId in bulletsInfo) {
        io.to(roomId).emit('updateBullets', bulletsInfo[roomId]);
    }
}, 200);