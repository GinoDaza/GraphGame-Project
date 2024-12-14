import '../css/game.css';
import Gameplay from './gameplay.jsx';
import GameChat from './gamechat.jsx';
import GameInfo from './gameinfo.jsx';
import { useState } from 'preact/hooks';

function Game({ roomId }) {
    const [focused, setFocused] = useState(true);

    return (
        <div className="game">
            <div className="game-chat-container">
                <GameChat roomId={roomId} setFocused={setFocused} />
            </div>
            <div className="game-play-container">
                <Gameplay focused={focused} roomId={roomId} />
            </div>
            <div className="game-info-container">
                <GameInfo />
            </div>
        </div>
    );
}

export default Game;
