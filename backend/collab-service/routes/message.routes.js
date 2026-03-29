const express = require('express');
const router = express.Router();
const { getMessages, deleteMessage } = require('../controller/message.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/:projectId', getMessages);
router.delete('/:id', deleteMessage);

module.exports = router;