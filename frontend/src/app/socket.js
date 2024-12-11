import { io } from 'socket.io-client';
import config from './config';

const socket = io(config.wsUrl, {
    transports: ['websocket'],
    autoConnect: false,
});

socket.on('connect', () => {
    console.log(`Connected to server: ${socket.id}`);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

export default socket;
