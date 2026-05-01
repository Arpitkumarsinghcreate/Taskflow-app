import express from 'express';
import {
  getMyTasks,
  getProjectTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  addComment
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

// Use mergeParams to access projectId from the parent router if nested
const router = express.Router({ mergeParams: true });

// Mounted at /api/tasks
router.get('/my', protect, getMyTasks);

// These will also be used by the nested route in server.js or as direct task access
router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.post('/:id/comments', protect, addComment);

// For project-specific task access (can be used directly if projectId is in params)
router.route('/project/:projectId')
  .get(protect, getProjectTasks)
  .post(protect, createTask);

export default router;
