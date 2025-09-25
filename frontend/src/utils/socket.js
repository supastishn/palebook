import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const origin = API_URL.replace(/\/api\/?$/, '');

const socket = io(origin, {
  transports: ['websocket'],
  autoConnect: true,
});

export default socket;

