import { useEffect, useState } from 'preact/hooks';
import socket from '../app/socket';
import '../css/lobby.css';

function Lobby({ setScreen, roomId }) {
    const [players, setPlayers] = useState([]); // List of players in the room

    useEffect(() => {
        // Fetch players in the room when the component mounts
        socket.emit('getRoomPlayers', roomId, (response) => {
            console.log('getRoomPlayers response:', response); // Log response
            if (response.success) {
                setPlayers(response.players); // Update the list of players
            } else {
                alert(response.error || 'Failed to retrieve players');
                setScreen('menu'); // Navigate back to the menu if room doesn't exist
            }
        });

        // Update player list when someone joins or leaves
        socket.on('playerJoined', (player) => {
            console.log('Player joined:', player); // Log the player joined
            setPlayers((prevPlayers) => [...prevPlayers, player.playerId]);
        });

        socket.on('playerLeft', (playerId) => {
            console.log('Player left:', playerId); // Log the player left
            setPlayers((prevPlayers) => prevPlayers.filter((id) => id !== playerId));
        });

        return () => {
            // Clean up event listeners when the component unmounts
            socket.off('playerJoined');
            socket.off('playerLeft');
        };
    }, [roomId, setScreen]);

    // Join the game
    const joinGame = () => {
        socket.emit('startGame', roomId, (response) => {
            console.log('startGame response:', response); // Log response
            if (response.success) {
                setScreen('game'); // Navigate to the Game component
            } else {
                alert(response.error || 'Failed to join game');
            }
        });
    };

    // Leave the lobby
    const leaveLobby = () => {
        socket.emit('leaveRoom', roomId, (response) => {
            console.log('leaveRoom response:', response); // Log response
            if (response.success) {
                console.log(`Player ${socket.id} left room ${roomId}`);
                setScreen('menu'); // Navigate back to the menu
            } else {
                console.error(response.error || 'Failed to leave room');
            }
        });
    };

    return (
        <div className="lobby">
            <h2>Lobby: {roomId}</h2>
            <ul>
                {players.map((player) => (
                    <li key={player}>
                        {player} {player === socket.id ? '(You)' : ''}
                    </li>
                ))}
            </ul>
            <button onClick={joinGame}>Join Game</button>
            <button onClick={leaveLobby}>Leave Lobby</button>
        </div>
    );
}

export default Lobby;
