const Message = require('./models/Message');
const Notification = require('./models/Notification');

// Map userId -> socketId for targeted notifications
const onlineUsers = new Map();

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 User connected: ${user.id} (socket: ${socket.id})`);

    // Register user as online
    onlineUsers.set(user.id, socket.id);
    io.emit('users:online', Array.from(onlineUsers.keys()));

    // ── Join a project room ──────────────────────────────────────
    socket.on('room:join', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`👥 User ${user.id} joined room project:${projectId}`);
    });

    // ── Leave a project room ─────────────────────────────────────
    socket.on('room:leave', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // ── Send a chat message ──────────────────────────────────────
    socket.on('message:send', async (data) => {
      try {
        const { projectId, content, senderName } = data;
        if (!projectId || !content) return;

        const message = await Message.create({
          projectId,
          sender: user.id,
          senderName,
          content,
          type: 'text',
        });

        // Broadcast to everyone in the project room (including sender)
        io.to(`project:${projectId}`).emit('message:new', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // ── Send a push notification to a specific user ──────────────
    socket.on('notification:send', async (data) => {
      try {
        const { recipientId, type, message, projectId, taskId } = data;

        const notif = await Notification.create({
          recipient: recipientId,
          type,
          message,
          projectId,
          taskId,
        });

        // Send to recipient if online
        const recipientSocketId = onlineUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('notification:new', notif);
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // ── Typing indicator ─────────────────────────────────────────
    socket.on('typing:start', ({ projectId, userName }) => {
      socket.to(`project:${projectId}`).emit('typing:start', { userId: user.id, userName });
    });

    socket.on('typing:stop', ({ projectId }) => {
      socket.to(`project:${projectId}`).emit('typing:stop', { userId: user.id });
    });

    // ── Disconnect ───────────────────────────────────────────────
    socket.on('disconnect', () => {
      onlineUsers.delete(user.id);
      io.emit('users:online', Array.from(onlineUsers.keys()));
      console.log(`❌ User disconnected: ${user.id}`);
    });
  });
};

module.exports = { setupSocket, onlineUsers };