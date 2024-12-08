const rooms = {}; // Store rooms and their players

function createRoom(roomId) {
    if (!rooms[roomId]) {
        rooms[roomId] = [];
        return true; // Room created successfully
    }
    return false; // Room already exists
}

function joinRoom(roomId, playerId) {
    if (rooms[roomId]) {
        rooms[roomId].push(playerId);
        return true; // Player added to the room
    }
    return false; // Room does not exist
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
    getRoomPlayers,
    rooms,
    getAllRooms // Export the new function
};
