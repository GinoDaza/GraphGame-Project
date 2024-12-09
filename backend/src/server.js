const { Server } = require('socket.io');
const config = require('./config');
const {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomPlayers,
    getAllRooms
} = require('./rooms');

function setupGame(server) {
    const io = new Server(server, {
        cors: {
            origin: '*' // Allow any origin for simplicity (adjust in production)
        }
    });

    io.on('connection', (socket) => {
        console.log(`A player connected: ${socket.id}`);

        // Handle room creation
        socket.on('createRoom', (roomId, callback) => {
            const success = createRoom(roomId, socket.id);
            if (success) {
                socket.join(roomId);
                console.log(`Room ${roomId} created by ${socket.id}`);
                io.to(roomId).emit('playerJoined', { playerId: socket.id });
                callback({ success: true }); // Notify client of successful creation
            } else {
                console.log(`Failed to create room: Room ${roomId} already exists`);
                callback({ success: false, error: 'Room already exists' }); // Notify client of error
            }
        });

        // Handle joining a room
        socket.on('joinRoom', (roomId, callback) => {
            const success = joinRoom(roomId, socket.id);
            if (success) {
                socket.join(roomId);
                console.log(`Player ${socket.id} joined room ${roomId}`);
                io.to(roomId).emit('playerJoined', { playerId: socket.id });
                callback({ success: true }); // Notify client of successful join
            } else {
                console.log(`Failed to join room: Room ${roomId} does not exist or player already in room`);
                callback({ success: false, error: 'Room does not exist or player already in room' });
            }
        });

        // Handle function submission
        socket.on('sendFunction', ({ roomId, functionStr }) => {
            console.log(`Function received in room ${roomId}: ${functionStr}`);
            io.to(roomId).emit('receiveFunction', { playerId: socket.id, functionStr });
        });

        // Handle leaving a room
        socket.on('leaveRoom', (roomId, callback) => {
            const success = leaveRoom(roomId, socket.id);
            if (success) {
                socket.leave(roomId);
                console.log(`Player ${socket.id} left room ${roomId}`);
                io.to(roomId).emit('playerLeft', { playerId: socket.id });
                callback({ success: true }); // Notify client of successful leave
            } else {
                console.log(`Failed to leave room: Room ${roomId} does not exist or player is not in the room`);
                callback({ success: false, error: 'Failed to leave room' });
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Player disconnected: ${socket.id}`);
            // Remove the player from all rooms they were part of
            const roomIds = Array.from(socket.rooms).filter((room) => room !== socket.id);
            roomIds.forEach((roomId) => {
                leaveRoom(roomId, socket.id);
                io.to(roomId).emit('playerLeft', { playerId: socket.id });
                console.log(`Player ${socket.id} removed from room ${roomId}`);
            });
        });

        // Handle request for list of rooms
        socket.on('getRooms', (callback) => {
            const roomsList = getAllRooms(); // Get all rooms from rooms.js
            console.log(`Rooms requested by ${socket.id}:`, roomsList);
            callback(roomsList); // Send the list back to the requesting client
        });
    });
}

module.exports = setupGame;