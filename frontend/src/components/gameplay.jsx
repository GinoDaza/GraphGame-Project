import Phaser, { Scene } from 'phaser'
import { useEffect, useRef } from 'preact/hooks';

function Gameplay() {
    const gameContainerRef = useRef(null);

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

    const mouse = {x: 0, y: 0};

    function Preload() {
        this.load.image('player', 'src/assets/undertaleheart.png');
    }

    function Create() {
        mouseInput = this.input.activePointer;
        graphics = this.add.graphics();
        player = this.physics.add.sprite(0, 0, 'player');
        player.setDisplaySize(20, 20);

        inputs = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            dash: Phaser.Input.Keyboard.KeyCodes.SHIFT
        });
    }

    function Update(time, delta) {
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

        if(!dash && inputs.dash.isDown && dashCooldown <= 0) {
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
            }            
        }

        if(dash) {
            if(dashTimer < 0.1) {
                player.x += speed * 4 * dashDir.x * delta / 1000;
                player.y += speed * 4 * dashDir.y * delta / 1000;
                dashTimer += delta / 1000;
            } else {
                dash = false;
                dashTimer = 0;
                dashDir.x = 0;
                dashDir.y = 0;
            }
        }

        if(!dash) {
            if (inputs.up.isDown) {
                player.y -= speed * delta / 1000;
                moved = true;
            }
            if (inputs.down.isDown) {
                player.y += speed * delta / 1000;
                moved = true;
            }
            if (inputs.left.isDown) {
                player.x -= speed * delta / 1000;
                moved = true;
            }
            if (inputs.right.isDown) {
                player.x += speed * delta / 1000;
                moved = true;
            }
        }
    }

    return (
        <div ref={gameContainerRef}></div>
    );
}

export default Gameplay;