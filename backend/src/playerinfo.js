const playersinfo = {};

function createPlayer(playerId) {
    playersinfo[playerId] = {};
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
    changePos,
    changeName,
    getPlayerInfo,
    playersinfo
}