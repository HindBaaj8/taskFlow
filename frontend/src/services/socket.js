import { io } from 'socket.io-client';
import { store } from '../app/store.js';
import { 
  addMessage, addNotification, setOnlineUsers, 
  addTypingUser, removeTypingUser, setSocketStatus 
} from '../features/collab/collabSlice.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Singleton instance
  static getInstance() {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token, cannot connect socket');
      return;
    }

    const collabURL = process.env.REACT_APP_COLLAB_URL || 'http://localhost:3004';
    
    this.socket = io(collabURL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      store.dispatch(setSocketStatus('connected'));
      this.reconnectAttempts = 0;
      
      // Get initial online users
      this.socket.on('users:online', (userIds) => {
        store.dispatch(setOnlineUsers(userIds));
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      store.dispatch(setSocketStatus('disconnected'));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connect error:', error.message);
      store.dispatch(setSocketStatus('disconnected'));
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
      }
    });

    // ─── Chat Events ─────────────────────────────────────────────────
    this.socket.on('message:new', (message) => {
      store.dispatch(addMessage(message));
    });

    this.socket.on('notification:new', (notification) => {
      store.dispatch(addNotification(notification));
    });

    this.socket.on('typing:start', (typingUser) => {
      store.dispatch(addTypingUser(typingUser));
    });

    this.socket.on('typing:stop', (userId) => {
      store.dispatch(removeTypingUser(userId));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(projectId) {
    if (this.socket?.connected) {
      this.socket.emit('room:join', projectId);
    }
  }

  leaveRoom(projectId) {
    if (this.socket?.connected) {
      this.socket.emit('room:leave', projectId);
    }
  }

  sendMessage(projectId, content) {
    if (this.socket?.connected) {
      this.socket.emit('message:send', { 
        projectId, 
        content,
        type: 'text' 
      });
      return true;
    }
    return false;
  }

  sendTyping(projectId, isTyping) {
    if (this.socket?.connected) {
      this.socket.emit(isTyping ? 'typing:start' : 'typing:stop', { projectId });
    }
  }

  sendNotification(data) {
    if (this.socket?.connected) {
      this.socket.emit('notification:send', data);
    }
  }
}

export default SocketService.getInstance();

