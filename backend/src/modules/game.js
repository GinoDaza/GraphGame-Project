const { getPlayerInfo } = require('./playersinfo');
const { v4: uuidv4 } = require('uuid');

const bulletsInfo = {};

const obstaclesInfo = {};

const worldWidth = 900;
const worldHeight = 650;

function createObstacle(x, y, sizeX, sizeY) {
    const uuid = uuidv4();
    obstaclesInfo[uuid] = {x, y, sizeX, sizeY};
}

function newBullet(roomId, playerId, bulletId, x, y, xDir, yDir, speed, funct) {
    if (!bulletsInfo[roomId]) {
        bulletsInfo[roomId] = {};
    }
    bulletsInfo[roomId][bulletId] = { playerId, initialX: x, initialY: y, x, y, initialXDir: xDir, initialYDir: yDir, xDir, yDir, speed, funct };
}

function evaluateFunction(x, funct) {
    const replaced = funct.replace(/\^/g, "**")
    .replace(/sin/g, "Math.sin")
    .replace(/cos/g, "Math.cos")
    .replace(/tan/g, "Math.tan")
    .replace(/sqrt/g, "Math.sqrt")
    .replace(/log/g, "Math.log")
    .replace(/exp/g, "Math.exp");

    const func = new Function("x", `return ${replaced};`);
    return func(x);
}

function updateBullets(deltatime) {
    for (const roomId in bulletsInfo) {
        for (const bulletId in bulletsInfo[roomId]) {
            const bullet = bulletsInfo[roomId][bulletId];

            const angle = Math.atan2(-bullet.initialYDir, bullet.initialXDir);

            const speed = bullet.speed;
            const currentXGlobal = bullet.x - bullet.initialX;
            const currentYGlobal = -(bullet.y - bullet.initialY);

            const currentXLocal = currentXGlobal * Math.cos(angle) + currentYGlobal * Math.sin(angle);

            const dxLocal = 0.01;
            const dyLocal = evaluateFunction(currentXLocal + dxLocal, bullet.funct) - evaluateFunction(currentXLocal, bullet.funct);
            const magnitude = Math.sqrt(dxLocal ** 2 + dyLocal ** 2);
            const unitXLocal = dxLocal / magnitude;
            const unitYLocal = dyLocal / magnitude;

            const unitXGlobal = unitXLocal * Math.cos(angle) - unitYLocal * Math.sin(angle);
            const unitYGlobal = unitXLocal * Math.sin(angle) + unitYLocal * Math.cos(angle);

            // bullet.setVelocityX((unitXGlobal) * speed);
            // bullet.setVelocityY((-unitYGlobal) * speed);

            bullet.x += unitXGlobal * speed * deltatime;
            bullet.y += -unitYGlobal * speed * deltatime;

            // bullet.x += bullet.xDir * bullet.speed * deltatime;
            // bullet.y += bullet.yDir * bullet.speed * deltatime;

            if (isOutOfBounds(bullet.x, bullet.y)) {
                delete bulletsInfo[roomId][bulletId];
            }

            if (collidesWithObstacle(bullet.x, bullet.y)) {
                delete bulletsInfo[roomId][bulletId];
            }
        }
    }
}

const playerSize = 20;
const bulletSize = 20;

function detectCollisions(io) {
    const rooms = io.sockets.adapter.rooms;

    for (const [roomId, room] of rooms.entries()) {
        for (const playerId of room) {
            const playerInfo = getPlayerInfo(playerId);

            if (!playerInfo || !playerInfo.inGame) {
                continue;
            }

            const playerX = playerInfo.x;
            const playerY = playerInfo.y;

            const playerLeft = playerX - playerSize / 2;
            const playerRight = playerX + playerSize / 2;
            const playerTop = playerY - playerSize / 2;
            const playerBottom = playerY + playerSize / 2;

            for (const bulletId in bulletsInfo[roomId]) {
                if (bulletsInfo[roomId][bulletId].playerId === playerId) {
                    continue;
                }

                const bulletX = bulletsInfo[roomId][bulletId].x;
                const bulletY = bulletsInfo[roomId][bulletId].y;

                const bulletLeft = bulletX - bulletSize / 2;
                const bulletRight = bulletX + bulletSize / 2;
                const bulletTop = bulletY - bulletSize / 2;
                const bulletBottom = bulletY + bulletSize / 2;

                if (
                    playerRight > bulletLeft &&
                    playerLeft < bulletRight &&
                    playerBottom > bulletTop &&
                    playerTop < bulletBottom
                ) {
                    console.log(
                        `Collision in room ${roomId} between player ${playerId} and ${bulletsInfo[roomId][bulletId].playerId}'s bullet ${bulletId}`
                    );
                    io.to(roomId).emit('bulletHit', {
                        senderId: bulletsInfo[roomId][bulletId].playerId,
                        hitId: playerId,
                        bulletId,
                        bulletX,
                        bulletY,
                    });
                    delete bulletsInfo[roomId][bulletId];
                }
            }
        }
    }
}

function isOutOfBounds(x, y) {
    return x < 0 || x > worldWidth || y < 0 || y > worldHeight;
}

function collidesWithObstacle(x, y) {
    for (const uuid in obstaclesInfo) {
        const obstacle = obstaclesInfo[uuid];
        const { x: ox, y: oy, sizeX, sizeY } = obstacle;

        const bulletLeft = x - bulletSize / 2;
        const bulletRight = x + bulletSize / 2;
        const bulletTop = y - bulletSize / 2;
        const bulletBottom = y + bulletSize / 2;

        const obstacleLeft = ox - sizeX / 2;
        const obstacleRight = ox + sizeX / 2;
        const obstacleTop = oy - sizeY / 2;
        const obstacleBottom = oy + sizeY / 2;

        if (
            bulletRight > obstacleLeft &&
            bulletLeft < obstacleRight &&
            bulletBottom > obstacleTop &&
            bulletTop < obstacleBottom
        ) {
            return true;
        }
    }

    return false;
}

module.exports = {
    createObstacle,
    newBullet,
    updateBullets,
    detectCollisions,
    bulletsInfo,
};
