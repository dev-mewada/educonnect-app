const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, messageController.getConversations);
router.get('/contacts', protect, messageController.getContacts);
router.get('/:contactId', protect, messageController.getMessagesWithContact);
router.post('/', protect, messageController.sendMessage);
router.patch('/read/:contactId', protect, messageController.markMessagesAsRead);

module.exports = router;
