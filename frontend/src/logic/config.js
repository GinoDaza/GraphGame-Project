// logic/config.js
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No gravity
            debug: true
        }
    }
};

export default config;
