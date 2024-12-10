import { io } from 'socket.io-client';
import appConfig from './config';

const socket = io(appConfig.socketUrl);

export default socket;
