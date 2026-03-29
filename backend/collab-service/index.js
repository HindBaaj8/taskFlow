require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { socketAuth } = require('./middleware/auth.middleware');
const { setupSocket } = require('./utils/socket');

const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();
const server = http.createServer(app); // wrap express in http server for Socket.io

// ─── Socket.io setup ──────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});
io.use(socketAuth);         // authenticate every socket connection
setupSocket(io);            // register all socket events

// ─── Database ─────────────────────────────────────────────────────
connectDB();

// ─── Middlewares ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => res.json({ service: 'collab-service', status: 'running' }));
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));

// ─── Start ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3004;
server.listen(PORT, () => console.log(`🚀 Collab Service running on port ${PORT}`));