import { useState, useEffect } from 'preact/hooks';
import socket from '../app/socket'; // Import the socket instance
import '../css/menu.css';
import { FaSyncAlt } from 'react-icons/fa'; // Icon for reload

function Menu({ setScreen, setRoomId }) {
    const [roomIdInput, setRoomIdInput] = useState(''); // State for Room ID input
    const [rooms, setRooms] = useState([]); // State for available rooms
    const [selectedRoom, setSelectedRoom] = useState(null); // State for selected room
    const [name, setName] = useState('mdbt39'); // Default name
    const [tempName, setTempName] = useState('mdbt39'); // Temporary name input

    // Fetch rooms when the component mounts
    useEffect(() => {
        viewRooms();
        changeName();
    }, []);

    // Fetch rooms
    const viewRooms = () => {
        socket.emit('getRooms', (roomsList) => {
            console.log('Rooms fetched:', roomsList); // Log rooms fetched
            setRooms(roomsList);
        });
    };

    // Update name
    const changeName = () => {
        setName(tempName); // Commit the temporary name
        socket.emit('changeName', { name: tempName });
        console.log(`Name updated to ${tempName}`);
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
            <p>Your Name: {name}</p>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Enter a name"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)} // Only update temporary state
                />
                <button onClick={changeName}>Update Name</button>
            </div>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createRoom()}
                />
                <button onClick={createRoom}>Create Room</button>
                <button onClick={viewRooms} title="Reload Rooms">
                    <FaSyncAlt />
                </button>
            </div>
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
            <div className="button-group">
                <button onClick={joinRoom} disabled={!selectedRoom}>
                    Join Selected Room
                </button>
            </div>
        </div>
    );
}

export default Menu;
