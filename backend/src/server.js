const { Server } = require('socket.io');
const config = require('./config');
const {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomPlayers,
    getAllRooms,
    rooms
} = require('./rooms');

function setupGame(server) {
    const io = new Server(server, {
        cors: {
            origin: '*' // Allow any origin for simplicity (adjust in production)
        }
    });

    const playersInfo = {};

    io.on('connection', (socket) => {
        console.log(`A player connected: ${socket.id}`);

        // Handle room creation
        socket.on('createRoom', (roomId, callback) => {
            const success = createRoom(roomId, socket.id);
            if (success) {
                socket.join(roomId);
                console.log(`Room ${roomId} created by ${socket.id}`);
                socket.to(roomId).emit('playerJoined', { playerId: socket.id });
                callback({ success: true }); // Notify client of successful creation
            } else {
                console.log(`Failed to create room: Room ${roomId} already exists`);
                callback({ success: false, error: 'Room already exists' }); // Notify client of error
            }
        });

        // Handle starting the game
        socket.on('startGame', (roomId, callback) => {
            if (rooms[roomId]) {
                console.log(`Game started in room ${roomId} by ${socket.id}`);
                io.to(roomId).emit('gameStarted', { roomId }); // Notify all players in the room
                callback({ success: true });
            } else {
                console.log(`Failed to start game: Room ${roomId} does not exist`);
                callback({ success: false, error: 'Room does not exist' });
            }
        });        

        // Handle joining a room
        socket.on('joinRoom', (roomId, callback) => {
            const success = joinRoom(roomId, socket.id);
            if (success) {
                socket.join(roomId);
        
                if (!socket.data.rooms) {
                    socket.data.rooms = new Set();
                }
                socket.data.rooms.add(roomId);
        
                console.log(`Player ${socket.id} joined room ${roomId}`);
                socket.to(roomId).emit('playerJoined', { playerId: socket.id, x: 400, y: 300 });
        
                playersInfo[socket.id] = { x: 400, y: 300 };
        
                callback({ success: true, playersInfo }); // Notify client of successful join
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
        
                if (socket.data.rooms) {
                    socket.data.rooms.delete(roomId);
                }
        
                console.log(`Player ${socket.id} left room ${roomId}`);
                io.to(roomId).emit('playerLeft', { playerId: socket.id });
        
                if (playersInfo[socket.id]) {
                    delete playersInfo[socket.id];
                    console.log(`Player ${socket.id} removed from playersInfo`);
                }
        
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
            const playerRooms = Object.keys(rooms).filter((roomId) => rooms[roomId].includes(socket.id));
            delete playersInfo[socket.id];
            playerRooms.forEach((roomId) => {
                leaveRoom(roomId, socket.id);
                io.to(roomId).emit('playerLeft', { playerId: socket.id });
                console.log(`Player ${socket.id} removed from room ${roomId}`);
            });
        
            if (socket.data.rooms) {
                socket.data.rooms.forEach(roomId => {
                    const success = leaveRoom(roomId, socket.id);
                    if (success) {
                        io.to(roomId).emit('playerLeft', { playerId: socket.id });
                        console.log(`Player ${socket.id} removed from room ${roomId}`);
                    } else {
                        console.log(`Failed to remove player ${socket.id} from room ${roomId}`);
                    }
                });
            } else {
                console.log(`Player ${socket.id} was not part of any room`);
            }
        
            if (playersInfo[socket.id]) {
                delete playersInfo[socket.id];
                console.log(`Player ${socket.id} removed from playersInfo`);
            }
        });
        

        // Handle request for list of rooms
        socket.on('getRooms', (callback) => {
            const roomsList = getAllRooms(); // Get all rooms from rooms.js
            console.log(`Rooms requested by ${socket.id}:`, roomsList);
            callback(roomsList); // Send the list back to the requesting client
        });

        // Handle movement
        socket.on('playerMove', (playerData) => {
            console.log(`Player moved: ${socket.id} moved to x: ${playerData.x}, y: ${playerData.y}`);
            const roomIds = Array.from(socket.rooms).filter((room) => room !== socket.id);
            const roomId = roomIds[0];
            socket.to(roomId).emit('playerMoved', {playerId: socket.id, x: playerData.x, y: playerData.y});
            playersInfo[socket.id] = {x: playerData.x, y: playerData.y};
        });

        // Handle messages
        socket.on('sendMessage', (messageInfo) => {
            console.log(`Player sent message: ${socket.id} sent ${messageInfo.message}`);
            const roomIds = Array.from(socket.rooms).filter((room) => room !== socket.id);
            const roomId = roomIds[0];
            io.to(roomId).emit('sendMessage', {playerId: socket.id, message: messageInfo.message});
        });
    });
}

module.exports = setupGame;
