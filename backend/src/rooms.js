// Rooms database with functions

const rooms = {}; // Store rooms and their players

function createRoom(roomId, playerId) {
    if (!rooms[roomId]) {
        rooms[roomId] = [];
        return true;
    }
    return false;
}

function joinRoom(roomId, playerId) {
    if (rooms[roomId]) {
        rooms[roomId].push(playerId);
        return true;
    }
    return false;
}

function leaveRoom(roomId, playerId) {
    if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter(id => id !== playerId);
        if (rooms[roomId].length === 0) {
            delete rooms[roomId]; // Remove the room if it's empty
        }
        return true;
    }
    return false;
}

function getRoomPlayers(roomId) {
    return rooms[roomId] || [];
}

function getAllRooms() {
    return Object.keys(rooms);
}

module.exports = {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomPlayers,
    getAllRooms,
    rooms
};
