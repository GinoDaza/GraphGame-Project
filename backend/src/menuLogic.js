const express = require('express');
const router = express.Router();
const { createRoom, joinRoom, getRoomPlayers, getAllRooms } = require('./rooms');

// Create a room
router.post('/rooms', (req, res) => {
    const roomId = req.body.roomId;
    if (!roomId) {
        return res.status(400).json({ error: 'Room ID is required' });
    }
    const success = createRoom(roomId);
    if (success) {
        res.status(201).json({ message: 'Room created', roomId });
    } else {
        res.status(409).json({ error: 'Room already exists' });
    }
});

// Join a room
router.post('/rooms/:roomId/join', (req, res) => {
    const roomId = req.params.roomId;
    const playerId = req.body.playerId || `player-${Date.now()}`;
    const success = joinRoom(roomId, playerId);
    if (success) {
        res.status(200).json({ message: 'Joined room', roomId, playerId });
    } else {
        res.status(404).json({ error: 'Room not found' });
    }
});

// Get players in a room
router.get('/rooms/:roomId/players', (req, res) => {
    const roomId = req.params.roomId;
    const players = getRoomPlayers(roomId);
    res.status(200).json({ roomId, players });
});

// Get list of all rooms
router.get('/rooms', (req, res) => {
    const roomList = getAllRooms();
    res.status(200).json({ rooms: roomList });
});


module.exports = router;
