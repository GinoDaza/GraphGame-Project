import { useEffect, useState } from 'preact/hooks';
import socket from '../app/socket';
import '../css/lobby.css';

function Lobby({ setScreen, roomId }) {
    const [players, setPlayers] = useState([]); // List of players in the room

    useEffect(() => {
        // Join the room
        socket.emit('joinRoom', roomId, (response) => {
            if (response.success) {
                setPlayers(response.playersInfo || []); // Set player info
            } else {
                alert(response.error || 'Failed to join room');
                setScreen('menu');
            }
        });

        // Update player list when someone joins or leaves
        socket.on('playerJoined', (player) => {
            setPlayers((prevPlayers) => [...prevPlayers, player]);
        });

        socket.on('playerLeft', (playerId) => {
            setPlayers((prevPlayers) => prevPlayers.filter((p) => p.id !== playerId));
        });

        return () => {
            // Leave the room when unmounting
            socket.emit('leaveRoom', roomId, (response) => {
                if (!response.success) {
                    console.error(response.error || 'Failed to leave room');
                }
            });
            socket.off('playerJoined');
            socket.off('playerLeft');
        };
    }, [roomId, setScreen]);

    // Join the game
    const joinGame = () => {
        socket.emit('startGame', roomId, (response) => {
            if (response.success) {
                setScreen('game'); // Navigate to the Game component
            } else {
                alert(response.error || 'Failed to join game');
            }
        });
    };

    // Leave the lobby
    const leaveLobby = () => {
        setScreen('menu'); // Navigate back to the menu
    };

    return (
        <div className="lobby">
            <h2>Lobby: {roomId}</h2>
            <ul>
                {players.map((player) => (
                    <li key={player.id}>
                        {player.name || player.id} {player.id === socket.id ? '(You)' : ''}
                    </li>
                ))}
            </ul>
            <button onClick={joinGame}>Join Game</button>
            <button onClick={leaveLobby}>Leave Lobby</button>
        </div>
    );
}

export default Lobby;
