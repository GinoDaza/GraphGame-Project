// logic/game.js

export const bullets = [];
export const otherPlayers = {};
export let player, obstacles, graphics, inputs, mouseInput;

// Dash-related variables
export let dash = false;
export let dashTimer = 0;
export let dashDir = { x: 0, y: 0 };
export let dashCooldown = 0;
export let dashUses = 2;
export let dashRegenCooldown = 1.5;

export let moved;

export const mouse = { x: 0, y: 0 };

export function Preload() {
    this.load.image('player', 'src/assets/undertaleheart.png');
    this.load.image('bricks', 'src/assets/minecraftbricks.jpg');
    this.load.image('otherPlayer', 'src/assets/BlueSoul.png');
    this.load.image('bullet', 'src/assets/Diamond_Sword.png');
    this.load.audio('dash', 'src/assets/dash_red_left.wav');
}

export function Create(roomId, socket, focused) {
    mouseInput = this.input.activePointer;
    graphics = this.add.graphics();

    player = this.physics.add.sprite(20, 20, 'player');
    player.setDisplaySize(20, 20);
    player.setCollideWorldBounds(true);

    this.focused = focused;

    // Get other players' info
    socket.emit('joinGame', { roomId, x: 20, y: 20 }, (info) => {
        Object.entries(info).forEach(([id, { name, x, y }]) => {
            if (id === socket.id) return;

            const otherPlayer = this.physics.add.sprite(x, y, 'otherPlayer');
            otherPlayer.setDisplaySize(20, 20);
            otherPlayers[id] = { name, player: otherPlayer };
        });
    });

    // Socket event listeners for game logic
    setupSocketListeners(this, socket, roomId);

    // Obstacles
    obstacles = this.physics.add.staticGroup();
    createObstacles(this);

    this.physics.add.collider(player, obstacles);

    // Inputs
    inputs = setupInputs(this);
}

export function Update(time, delta, roomId, socket) {
    handlePlayerMovement(this, delta, roomId, socket);
}
