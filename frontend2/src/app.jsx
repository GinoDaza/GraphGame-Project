import './app.css';
import { useState } from 'preact/hooks';
import Menu from './components/menu';
import Lobby from './components/lobby';
import Game from './components/game';

export function App() {
    // Estado para manejar la pantalla actual
    const [screen, setScreen] = useState('menu'); // menu, lobby, game
    const [roomId, setRoomId] = useState(null); // ID de la sala seleccionada

    return (
        <div id="app">
            {screen === 'menu' && (
                <Menu
                    setScreen={setScreen}
                    setRoomId={setRoomId}
                />
            )}
            {screen === 'lobby' && (
                <Lobby
                    setScreen={setScreen}
                    roomId={roomId}
                />
            )}
            {screen === 'game' && <Game roomId={roomId} />}
        </div>
    );
}
