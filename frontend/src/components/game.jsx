import '../css/game.css';
import Gameplay from './gameplay.jsx';
import GameChat from './gamechat.jsx';
import { useEffect, useState } from 'preact/hooks';

function Game({roomId}) {
    const [focused, setFocused] = useState(true);

    return (
        <div className="game">
            {/* Chat Section */}
            <GameChat roomId={roomId} setFocused={setFocused}/>

            {/* Placeholder for Game Canvas */}
            <div className="game-play">
                <h3>Game Canvas</h3>
                <div className="game-container">
                    <Gameplay focused={focused}/>
                </div>
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
