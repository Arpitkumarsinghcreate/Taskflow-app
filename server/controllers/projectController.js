import { Project, Task, User, Notification } from '../models/index.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getAllProjects = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      query = Project.find();
    } else {
      query = Project.find({
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id }
        ]
      });
    }

    const projects = await query
      .populate('owner', 'firstName lastName email avatar')
      .populate('members.user', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });

    // Add task count to each project
    const projectsWithTaskCount = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        return { ...project.toObject(), taskCount };
      })
    );

    res.status(200).json({
      success: true,
      count: projectsWithTaskCount.length,
      data: projectsWithTaskCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'firstName lastName email avatar')
      .populate('members.user', 'firstName lastName email avatar');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Access check: Admin OR Owner OR Member
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    
    if (req.user.role !== 'admin' && !isOwner && !isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this project' });
    }

    // Get tasks for this project
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignee', 'firstName lastName avatar')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { ...project.toObject(), tasks }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = async (req, res, next) => {
  try {
    const { name, description, priority, color, dueDate } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      priority,
      color,
      dueDate,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin', joinedAt: new Date() }]
    });

    await project.populate('owner', 'firstName lastName email avatar');

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only owner or admin can update
    const isOwner = project.owner.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    const allowedFields = ['name', 'description', 'status', 'priority', 'color', 'dueDate'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only owner can delete (even among admins)
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project owner can delete this project' });
    }

    // Delete all tasks belonging to this project
    await Task.deleteMany({ project: req.params.id });
    
    // Delete the project
    await project.deleteOne();

    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project stats
// @route   GET /api/projects/:id/stats
// @access  Private
export const getProjectStats = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const tasks = await Task.find({ project: req.params.id });
    const total = tasks.length;
    
    if (total === 0) {
      return res.status(200).json({
        success: true,
        data: { total: 0, todo: 0, in_progress: 0, done: 0, overdue: 0, completionPct: 0 }
      });
    }

    const todo = tasks.filter(t => t.status === 'todo').length;
    const in_progress = tasks.filter(t => t.status === 'in_progress').length;
    const done = tasks.filter(t => t.status === 'done').length;
    
    const today = new Date();
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'done');
    const overdue = overdueTasks.length;

    const completionPct = Math.round((done / total) * 100);

    res.status(200).json({
      success: true,
      data: { total, todo, in_progress, done, overdue, completionPct }
    });
  } catch (error) {
    next(error);
  }
};
