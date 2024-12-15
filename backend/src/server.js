require('dotenv/config')
const config = require('./config');
const { handleRoomEvents } = require('./modules/rooms_io');
const { handlePlayerEvents } = require('./modules/playersInfo_io');
const { createPlayer } = require('./modules/playersinfo');
const { updateBullets, detectCollisions, bulletsInfo } = require('./modules/game');
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