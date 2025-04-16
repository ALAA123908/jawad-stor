// src/socket.js
import { io } from 'socket.io-client';

const socket = io('https://supermarket-realtime.onrender.com', {
  autoConnect: true,
  transports: ['websocket']
});

export default socket;
