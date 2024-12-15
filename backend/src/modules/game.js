const { getPlayerInfo } = require('./playersinfo');
const { rooms } = require('./rooms')

const bulletsInfo = {};

const worldWidth = 1024;
const worldHeight = 768;

function newBullet(roomId, playerId, bulletId, x, y, xDir, yDir, speed) {
    if(!bulletsInfo[roomId]) {
        bulletsInfo[roomId] = {};
    }
    bulletsInfo[roomId][bulletId] = {playerId, x, y, xDir, yDir, speed};
}

function updateBullets(deltatime) {
    for (const roomId in bulletsInfo) {
        for (const bulletId in bulletsInfo[roomId]) {
            const bullet = bulletsInfo[roomId][bulletId];

            bullet.x += bullet.xDir * bullet.speed * deltatime;
            bullet.y += bullet.yDir * bullet.speed * deltatime;
            
            if (isOutOfBounds(bullet.x, bullet.y)) {
                delete bulletsInfo[roomId][bulletId];
            }
        }
    }
}

const playerSize = 20;
const bulletSize = 20;

function detectCollisions(io) {
    for(const roomId in rooms) {
        for(const playerId of rooms[roomId]) {
            const playerInfo = getPlayerInfo(playerId);

            if(!playerInfo.inGame) {
                continue;
            }

            const playerX = playerInfo.x;
            const playerY = playerInfo.y;

            for(const bulletId in bulletsInfo[roomId]) {

                if(bulletsInfo[roomId][bulletId].playerId === playerId) {
                    continue;
                }

                const bulletX = bulletsInfo[roomId][bulletId].x;
                const bulletY = bulletsInfo[roomId][bulletId].y;

                if (playerX + playerSize > bulletX &&
                    playerX < bulletX + bulletSize &&
                    playerY + playerSize > bulletY &&
                    playerY < bulletY + bulletSize) {
  
                    console.log(`Collision in room ${roomId} between player ${playerId} and ${bulletsInfo[roomId][bulletId].playerId}'s bullet ${bulletId}`);
                    io.to(roomId).emit('bulletHit', {senderId: bulletsInfo[roomId][bulletId].playerId, hitId: playerId, bulletId, bulletX, bulletY});
                    delete bulletsInfo[roomId][bulletId];
                }
            }
        }
    }
}

function isOutOfBounds(x, y) {
    return x < 0 || x > worldWidth || y < 0 || y > worldHeight;
}

module.exports = {
    newBullet,
    updateBullets,
    detectCollisions,
    bulletsInfo
}