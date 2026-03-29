const express = require('express');
const router = express.Router();
const { getDashboard, getProjectReport, getWorkloadReport } = require('../controller/report.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/projects/:projectId', getProjectReport);
router.get('/workload', restrictTo('admin'), getWorkloadReport);

module.exports = router;