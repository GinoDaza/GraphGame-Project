import '../css/game.css';
import Gameplay from './gameplay.jsx';
import GameChat from './gamechat.jsx';
import GameInfo from './gameinfo.jsx';
import { useState } from 'preact/hooks';

function Game({ roomId }) {
    const [focused, setFocused] = useState(true);

    return (
        <div className="game">
            {/* Chat Section */}
            <div className="game-chat">
                <GameChat roomId={roomId} setFocused={setFocused} />
            </div>

            {/* Game Canvas */}
            <div className="game-play">
                <Gameplay focused={focused} roomId={roomId} />
            </div>

            {/* Player Info */}
            <div className="game-info">
                <GameInfo />
            </div>
        </div>
    );
}

export default Game;
