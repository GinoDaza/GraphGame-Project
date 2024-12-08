const { Server } = require('socket.io');
const { rooms } = require('./rooms'); // Access in-memory rooms

function setupGame(server) {
    const io = new Server(server, {
        cors: {
            origin: '*' // Allow any origin for simplicity (adjust in production)
        }
    });

    io.on('connection', (socket) => {
        console.log('A player connected:', socket.id);

        socket.on('joinRoom', (roomId) => {
            if (rooms[roomId]) {
                socket.join(roomId);
                console.log(`Player ${socket.id} joined room ${roomId}`);
                io.to(roomId).emit('playerJoined', socket.id);
            } else {
                socket.emit('error', 'Room does not exist');
            }
        });

        socket.on('sendFunction', ({ roomId, functionStr }) => {
            console.log(`Function received in room ${roomId}: ${functionStr}`);
            io.to(roomId).emit('receiveFunction', { playerId: socket.id, functionStr });
        });

        socket.on('disconnect', () => {
            console.log('Player disconnected:', socket.id);
        });
    });
}

module.exports = setupGame;
