const { getPlayerInfo, changeName, changePos, joinPlayerToGame } = require('./playersinfo');
const { getRoomPlayers } = require('./rooms');
const { newBullet } = require('./game');

function handlePlayerEvents(socket, io) {
    // Handle game join
    socket.on('joinGame', ({ roomId, x, y }, callback) => {
        console.log(`${socket.id} joined game on room ${roomId}`);
        const players = getRoomPlayers(roomId);
        joinPlayerToGame(socket.id);

        const info = {};
        players.forEach((player) => {
            const playerInfo = getPlayerInfo(player);
            info[player] = { name: playerInfo.name, x: playerInfo.x, y: playerInfo.y };
        });

        console.log(info);
        callback(info);

        const name = getPlayerInfo(socket.id).name;
        io.to(roomId).emit('playerJoinedGame', { playerId: socket.id, name: name ? name : 'NoName', x, y });
    });

    // Handle movement
    socket.on('playerMove', ({ roomId, x, y }) => {
        console.log(`Player ${socket.id} moved to x: ${x}, y: ${y} in room ${roomId}`);
        changePos(socket.id, x, y);
        io.to(roomId).emit('playerMoved', { playerId: socket.id, x, y });
    });

    // Handle new bullet
    socket.on('createBullet', ({ roomId, bulletId, x, y, xDir, yDir, speed }) => {
        console.log(`Player ${socket.id} created a bullet at x: ${x}, y: ${y} in room ${roomId}`);
        newBullet(roomId, socket.id, bulletId, x, y, xDir, yDir, speed);
        io.to(roomId).emit('newBullet', { playerId: socket.id, bulletId, x, y, xDir, yDir, speed });
    });

    // Handle messages
    socket.on('sendMessage', ({ roomId, message }) => {
        console.log(`Message in room ${roomId} from ${socket.id}: ${message}`);
        const playerInfo = getPlayerInfo(socket.id);
        socket.to(roomId).emit('newMessage', { playerId: playerInfo.name ? playerInfo.name : 'NoName', message });
        socket.emit('newMessage', { playerId: 'You', message });
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
}

module.exports = { handlePlayerEvents };
