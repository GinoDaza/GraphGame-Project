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

// Connect to WebSocket server immediately
socket = io(config.wsUrl);

// Handle connection
socket.on('connect', () => {
    console.log('Connected to WebSocket server:', socket.id);
});

// Create a room
createRoomButton.addEventListener('click', () => {
    const roomId = roomIdInput.value.trim();
    if (!roomId) {
        alert('Please enter a Room ID.');
        return;
    }

    socket.emit('createRoom', roomId, (response) => {
        if (response.success) {
            alert(`Room created: ${roomId}`);
            startGame(roomId); // Automatically join the room after creation
        } else {
            alert(response.error || 'Failed to create room.');
        }
    });
});

// View available rooms
viewRoomsButton.addEventListener('click', () => {
    socket.emit('getRooms', (rooms) => {
        updateRoomList(rooms);
    });
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

    // Join the room via WebSocket
    socket.emit('joinRoom', roomId, (response) => {
        if (response.success) {
            console.log(`Joined room: ${roomId}`);
        } else {
            alert(response.error || 'Failed to join room.');
        }
    });

    socket.on('playerJoined', (player) => {
        console.log(`Player joined: ${player.playerId}`);
    });

    socket.on('receiveFunction', ({ playerId, functionStr }) => {
        console.log(`Player ${playerId} sent function: ${functionStr}`);
        // Handle game logic with the received function
    });

    socket.on('playerLeft', (player) => {
        console.log(`Player left: ${player.playerId}`);
    });

    // Initialize Phaser game
    initializeGame(socket, roomId);
}
