const roomIdInput = document.getElementById('room-id');
const createRoomButton = document.getElementById('create-room');
const viewRoomsButton = document.getElementById('view-rooms');
const joinSelectedRoomButton = document.getElementById('join-selected-room');
const roomListContainer = document.getElementById('room-list-container');
const roomListElement = document.getElementById('room-list');
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('game-container');

let selectedRoom = null;
let socket; // WebSocket connection

// Create a room
createRoomButton.addEventListener('click', async () => {
    const roomId = roomIdInput.value.trim();
    if (!roomId) {
        alert('Please enter a Room ID.');
        return;
    }
    try {
        const response = await fetch(`${config.apiBaseUrl}/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId })
        });
        const data = await response.json();
        if (response.ok) {
            alert(`Room created: ${data.roomId}`);
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error creating room:', error);
    }
});

// View available rooms
viewRoomsButton.addEventListener('click', async () => {
    try {
        const response = await fetch(`${config.apiBaseUrl}/rooms`);
        const data = await response.json();
        if (response.ok) {
            updateRoomList(data.rooms);
        } else {
            alert('Failed to load rooms.');
        }
    } catch (error) {
        console.error('Error fetching rooms:', error);
    }
});

// Update the room list in the UI
function updateRoomList(rooms) {
    roomListElement.innerHTML = ''; // Clear existing list
    if (rooms.length === 0) {
        roomListElement.innerHTML = '<li>No rooms available</li>';
        joinSelectedRoomButton.disabled = true;
    } else {
        rooms.forEach((roomId) => {
            const roomItem = document.createElement('li');
            roomItem.textContent = roomId;
            roomItem.classList.add('room-item');
            roomItem.addEventListener('click', () => {
                selectRoom(roomId, roomItem);
            });
            roomListElement.appendChild(roomItem);
        });
    }
}

// Select a room
function selectRoom(roomId, roomItem) {
    selectedRoom = roomId;
    joinSelectedRoomButton.disabled = false;

    // Highlight the selected room
    const roomItems = document.querySelectorAll('.room-item');
    roomItems.forEach((item) => item.classList.remove('selected'));
    roomItem.classList.add('selected');
}

// Join the selected room
joinSelectedRoomButton.addEventListener('click', () => {
    if (selectedRoom) {
        startGame(selectedRoom);
    } else {
        alert('Please select a room.');
    }
});

// Start the game
function startGame(roomId) {
    menu.style.display = 'none';
    gameContainer.style.display = 'block';

    // Connect to WebSocket server
    socket = io(config.wsUrl);

    // Join the room via WebSocket
    socket.emit('joinRoom', roomId);

    socket.on('playerJoined', (playerId) => {
        console.log(`Player joined: ${playerId}`);
    });

    socket.on('receiveFunction', ({ playerId, functionStr }) => {
        console.log(`Player ${playerId} sent function: ${functionStr}`);
        // Handle game logic with the received function
    });

    // Initialize Phaser game
    initializeGame(socket, roomId);
}
