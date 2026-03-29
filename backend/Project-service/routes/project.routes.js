const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, updateProject, deleteProject, addMember } = require('../controller/project.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getProjects);
router.post('/', restrictTo('admin', 'member'), createProject);
router.get('/:id', getProjectById);
router.put('/:id', restrictTo('admin', 'member'), updateProject);
router.delete('/:id', restrictTo('admin', 'member'), deleteProject);
router.patch('/:id/members', restrictTo('admin', 'member'), addMember);

module.exports = router;