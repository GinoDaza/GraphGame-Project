const roomIdInput = document.getElementById('room-id');
const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('game-container');

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

// Join a room
joinRoomButton.addEventListener('click', () => {
    const roomId = roomIdInput.value.trim();
    if (!roomId) {
        alert('Please enter a Room ID.');
        return;
    }
    startGame(roomId);
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
