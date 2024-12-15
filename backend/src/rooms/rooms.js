// Rooms database with functions

const rooms = {}; // Store rooms and their players

function createRoom(roomId, playerId){
    if(!rooms[roomId] && playerId){
        rooms[roomId] = [playerId];
        return true;
    }
    return false;
}

function joinRoom(roomId, playerId) {
    if (rooms[roomId] && playerId) {
        if (!rooms[roomId].includes(playerId)) {
            rooms[roomId].push(playerId);
        }
        return true;
    }
    return false;
}


function leaveRoom(roomId, playerId){
    if(rooms[roomId] && playerId){
        const index = rooms[roomId].indexOf(playerId);
        if(index !== -1){
            rooms[roomId].splice(index, 1);
        }
        if (rooms[roomId].length === 0) {
            delete rooms[roomId];
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
