const { Server } = require('socket.io');
const {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomPlayers,
    getAllRooms,
    rooms
} = require('./rooms');
const { createPlayer, changeName, getPlayerInfo } = require('./playerinfo');

function setupGame(server) {
    const io = new Server(server, {
        cors: {
            origin: '*' // Allow any origin for simplicity (adjust in production)
        }
    });

    io.on('connection', (socket) => {
        console.log(`A player connected: ${socket.id}`);
        createPlayer(socket.id);

        // Handle room creation
        socket.on('createRoom', (roomId, callback) => {
            const success = createRoom(roomId, socket.id);
            if (success) {
                socket.join(roomId);
                console.log(`Room ${roomId} created by ${socket.id}`);
                callback({ success: true, players: [socket.id] });
            } else {
                console.log(`Failed to create room: Room ${roomId} already exists`);
                callback({ success: false, error: 'Room already exists' });
            }
        });

        // Handle joining a room
        socket.on('joinRoom', (roomId, callback) => {
            const success = joinRoom(roomId, socket.id);
            if (success) {
                socket.join(roomId);
                console.log(`Player ${socket.id} joined room ${roomId}`);
                const players = getRoomPlayers(roomId);
                const playersInfo = [];
                players.forEach(player => {
                    const name = getPlayerInfo(player).name;
                    playersInfo.push({playerId: player, name: name ? name : 'NoName'});
                });
                const name = getPlayerInfo(socket.id).name;
                io.to(roomId).emit('playerJoined', { playerId: socket.id, name: name ? name : 'NoName'});
                callback({ success: true, playersInfo }); // Return updated players
            } else {
                console.log(`Failed to join room: Room ${roomId} does not exist or player already in room`);
                callback({ success: false, error: 'Room does not exist or player already in room' });
            }
        });

        // Handle disconnection
        socket.on('disconnecting', () => {
            console.log(`Player disconnecting: ${socket.id}`);

            const roomId = [...socket.rooms].find((room) => room !== socket.id);

            if (roomId) {
                const success = leaveRoom(roomId, socket.id);
                
                if (success) {
                    const name = getPlayerInfo(socket.id).name;
                    io.to(roomId).emit('playerLeft', { playerId: socket.id, name: name ? name : 'NoName' });
                    console.log(`Player ${socket.id} removed from room ${roomId}`);
                    if (!rooms[roomId]) {
                        console.log(`Room ${roomId} has been deleted because it is empty`);
                    }
                } else {
                    console.log(`Failed to remove player ${socket.id} from room ${roomId}`);
                }
            } else {
                console.log(`Player ${socket.id} was not in any room`);
            }
        });

        // Handle retrieving all rooms
        socket.on('getRooms', (callback) => {
            const roomList = getAllRooms();
            console.log(`Rooms requested: ${roomList}`);
            callback(roomList); // Return all rooms
        });

        // Handle getting players in a room
        socket.on('getRoomPlayers', (roomId, callback) => {
            if (rooms[roomId]) {
                const players = getRoomPlayers(roomId);
                const playersInfo = [];
                players.forEach(player => {
                    const name = getPlayerInfo(player).name;
                    playersInfo.push({playerId: player, name: name ? name : 'NoName'});
                });
                console.log(`Players in room ${roomId}:`, playersInfo);
                callback({ success: true, playersInfo });
            } else {
                console.log(`Room ${roomId} does not exist`);
                callback({ success: false, error: 'Room does not exist' });
            }
        });

        socket.on('leaveRoom', (roomId, callback) => {
            const success = leaveRoom(roomId, socket.id);
    
            if (success) {
                socket.leave(roomId); // Remove socket from the room
                console.log(`Player ${socket.id} left room ${roomId}`);
                const name = getPlayerInfo(socket.id).name;
                io.to(roomId).emit('playerLeft', { playerId: socket.id, name: name ? name: 'NoName' }); // Notify others in the room
    
                callback({ success: true });
            } else {
                console.log(`Failed to remove player ${socket.id} from room ${roomId}`);
                callback({ success: false, error: 'Failed to leave room' });
            }
        });

        // Handle game start
        socket.on('startGame', (roomId, callback) => {
            if (rooms[roomId]) {
                console.log(`Game started in room ${roomId}`);
                io.to(roomId).emit('gameStarted', { roomId }); // Notify all players in the room
                callback({ success: true });
            } else {
                callback({ success: false, error: 'Room does not exist' });
            }
        });


        // Handle movement
        socket.on('playerMove', ({ roomId, x, y }) => {
            io.to(roomId).emit('playerMoved', { playerId: socket.id, x, y });
        });

        // Handle messages
        socket.on('sendMessage', ({ roomId, message }) => {
            console.log(`Message in room ${roomId} from ${socket.id}: ${message}`);
            const playerInfo = getPlayerInfo(socket.id);
            socket.to(roomId).emit('newMessage', { playerId: playerInfo.name ? playerInfo.name : 'NoName', message });
            socket.emit('newMessage', {playerId: 'You', message});
        });

        // Handle name change
        socket.on('changeName', ({ name }) => {
            console.log(`${socket.id} changed their name to ${name}`);
            changeName(socket.id, name);
        });

        // Handle get player name
        socket.on('getOwnName', (callback) => {
            console.log(`${socket.id} is trying to get their own name`);
            const name = getPlayerInfo(socket.id).name;
            callback(name);
        });
    });
}

module.exports = setupGame;
