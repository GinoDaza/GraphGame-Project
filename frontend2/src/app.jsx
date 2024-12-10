import './app.css';
import { useState, useEffect } from 'preact/hooks';
import socket from './app/socket';
import Menu from './components/menu';
import Lobby from './components/lobby';
import Game from './components/game';

export function App() {
    const [screen, setScreen] = useState('menu');
    const [roomId, setRoomId] = useState(null);

    useEffect(() => {
        socket.connect();
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div id="app">
            {screen === 'menu' && <Menu setScreen={setScreen} setRoomId={setRoomId} />}
            {screen === 'lobby' && <Lobby setScreen={setScreen} roomId={roomId} />}
            {screen === 'game' && <Game roomId={roomId} />}
        </div>
    );
}
