require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const reportRoutes = require('./routes/report.routes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => res.json({ service: 'report-service', status: 'running' }));
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`🚀 Report Service running on port ${PORT}`));