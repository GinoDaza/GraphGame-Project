/* game.jsx */

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
            <GameChat roomId={roomId} setFocused={setFocused} />

            {/* Game Canvas */}
            <Gameplay focused={focused} roomId={roomId} />

            {/* Player Info */}
            <GameInfo />
        </div>
    );
}

export default Game;
