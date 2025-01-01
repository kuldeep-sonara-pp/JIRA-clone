"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskByUser = exports.deleteTask = exports.updateTask = exports.getAllTasks = exports.getTaskById = exports.getTaskByProject = exports.updateAssignedToTaskAndStaus = exports.createTask = void 0;
const auth_middleware_1 = require("../util/auth.middleware");
const task_model_1 = __importDefault(require("../model/task.model"));
const user_model_1 = __importDefault(require("../model/user.model"));
const project_model_1 = __importDefault(require("../model/project.model"));
const dateChack_1 = require("../util/dateChack");
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { projectId, taskName, taskDescription, status } = req.body;
        const newTask = yield task_model_1.default.create({
            projectId,
            taskName,
            taskDescription,
            createdBy: decodedToken.userId,
            status: status || "To Do"
        });
        return res.status(200).json({ newTask });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while creating the task.' });
    }
});
exports.createTask = createTask;
const updateAssignedToTaskAndStaus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = req.cookies.token;
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const taskId = req.params.taskId;
        if (!taskId) {
            return res.status(400).json({ message: 'Task ID is required' });
        }
        const { assignedTo, status, startDate, endDate, useProjectStartDate = false, updatecompleteDate = false } = req.body;
        const dateError = (0, dateChack_1.dateCheck)(startDate, endDate);
        if (dateError) {
            return res.status(400).json({ message: dateError });
        }
        const task = yield task_model_1.default.findByPk(taskId, {
            include: [
                {
                    model: project_model_1.default,
                    as: 'project',
                    attributes: ['id', 'teamId', 'startDate', 'endDate'],
                },
            ],
        });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const project = yield project_model_1.default.findByPk(task.projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (assignedTo) {
            const user = yield user_model_1.default.findByPk(assignedTo);
            if (!user || user.teamId !== project.teamId) {
                return res.status(404).json({ message: 'Assigned user is not a member of the project team.' });
            }
        }
        if (startDate && project.startDate === null) {
            if (useProjectStartDate) {
                project.startDate = startDate;
            }
            else {
                // Otherwise, return an error
                return res.status(400).json({ message: 'Task start date cannot be earlier than project start date.' });
            }
        }
        if (endDate && project.endDate === null) {
            // Check project start date
            if (project.startDate === null) {
                return res.status(400).json({ message: 'Project start date is not defined.' });
            }
            // Validate the relationship between task start and end dates
            const dateError = (0, dateChack_1.dateCheck)((_a = project.startDate) === null || _a === void 0 ? void 0 : _a.toISOString(), endDate ? new Date(endDate).toISOString() : undefined);
            if (dateError) {
                return res.status(400).json({ message: dateError });
            }
            if (updatecompleteDate && status === 'Completed') {
                project.endDate = endDate;
            }
        }
        else if (endDate && project.endDate !== null && new Date(endDate) > new Date(project.endDate)) {
            // If task end date is later than project end date, throw an error
            return res.status(400).json({ message: 'Task end date cannot be later than project end date.' });
        }
        task.assignedTo = assignedTo || task.assignedTo;
        task.status = status || task.status;
        task.startDate = startDate || task.startDate;
        task.endDate = endDate || task.endDate;
        yield task.save();
        yield project.save();
        return res.status(200).json({ message: 'Task updated successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while assigning user to task.' });
    }
});
exports.updateAssignedToTaskAndStaus = updateAssignedToTaskAndStaus;
const getTaskByProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const projectId = req.params.projectId;
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }
        const tasks = yield task_model_1.default.findAll({
            where: {
                projectId
            },
            include: [
                {
                    model: project_model_1.default,
                    as: 'project',
                    attributes: ['id', 'projectName', 'projectDescription'],
                },
                {
                    model: user_model_1.default,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });
        return res.status(200).json({ tasks });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching tasks.' });
    }
});
exports.getTaskByProject = getTaskByProject;
const getTaskById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const taskId = req.params.taskId;
        if (!taskId) {
            return res.status(400).json({ message: 'Task ID is required' });
        }
        const task = yield task_model_1.default.findByPk(taskId, {
            include: [
                {
                    model: project_model_1.default,
                    as: 'project',
                    attributes: ['id', 'projectName', 'projectDescription'],
                },
                {
                    model: user_model_1.default,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        return res.status(200).json({ task });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching task.' });
    }
});
exports.getTaskById = getTaskById;
const getAllTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const tasks = yield task_model_1.default.findAll({
            include: [
                {
                    model: project_model_1.default,
                    as: 'project',
                    attributes: ['id', 'projectName', 'projectDescription'],
                },
                {
                    model: user_model_1.default,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });
        return res.status(200).json({ tasks });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching tasks.' });
    }
});
exports.getAllTasks = getAllTasks;
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const taskId = req.params.taskId;
        if (!taskId) {
            return res.status(400).json({ message: 'Task ID is required' });
        }
        const { taskName, taskDescription, status } = req.body;
        const task = yield task_model_1.default.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        task.taskName = taskName || task.taskName;
        task.taskDescription = taskDescription || task.taskDescription;
        task.status = status || task.status;
        yield task.save();
        return res.status(200).json({ task });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while updating task.' });
    }
});
exports.updateTask = updateTask;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const taskId = req.params.taskId;
        if (!taskId) {
            return res.status(400).json({ message: 'Task ID is required' });
        }
        const task = yield task_model_1.default.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        yield task.destroy();
        return res.status(200).json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while deleting task.' });
    }
});
exports.deleteTask = deleteTask;
const getTaskByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const tasks = yield task_model_1.default.findAll({
            where: {
                assignedTo: userId
            },
            include: [
                {
                    model: project_model_1.default,
                    as: 'project',
                    attributes: ['id', 'projectName', 'projectDescription'],
                },
                {
                    model: user_model_1.default,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });
        return res.status(200).json({ tasks });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching tasks.' });
    }
});
exports.getTaskByUser = getTaskByUser;
