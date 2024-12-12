import Phaser, { Scene } from 'phaser'
import { useEffect, useRef } from 'preact/hooks';

function Gameplay({ focused }) {
    const gameContainerRef = useRef(null);

    useEffect(() => {
        console.log(focused);
    });

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: 600,
            height: 600,
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
                    debug: false
                }
            }
        };

        const game = new Phaser.Game(config);

        document.addEventListener('mousemove', (event) => {
            mouse.x = mouseInput.x;
            mouse.y = mouseInput.y;
        });

        return () => {
            game.destroy(true);
        };
    }, []);

    let player;
    let speed = 100;
    let inputs;
    let graphics;

    let mouseInput;

    let dash = false;
    let dashTimer = 0;
    let dashDir = {x: 0, y: 0};
    let dashCooldown = 0;

    let isFocused = focused;

    const mouse = {x: 0, y: 0};

    function Preload() {
        this.load.image('player', 'src/assets/undertaleheart.png');
        this.load.image('bricks', 'src/assets/minecraftbricks.jpg');
    }

    function Create() {
        mouseInput = this.input.activePointer;
        graphics = this.add.graphics();
        player = this.physics.add.sprite(0, 0, 'player');
        player.setDisplaySize(20, 20);
        player.setCollideWorldBounds(true);

        // Obstacles
        const obstacles = this.physics.add.staticGroup();
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
        });
    }

    function Update(time, delta) {

        //console.log(focused);

        graphics.clear();
        graphics.lineStyle(2, 0x808080, 0.5); // Restablecer estilo
        const xDiff = mouse.x - player.x;
        const yDiff = mouse.y - player.y;
        const xDir = (xDiff) / (Math.sqrt(xDiff * xDiff + yDiff * yDiff));
        const yDir = (yDiff) / (Math.sqrt(xDiff * xDiff + yDiff * yDiff));
        graphics.strokeLineShape(new Phaser.Geom.Line(player.x, player.y, player.x + xDir * 100, player.y + yDir * 100));

        let moved = false;

        if(dashCooldown > 0) {
            dashCooldown -= delta / 1000;
        }

        if(isFocused && !dash && inputs.dash.isDown && dashCooldown <= 0) {
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
                dashCooldown = 1;
                player.setVelocityX(speed * 4 * dashDir.x);
                player.setVelocityY(speed * 4 * dashDir.y);
            }        
        }

        if(dash) {
            if(dashTimer < 0.1) {
                dashTimer += delta / 1000;
            } else {
                dash = false;
                dashTimer = 0;
                dashDir.x = 0;
                dashDir.y = 0;
            }
        }

        if(!dash && isFocused) {
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
                moved = true
            } else if(!inputs.left.isDown && inputs.right.isDown) {
                player.setVelocityX(speed);
                moved = true;
            } else {
                player.setVelocityX(0);
            }
        }

        if(!isFocused) {
            inputs.up.isDown = false;
            inputs.down.isDown = false;
            inputs.left.isDown = false;
            inputs.right.isDown = false;
            inputs.dash.isDown = false;
        }
    }

    return (
        <div ref={gameContainerRef}></div>
    );
}

export default Gameplay;