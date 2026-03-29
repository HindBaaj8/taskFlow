const axios = require('axios');
const serviceClient = require('../utils/serviceClient');

const getDashboard = async (req, res) => {
  try {
    const [projectsRes, tasksRes] = await Promise.all([
      serviceClient.get('/api/projects', { headers: { Authorization: req.headers.authorization } }),
      serviceClient.get('/api/tasks', { headers: { Authorization: req.headers.authorization } })
    ]);
    
    const stats = {
      totalProjects: projectsRes.data.length,
      openTasks: tasksRes.data.filter(t => !t.completed).length,
      completedTasks: tasksRes.data.filter(t => t.completed).length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
};

const getProjectReport = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const [projectRes, tasksRes] = await Promise.all([
      serviceClient.get(`/api/projects/${projectId}`, { headers: { Authorization: req.headers.authorization } }),
      serviceClient.get(`/api/tasks?projectId=${projectId}`, { headers: { Authorization: req.headers.authorization } })
    ]);
    
    const report = {
      project: projectRes.data,
      tasks: tasksRes.data,
      stats: {
        totalTasks: tasksRes.data.length,
        completed: tasksRes.data.filter(t => t.completed).length,
        pending: tasksRes.data.filter(t => !t.completed).length
      }
    };
    
    res.json(report);
  } catch (error) {
    console.error('Project report error:', error.message);
    res.status(500).json({ message: 'Failed to fetch project report', error: error.message });
  }
};

const getWorkloadReport = async (req, res) => {
  try {
    const tasksRes = await serviceClient.get('/api/tasks', { headers: { Authorization: req.headers.authorization } });
    const userTasks = tasksRes.data.filter(task => task.assignedTo._id === req.user.id);
    
    const workload = {
      assignedTasks: userTasks.length,
      pending: userTasks.filter(t => !t.completed).length,
      overdue: userTasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length
    };
    
    res.json(workload);
  } catch (error) {
    console.error('Workload report error:', error.message);
    res.status(500).json({ message: 'Failed to fetch workload report', error: error.message });
  }
};

module.exports = { getDashboard, getProjectReport, getWorkloadReport };
