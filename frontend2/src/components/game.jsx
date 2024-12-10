import '../css/game.css';

function Game() {
    return (
        <div className="game">
            <div className="game-chat">
                <h3>Chat</h3>
                <div className="chat-box">Chat messages go here...</div>
            </div>
            <div className="game-play">
                <h3>Game Canvas</h3>
                <div className="game-container">[Phaser Canvas]</div>
            </div>
            <div className="game-info">
                <h3>Player Info</h3>
                <p>Info about the player or game settings...</p>
            </div>
        </div>
    );
}

export default Game;
