const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory } = require('../controller/category.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getCategories);
router.post('/', restrictTo('admin'), createCategory);
router.delete('/:id', restrictTo('admin'), deleteCategory);

module.exports = router;