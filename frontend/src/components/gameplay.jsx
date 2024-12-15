import Phaser, { Scene } from 'phaser'
import { useEffect, useRef } from 'preact/hooks';
import socket from '../app/socket';

// Si se cambia esto también hay que cambiarlo en el backend en game.js
const worldWidth = 1024;
const worldHeight = 768;

function Gameplay({ focused, roomId }) {
    const gameContainerRef = useRef(null);
    const phaserRef = useRef(null);

    useEffect(() => {
        console.log(focused);
        if(phaserRef.current) {
            phaserRef.current.scene.scenes[0].focused = focused;
        }
    }, [focused]);

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: worldWidth,
            height: worldHeight,
            parent: gameContainerRef.current,
            scene: {
                preload: Preload,
                create: Create,
                update: Update
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 }, // Sin gravedad
                    debug: true
                }
            }
        };

        phaserRef.current = new Phaser.Game(config);

        const handleMouseMove = (event) => {
            mouse.x = mouseInput.x;
            mouse.y = mouseInput.y;
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            phaserRef.current.destroy(true);
            document.removeEventListener('mousemove', handleMouseMove);

        };
    }, []);

    const otherPlayers = {};

    const bullets = [];

    let obstacles;

    let player;
    let speed = 100;
    let inputs;
    let graphics;

    let mouseInput;

    let dash = false;
    let dashTimer = 0;
    let dashDir = {x: 0, y: 0};
    let dashCooldown = 0;
    let dashUses = 2;
    let dashRegenCooldown = 1.5;

    let moved;

    const mouse = {x: 0, y: 0};

    function createBullet(context, bulletId, x, y, xDir, yDir, speed, enemy, playerId) {
        const newBullet = context.physics.add.sprite(x, y, 'bullet');
        newBullet.body.setSize(80, 80);
        newBullet.setDisplaySize(40, 40);
        newBullet.setVelocityX(xDir * speed);
        newBullet.setVelocityY(yDir * speed);
        newBullet.custom = {};
        newBullet.custom.id = bulletId;
        newBullet.custom.enemy = enemy;
        if(enemy) {
            newBullet.custom.playerId = playerId;
        }
        const rotation = Math.atan2(yDir, xDir) + Phaser.Math.DegToRad(45);
        newBullet.rotation = rotation;

        return newBullet;
    }

    function Preload() {
        this.load.image('player', 'src/assets/undertaleheart.png');
        this.load.image('bricks', 'src/assets/minecraftbricks.jpg');
        this.load.image('otherPlayer', 'src/assets/BlueSoul.png');
        this.load.image('bullet', 'src/assets/Diamond_Sword.png');
        this.load.audio('dash', 'src/assets/dash_red_left.wav');
        this.load.audio('explosion', 'src/assets/deltaruneexplosion.mp3');
        this.load.spritesheet('explosion_gif', 'src/assets/explosion-boom.png', {
            frameWidth: 71,
            frameHeight: 98
        });
        //this.sound.decodeAudio('dash');
    }

    function Create() {
        mouseInput = this.input.activePointer;
        graphics = this.add.graphics();
        player = this.physics.add.sprite(20, 20, 'player');
        player.setDisplaySize(20, 20);
        player.setCollideWorldBounds(true);

        this.focused = focused;

        // Animations
        this.anims.create({
            key: 'play_explosion_gif',
            frames: this.anims.generateFrameNumbers('explosion_gif', { start: 0, end: 17 }),
            frameRate: 10,
            repeat: 0
        });

        // Get other player's info
        socket.emit('joinGame', {roomId, x: 20, y: 20}, (info) => {
            console.log(info);
            Object.entries(info).forEach(([id, {name, x, y}]) => {
                if(id === socket.id) {
                    return;
                }
                const otherPlayer = this.physics.add.sprite(x, y, 'otherPlayer');
                otherPlayer.setDisplaySize(20, 20);
                otherPlayers[id] = {name: name, player: otherPlayer};
            });
        });

        // Handle new player joining
        socket.on('playerJoinedGame', (playerInfo) => {
            if(playerInfo.playerId === socket.id) {
                return;
            }
            const newPlayer = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer');
            newPlayer.setDisplaySize(20, 20);
            otherPlayers[playerInfo.playerId] = {name: playerInfo.name, player: newPlayer};
        });

        // Handle player leaving
        socket.on('playerLeft', (playerInfo) => {
            otherPlayers[playerInfo.playerId].player.destroy();
            delete otherPlayers[playerInfo.playerId];
        });

        // Handle other player's movement
        socket.on('playerMoved', (playerInfo) => {
            if(playerInfo.playerId === socket.id) {
                return;
            }
            otherPlayers[playerInfo.playerId].player.x = playerInfo.x;
            otherPlayers[playerInfo.playerId].player.y = playerInfo.y;
        });

        // Handle other bullets
        socket.on('newBullet', ({playerId, bulletId, x, y, xDir, yDir, speed}) => {
            if(playerId === socket.id) {
                return;
            }
            const newBullet = createBullet(this, bulletId, x, y, xDir, yDir, speed, true, playerId);
            this.physics.add.collider(newBullet, obstacles, () => {
                newBullet.destroy();
                bullets.splice(bullets.findIndex(bullet => bullet.custom.id === newBullet.custom.id), 1);
            });
            bullets.push(newBullet);
        });

        // Handle bullets update
        socket.on('updateBullets', (bulletsInfo) => {
            for(const bulletId in bulletsInfo) {
                let exists = false;
                bullets.forEach((bullet) => {
                    if(bullet.custom.id === bulletId) {
                        exists = true;
                        bullet.x = bulletsInfo[bulletId].x;
                        bullet.y = bulletsInfo[bulletId].y;
                    }
                });
                if(!exists) {
                    const {playerId, x, y, xDir, yDir, speed} = bulletsInfo[bulletId];
                    const newBullet = createBullet(this, bulletId, x, y, xDir, yDir, speed, true, playerId);
                    this.physics.add.collider(newBullet, obstacles, () => {
                        newBullet.destroy();
                        bullets.splice(bullets.findIndex(bullet => bullet.custom.id === newBullet.custom.id), 1);
                    });
                    bullets.push(newBullet);
                }
            }
        });

        // Handle bullet hit
        socket.on('bulletHit', ({senderId, hitId, bulletId, bulletX, bulletY}) => {
            const bulletIndex = bullets.findIndex(bullet => bullet.custom.id === bulletId);
            if (bulletIndex !== -1) {
                bullets[bulletIndex].destroy();
                bullets.splice(bulletIndex, 1);
            }
            console.log(`${senderId} hit ${hitId}`);
            this.sound.play('explosion', {volume: 0.3});
            const gifSprite = this.add.sprite(bulletX, bulletY, 'explosion_gif');
            gifSprite.play('play_explosion_gif');
            gifSprite.on('animationcomplete', () => {
                gifSprite.destroy();
            });
        });

        // Obstacles
        obstacles = this.physics.add.staticGroup();
        obstacles.create(200, 200, 'bricks').setDisplaySize(40, 40).refreshBody();
        obstacles.create(200, 320, 'bricks').setDisplaySize(40, 40).refreshBody();
        obstacles.create(280, 200, 'bricks').setDisplaySize(40, 40).refreshBody();
        obstacles.create(280, 240, 'bricks').setDisplaySize(40, 40).refreshBody();
        obstacles.create(280, 280, 'bricks').setDisplaySize(40, 40).refreshBody();
        obstacles.create(320, 320, 'bricks').setDisplaySize(40, 40).refreshBody();
        obstacles.create(360, 200, 'bricks').setDisplaySize(40, 40).refreshBody();
        obstacles.create(360, 240, 'bricks').setDisplaySize(40, 40).refreshBody();
        obstacles.create(360, 280, 'bricks').setDisplaySize(40, 40).refreshBody();

        this.physics.add.collider(player, obstacles);

        // Inputs
        inputs = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            dash: Phaser.Input.Keyboard.KeyCodes.SHIFT
        }, false);

        inputs.shoot = {};

        this.input.on('pointerdown', () => {
            inputs.shoot.isDown = true;
            inputs.shoot.JustDown = true;
        });

        this.input.on('pointerup', () => {
            inputs.shoot.isDown = false;
            inputs.shoot.JustDown = false;
        });
    }

    function Update(time, delta) {
        if(!this.focused) {
            inputs.up.isDown = false;
            inputs.down.isDown = false;
            inputs.left.isDown = false;
            inputs.right.isDown = false;
            inputs.dash.isDown = false;
            inputs.shoot.isDown = false;
        }

        graphics.clear();
        graphics.lineStyle(2, 0x808080, 0.5); // Restablecer estilo
        const xDiff = mouse.x - player.x;
        const yDiff = mouse.y - player.y;
        const xDir = (xDiff) / (Math.sqrt(xDiff * xDiff + yDiff * yDiff));
        const yDir = (yDiff) / (Math.sqrt(xDiff * xDiff + yDiff * yDiff));
        graphics.strokeLineShape(new Phaser.Geom.Line(player.x, player.y, player.x + xDir * 100, player.y + yDir * 100));

        if(moved) {
            socket.emit('playerMove', {roomId: roomId, x: player.x, y: player.y});
        }

        moved = false;

        const initialX = player.x;
        const initialY = player.y;

        // Chequear balas
        bullets.forEach(bullet => {
            console.log("a");
            if(bullet.x < 0 || bullet.x > worldWidth || bullet.y < 0 || bullet.y > worldHeight) {
                bullet.destroy();
                bullets.splice(bullets.findIndex(e => e.custom.id === bullet.custom.id), 1);
            }
        });

        if(dashCooldown > 0) {
            dashCooldown -= delta / 1000;
        }

        if(dashUses < 2) {
            if(dashRegenCooldown > 0) {
                dashRegenCooldown -= delta / 1000;
            } else {
                dashRegenCooldown = 1.5;
                dashUses++;
            }
        }

        if(!dash && Phaser.Input.Keyboard.JustDown(inputs.dash) && dashCooldown <= 0 && dashUses > 0) {
            if(inputs.up.isDown && !inputs.down.isDown) {
                dashDir.y = -1;
            } else if(!inputs.up.isDown && inputs.down.isDown) {
                dashDir.y = 1;
            } else {
                dashDir.y = 0;
            }

            if(inputs.left.isDown && !inputs.right.isDown) {
                dashDir.x = -1;
            } else if(!inputs.left.isDown && inputs.right.isDown) {
                dashDir.x = 1;
            } else {
                dashDir.x = 0;
            }

            if(dashDir.x !== 0 || dashDir.y !== 0) {
                dash = true;
                dashCooldown = 0.2;
                dashUses--;
                player.setVelocityX(speed * 4 * dashDir.x);
                player.setVelocityY(speed * 4 * dashDir.y);
                this.sound.play('dash', {volume: 0.5});
            }        
        }

        if(dash) {
            moved = true;
            if(dashTimer < 0.1) {
                dashTimer += delta / 1000;
            } else {
                dash = false;
                dashTimer = 0;
                dashDir.x = 0;
                dashDir.y = 0;
            }
        }

        if(!dash) {
            if(inputs.up.isDown && !inputs.down.isDown) {
                player.setVelocityY(-speed);
                moved = true;
            } else if(!inputs.up.isDown && inputs.down.isDown) {
                player.setVelocityY(speed);
                moved = true;
            } else {
                player.setVelocityY(0);
            }

            if (inputs.left.isDown && !inputs.right.isDown) {
                player.setVelocityX(-speed);
                moved = true;
            } else if(!inputs.left.isDown && inputs.right.isDown) {
                player.setVelocityX(speed);
                moved = true;
            } else {
                player.setVelocityX(0);
            }
        }

        if(inputs.shoot.JustDown) {
            const newBullet = createBullet(this, crypto.randomUUID(), player.x, player.y, xDir, yDir, 400, false);
            this.physics.add.collider(newBullet, obstacles, () => {
                newBullet.destroy();
                bullets.splice(bullets.findIndex(bullet => bullet.custom.id === newBullet.custom.id), 1);
            });
            bullets.push(newBullet);
            socket.emit('createBullet', {roomId, bulletId: newBullet.custom.id, x: player.x, y: player.y, xDir, yDir, speed: 400});
        }

        inputs.shoot.JustDown = false;

        if(player.x != initialX || player.y != initialY || moved) {
            socket.emit('playerMove', {roomId: roomId, x: player.x, y: player.y});
        }
    }

    return (
        <div ref={gameContainerRef}></div>
    );
}

export default Gameplay;