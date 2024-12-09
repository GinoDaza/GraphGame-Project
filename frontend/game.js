function initializeGame(socket, roomId, playersInfo) {
    const phaserConfig = {
        type: Phaser.AUTO,
        width: 1024,
        height: 768,
        parent: 'game-container',
        backgroundColor: '#000000',
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const game = new Phaser.Game(phaserConfig);

    let player; // The player's square
    let otherPlayers = {}; // Other players' squares
    let cursors; // Input for WASD
    let speed = 200;

    function preload() {
        // No assets to preload since we're just drawing rectangles
    }

    function create() {
        // Add the player's square
        player = this.add.rectangle(400, 300, 50, 50, 0x0000ff); // Blue square for the player

        console.log("playersInfo", playersInfo);

        Object.entries(playersInfo).forEach(([id, info]) => {
            console.log("info", info);
            if(id == socket.id) {
                return;
            }
            const newPlayer = this.add.rectangle(info.x, info.y, 50, 50, 0xff0000);
            otherPlayers[id] = newPlayer;
        });

        // Set up input
        cursors = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Notify server of new player
        socket.emit('newPlayer', { x: player.x, y: player.y });

        // Handle other players joining
        socket.on('playerJoined', (playerData) => {
            if (!otherPlayers[playerData.playerId]) {
                const newPlayer = this.add.rectangle(playerData.x, playerData.y, 50, 50, 0xff0000); // Red square for other players
                otherPlayers[playerData.playerId] = newPlayer;
            }
        });

        // Handle other players' movements
        socket.on('playerMoved', (playerData) => {
            console.log(playerData);
            if (otherPlayers[playerData.playerId]) {
                otherPlayers[playerData.playerId].x = playerData.x;
                otherPlayers[playerData.playerId].y = playerData.y;
            }
        });

        // Handle player disconnections
        socket.on('playerLeft', (playerId) => {
            if (otherPlayers[playerId]) {
                otherPlayers[playerId].destroy(); // Remove the square
                delete otherPlayers[playerId];
            }
        });
    }

    function update(time, delta) {
        let moved = false;

        // Player movement logic
        if (cursors.up.isDown) {
            player.y -= speed * delta / 1000;
            moved = true;
        }
        if (cursors.down.isDown) {
            player.y += speed * delta / 1000;
            moved = true;
        }
        if (cursors.left.isDown) {
            player.x -= speed * delta / 1000;
            moved = true;
        }
        if (cursors.right.isDown) {
            player.x += speed * delta / 1000;
            moved = true;
        }

        // Notify server of movement
        if (moved) {
            socket.emit('playerMove', { x: player.x, y: player.y });
        }
    }
}
