import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} from '../controllers/projectController.js';
import {
  addProjectMember,
  removeProjectMember,
  updateMemberRole,
  getAllUsers
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllProjects)
  .post(protect, adminOnly, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, adminOnly, updateProject)
  .delete(protect, adminOnly, deleteProject);

router.get('/:id/stats', protect, getProjectStats);

// Member management
router.get('/:id/members', protect, getAllUsers);
router.post('/:id/members', protect, adminOnly, addProjectMember);
router.route('/:id/members/:userId')
  .put(protect, adminOnly, updateMemberRole)
  .delete(protect, adminOnly, removeProjectMember);

export default router;
