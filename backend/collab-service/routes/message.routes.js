const express = require('express');
const router = express.Router();
const { getMessages, deleteMessage } = require('../controllers/message.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/:projectId', getMessages);
router.delete('/:id', deleteMessage);

module.exports = router;