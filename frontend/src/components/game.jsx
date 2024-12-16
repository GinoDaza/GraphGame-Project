import '../css/game.css';
import Gameplay from './gameplay.jsx';
import GameChat from './gamechat.jsx';
import GameInfo from './gameinfo.jsx';
import { useState } from 'preact/hooks';

function Game({ roomId }) {
    const [focused, setFocused] = useState(true);
    const [validFunct, setValidFunct] = useState('0');

    return (
        <div className="game">
            <div className="game-chat-container">
                <GameChat roomId={roomId} setFocused={setFocused} />
            </div>
            <div className="game-play-container">
                <Gameplay focused={focused} roomId={roomId} validFunct={validFunct}/>
            </div>
            <div className="game-info-container">
                <GameInfo setFocused={setFocused} setValidFunct={setValidFunct}/>
            </div>
        </div>
    );
}

export default Game;
