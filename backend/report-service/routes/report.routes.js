const express = require('express');
const router = express.Router();
const { getDashboard, getProjectReport, getWorkloadReport } = require('../controllers/report.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/projects/:projectId', getProjectReport);
router.get('/workload', restrictTo('admin'), getWorkloadReport);

module.exports = router;