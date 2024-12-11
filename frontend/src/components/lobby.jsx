import { useEffect, useState } from 'preact/hooks';
import socket from '../app/socket';
import '../css/lobby.css';

function Lobby({ setScreen, roomId }) {
    const [players, setPlayers] = useState([]); // List of players in the room

    useEffect(() => {
        // Fetch players in the room when the component mounts
        socket.emit('getRoomPlayers', roomId, (response) => {
            if (response.success) {
                setPlayers(response.playersInfo); // Update the list of players
            } else {
                alert(response.error || 'Failed to retrieve players');
                setScreen('menu'); // Navigate back to the menu if room doesn't exist
            }
        });

        // Update player list when someone joins
        socket.on('playerJoined', (player) => {
            console.log(player);
            setPlayers((prevPlayers) => {
                if (!prevPlayers.some(listPlayer => listPlayer.playerId === player.playerId)) {
                    return [...prevPlayers, player];
                }
                return prevPlayers;
            });
        });

        // Update player list when someone leaves
        socket.on('playerLeft', ({ playerId }) => {
            setPlayers((prevPlayers) => prevPlayers.filter((player) => player.playerId !== playerId));
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
            if (response.success) {
                setScreen('menu'); // Navigate back to the menu
            } else {
                console.error(response.error || 'Failed to leave room');
            }
        });
    };

    return (
        <div className="lobby">
            <h2>Lobby</h2>
            <h3>Room ID: {roomId}</h3>
            <ul>
                {players.map((player) => (
                    <li key={player.playerId}>
                        {player.name} {player.playerId === socket.id ? '(You)' : ''}
                    </li>
                ))}
            </ul>
            <button onClick={joinGame}>Join Game</button>
            <button onClick={leaveLobby}>Leave Lobby</button>
        </div>
    );
}

export default Lobby;
