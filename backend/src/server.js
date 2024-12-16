require('dotenv/config')
const config = require('./config');
const { handleRoomEvents } = require('./modules/rooms_io');
const { handlePlayerEvents } = require('./modules/playersInfo_io');
const { createPlayer } = require('./modules/playersinfo');
const { createObstacle, updateBullets, detectCollisions, bulletsInfo } = require('./modules/game');
const { instrument } = require('@socket.io/admin-ui');

// Initialize WebSocket server
const io = require('socket.io')( config.port, {
    cors: {
        credentials: true,
        origin: ['*', 'https://admin.socket.io']
    }
})

console.log(`WebSocket server running at port ${config.port}`)

// Add Admin UI
instrument(io, { auth: false });

io.on('connection', (socket) => {
    console.log(`A player connected: ${socket.id}`);

    createPlayer(socket.id);

    handleRoomEvents(socket, io);

    handlePlayerEvents(socket, io);

});

// Create obstacles
createObstacle(200, 200, 40, 40);
createObstacle(200, 320, 40, 40);
createObstacle(280, 200, 40, 40);
createObstacle(280, 240, 40, 40);
createObstacle(280, 280, 40, 40);
createObstacle(320, 320, 40, 40);
createObstacle(360, 200, 40, 40);
createObstacle(360, 240, 40, 40);
createObstacle(360, 280, 40, 40);

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
}, 100);