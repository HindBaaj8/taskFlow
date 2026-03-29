require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { protect } = require('./middleware/auth.middleware');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/tasks', protect, taskRoutes);
app.use('/api/comments', protect, commentRoutes);

app.get('/health', (req, res) => res.json({ service: 'task-service', status: 'running' }));
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`🚀 Task Service running on port ${PORT}`));

