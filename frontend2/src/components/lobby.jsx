import '../css/lobby.css';

function Lobby({ setScreen, roomId }) {
    return (
        <div className="lobby">
            <h2>Lobby: {roomId || 'No Room Selected'}</h2>
            <ul>
                <li>Player 1</li>
                <li>Player 2</li>
                <li>Player 3</li>
            </ul>
            <button onClick={() => setScreen('game')}>Start Game</button>
            <button onClick={() => setScreen('menu')}>Leave Lobby</button>
        </div>
    );
}

export default Lobby;
