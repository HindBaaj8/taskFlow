const Project = require('../model/Project');

/**
 * @desc    Create a project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, category } = req.body;
    const project = await Project.create({
      name, description, startDate, endDate, status, category,
      owner: req.user.id,
      members: [req.user.id],
    });
    res.status(201).json({ message: 'Project created', project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all projects (with filters)
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res) => {
  try {
    const { name, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};

    // Non-admin sees only their projects
    if (req.user.role !== 'admin') {
      query.$or = [{ owner: req.user.id }, { members: req.user.id }];
    }

    if (name) query.name = { $regex: name, $options: 'i' };
    if (status) query.status = status;
    if (startDate) query.startDate = { $gte: new Date(startDate) };
    if (endDate) query.endDate = { $lte: new Date(endDate) };

    const skip = (page - 1) * limit;
    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('category', 'name color')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({ projects, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('category', 'name color');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.includes(req.user.id) || project.owner === req.user.id;
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private (owner or admin)
 */
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the project owner can update it' });
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ message: 'Project updated', project: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (owner or admin)
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the project owner can delete it' });
    }

    await project.deleteOne();
    res.status(200).json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Add member to project
 * @route   PATCH /api/projects/:id/members
 * @access  Private (owner or admin)
 */
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.members.includes(userId)) {
      return res.status(409).json({ message: 'User already a member' });
    }

    project.members.push(userId);
    await project.save();
    res.status(200).json({ message: 'Member added', project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject, addMember };