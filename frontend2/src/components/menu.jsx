import { useState, useEffect } from 'preact/hooks';
import socket from '../app/socket'; // Import the socket instance
import '../css/menu.css';

function Menu({ setScreen, setRoomId }) {
    const [roomIdInput, setRoomIdInput] = useState(''); // State for Room ID input
    const [rooms, setRooms] = useState([]); // State for available rooms
    const [selectedRoom, setSelectedRoom] = useState(null); // State for selected room
    const [name, setName] = useState('');


    // Change name
    const changeName = (e) => {
        setName(e.target.value);
        socket.emit('changeName', {name: e.target.value});
    }

    // Fetch rooms when "View Rooms" is clicked
    const viewRooms = () => {
        socket.emit('getRooms', (roomsList) => {
            console.log('Rooms fetched:', roomsList); // Log rooms fetched
            setRooms(roomsList);
        });
    };

    // Create a new room
    const createRoom = () => {
        if (!roomIdInput.trim()) {
            alert('Please enter a Room ID.');
            return;
        }

        socket.emit('createRoom', roomIdInput.trim(), (response) => {
            console.log('Create room response:', response); // Log response
            if (response.success) {
                setRoomId(roomIdInput.trim());
                setScreen('lobby'); // Navigate to lobby
            } else {
                alert(response.error || 'Failed to create room.');
            }
        });
    };

    // Join the selected room
    const joinRoom = () => {
        if (!selectedRoom) {
            alert('Please select a room to join.');
            return;
        }

        socket.emit('joinRoom', selectedRoom, (response) => {
            console.log('Join room response:', response); // Log response
            if (response.success) {
                setRoomId(selectedRoom);
                setScreen('lobby'); // Navigate to lobby
            } else {
                alert(response.error || 'Failed to join room.');
            }
        });
    };

    // Update the selected room when clicked
    const selectRoom = (roomId) => {
        setSelectedRoom(roomId);
    };

    return (
        <div className="menu">
            <h2>Graph Game Menu</h2>
            <div>
                <input
                    placeholder='Enter a name'
                    value={name}
                    onChange={changeName}
                />
            </div>
            <input
                type="text"
                placeholder="Enter Room ID"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
            />
            <button onClick={createRoom}>Create Room</button>
            <button onClick={viewRooms}>View Rooms</button>
            <div id="room-list-container">
                <ul id="room-list">
                    {rooms.length === 0 ? (
                        <li>No rooms available</li>
                    ) : (
                        rooms.map((room) => (
                            <li
                                key={room}
                                className={selectedRoom === room ? 'selected' : ''}
                                onClick={() => selectRoom(room)}
                            >
                                {room}
                            </li>
                        ))
                    )}
                </ul>
            </div>
            <button onClick={joinRoom} disabled={!selectedRoom}>
                Join Selected Room
            </button>
        </div>
    );
}

export default Menu;
