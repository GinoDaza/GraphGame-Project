const playersinfo = {};

function createPlayer(playerId) {
    playersinfo[playerId] = {inGame: false};
}

function joinPlayerToGame(playerId) {
    playersinfo[playerId].inGame = true;
}

function changePos(playerId, x, y) {
    playersinfo[playerId].x = x;
    playersinfo[playerId].y = y;
}

function changeName(playerId, name) {
    playersinfo[playerId].name = name;
}

function getPlayerInfo(playerId) {
    return playersinfo[playerId];
}

module.exports = {
    createPlayer,
    joinPlayerToGame,
    changePos,
    changeName,
    getPlayerInfo,
    playersinfo
}