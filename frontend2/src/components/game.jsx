import '../css/game.css';
import GameChat from './gamechat.jsx';

function Game() {
    return (
        <div className="game">
            {/* Chat Section */}
            <GameChat />

            {/* Placeholder for Game Canvas */}
            <div className="game-play">
                <h3>Game Canvas</h3>
                <div className="game-container">[Phaser Canvas]</div>
            </div>

            {/* Placeholder for Player Info */}
            <div className="game-info">
                <h3>Player Info</h3>
                <p>Info about the player or game settings...</p>
            </div>
        </div>
    );
}

export default Game;
