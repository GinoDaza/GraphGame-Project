const { getPlayerInfo } = require('./playersinfo');

function handleRoomEvents(socket, io) {
    
    // Handle create and joining a room
    socket.on('createAndJoinRoom', (roomId, callback) => {
        const existingRoom = io.sockets.adapter.rooms.get(roomId);
        if (existingRoom) {
            console.log(`Room ${roomId} already exists`);
            callback({ success: false, error: 'Room already exists' });
        } else {
            socket.join(roomId);
            console.log(`Room ${roomId} created and joined by ${socket.id}`);
            callback({ success: true, players: [socket.id] });
        }
    });    

    // Handle joining a room
    socket.on('joinRoom', (roomId, callback) => {
        const existingRoom = io.sockets.adapter.rooms.get(roomId);
        if (!existingRoom) {
            console.log(`Failed to join room: Room ${roomId} does not exist`);
            callback({ success: false, error: 'Room does not exist' });
        } else if (existingRoom.has(socket.id)) {
            console.log(`Player ${socket.id} is already in room ${roomId}`);
            callback({ success: false, error: 'Already in room' });
        } else {
            socket.join(roomId);
            console.log(`Player ${socket.id} joined room ${roomId}`);
            
            const players = [...existingRoom];
            const playersInfo = players.map(playerId => {
                const name = getPlayerInfo(playerId)?.name || 'NoName';
                return { playerId, name };
            });
    
            const name = getPlayerInfo(socket.id)?.name || 'NoName';
            io.to(roomId).emit('playerJoinedRoom', { playerId: socket.id, name });
            callback({ success: true, playersInfo });
        }
    });

    // Handle disconnection
    socket.on('disconnecting', () => {
        console.log(`Player disconnecting: ${socket.id}`);
    
        const roomId = [...socket.rooms].find(room => room !== socket.id);
    
        if (roomId) {
            const name = getPlayerInfo(socket.id)?.name || 'NoName';
            io.to(roomId).emit('playerLeft', { playerId: socket.id, name });
            console.log(`Player ${socket.id} removed from room ${roomId}`);
        } else {
            console.log(`Player ${socket.id} was not in any room`);
        }
    });

    // Handle Retrieving All Rooms
    socket.on('getRooms', (callback) => {
        const roomList = Array.from(io.sockets.adapter.rooms.keys())
            .filter(room => !io.sockets.adapter.sids.get(room));
        console.log(`Rooms requested: ${roomList}`);
        callback(roomList);
    });

    // Handle Getting Players in a Room
    socket.on('getRoomPlayers', (roomId, callback) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room) {
            const playersInfo = [...room].map(playerId => {
                const name = getPlayerInfo(playerId)?.name || 'NoName';
                return { playerId, name };
            });
            console.log(`Players in room ${roomId}:`, playersInfo);
            callback({ success: true, playersInfo });
        } else {
            console.log(`Room ${roomId} does not exist`);
            callback({ success: false, error: 'Room does not exist' });
        }
    });
    
    // Handle Leaving a Room
    socket.on('leaveRoom', (roomId, callback) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room && room.has(socket.id)) {
            socket.leave(roomId);
            const name = getPlayerInfo(socket.id)?.name || 'NoName';
            io.to(roomId).emit('playerLeft', { playerId: socket.id, name });
            console.log(`Player ${socket.id} left room ${roomId}`);
            callback({ success: true });
        } else {
            console.log(`Failed to leave room: Room ${roomId} does not exist or player is not in the room`);
            callback({ success: false, error: 'Failed to leave room' });
        }
    });
    
    // Handle Game Start
    socket.on('startGame', (roomId, callback) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room) {
            console.log(`Game started in room ${roomId}`);
            io.to(roomId).emit('gameStarted', { roomId }); // Notifica a todos los jugadores
            callback({ success: true });
        } else {
            console.log(`Failed to start game: Room ${roomId} does not exist`);
            callback({ success: false, error: 'Room does not exist' });
        }
    });
     
}

module.exports = { handleRoomEvents };
