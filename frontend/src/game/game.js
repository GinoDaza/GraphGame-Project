import Phaser from 'phaser';
import gameConfig from './config';

function initGame() {
    const game = new Phaser.Game(gameConfig);
    return game;
}

export default initGame;
