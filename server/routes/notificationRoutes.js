const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications, markAllRead, markOneRead, deleteNotification,
} = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.put('/mark-all-read', protect, markAllRead);
router.put('/:id/read', protect, markOneRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
