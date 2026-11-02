import { io } from 'socket.io-client';

// This connects to your backend port
const socket = io('http://localhost:5000', { autoConnect: false });

export default socket;