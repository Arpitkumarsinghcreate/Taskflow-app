import { Task, Project, User, Notification } from '../models/index.js';

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
export const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignee } = req.query;

    const filter = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
      .populate('assignee', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName')
      .populate('comments.author', 'firstName lastName avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/projects/:projectId/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, status, dueDate, assignee, tags } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    if (assignee) {
      const userExists = await User.findById(assignee);
      if (!userExists) {
        return res.status(404).json({ success: false, message: 'Assignee user not found' });
      }
    }

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      assignee,
      tags,
      project: projectId,
      createdBy: req.user._id
    });

    await task.populate([
      { path: 'assignee', select: 'firstName lastName email avatar' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);

    // Notification for assignee
    if (assignee && assignee.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: assignee,
        sender: req.user._id,
        type: 'task_assigned',
        message: `${req.user.firstName} assigned you "${title}"`,
        link: `/projects/${projectId}`,
        relatedProject: projectId,
        relatedTask: task._id
      });
    }

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Permission check: Admin OR Creator OR Assignee
    const isAdmin = req.user.role === 'admin';
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'assignee', 'tags'];
    const oldStatus = task.status;
    const oldAssignee = task.assignee?.toString();

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    // completedAt logic
    if (task.isModified('status')) {
      if (task.status === 'done' && !task.completedAt) {
        task.completedAt = new Date();
      } else if (task.status !== 'done') {
        task.completedAt = undefined;
      }
    }

    await task.save();
    await task.populate([
      { path: 'assignee', select: 'firstName lastName email avatar' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);

    // Notifications
    // 1. Task Assigned
    if (task.assignee && task.assignee.toString() !== oldAssignee && task.assignee.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: task.assignee,
        sender: req.user._id,
        type: 'task_assigned',
        message: `${req.user.firstName} assigned you "${task.title}"`,
        link: `/projects/${task.project}`,
        relatedProject: task.project,
        relatedTask: task._id
      });
    }

    // 2. Task Completed
    if (task.status === 'done' && oldStatus !== 'done' && task.createdBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: task.createdBy,
        sender: req.user._id,
        type: 'task_completed',
        message: `${req.user.firstName} completed task "${task.title}"`,
        link: `/projects/${task.project}`,
        relatedProject: task.project,
        relatedTask: task._id
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Permission: Admin OR Creator
    const isAdmin = req.user.role === 'admin';
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.comments.push({
      author: req.user._id,
      text,
      createdAt: new Date()
    });

    await task.save();
    await task.populate('comments.author', 'firstName lastName avatar');

    // Notification for task creator or assignee if they didn't write the comment
    const recipients = new Set();
    if (task.createdBy.toString() !== req.user._id.toString()) recipients.add(task.createdBy.toString());
    if (task.assignee && task.assignee.toString() !== req.user._id.toString()) recipients.add(task.assignee.toString());

    for (const recipientId of recipients) {
      await Notification.create({
        recipient: recipientId,
        sender: req.user._id,
        type: 'comment_added',
        message: `${req.user.firstName} commented on "${task.title}"`,
        link: `/projects/${task.project}`,
        relatedProject: task.project,
        relatedTask: task._id
      });
    }

    res.status(200).json({ success: true, data: task.comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's assigned tasks
// @route   GET /api/tasks/my
// @access  Private
export const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate({
        path: 'project',
        select: 'name color members',
        populate: {
          path: 'members.user',
          select: 'firstName lastName email'
        }
      })
      .populate('createdBy', 'firstName lastName')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};
