const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
} = require('../controllers/task.controller');

const router = express.Router();

router.use(authenticate);

// GET /api/tasks – Fetch all tasks (Admin only).
// POST /api/tasks – Create a new task (User and Admin).
// GET /api/tasks/
// – Get details of a specific task by its id (User and Admin).
// PUT /api/tasks/
// – Update a task by its id (Admin only).
// DELETE /api/tasks/
// – Delete a task by its id (Admin only).


router.post('/', authenticate, authorize(['user', 'admin']), createTask);
router.get('/', authenticate, authorize(['admin']), getTasks);
router.get('/:taskId', authenticate, authorize(['user', 'admin']), getTaskById);
router.put('/', authenticate, authorize(['admin']), updateTask);
router.delete('/:taskId', authenticate, authorize(['admin']), deleteTask);

module.exports = router;