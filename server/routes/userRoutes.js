import express from 'express';
import {
  getAllUsers,
  getUserById,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllUsers);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, markAllNotificationsRead);
router.put('/notifications/:id', protect, markNotificationRead);
router.get('/:id', protect, getUserById);

export default router;
