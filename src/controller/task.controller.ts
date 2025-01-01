import { Request, Response } from 'express';
import { findFromToken } from '../util/auth.middleware';
import Task from '../model/task.model';
import { useInflection } from 'sequelize';
import User from '../model/user.model';
import Project from '../model/project.model';
import { dateCheck } from '../util/dateChack';

export const createTask = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { projectId, taskName, taskDescription, status } = req.body;

        const newTask = await Task.create({
            projectId,
            taskName,
            taskDescription,
            createdBy: decodedToken.userId,
            status: status || "To Do"
        });

        return res.status(200).json({ newTask });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while creating the task.' });
    }
};

export const updateAssignedToTaskAndStaus = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const taskId = req.params.taskId;
        if(!taskId){
            return res.status(400).json({ message: 'Task ID is required' });
        }
        
        const { assignedTo, status, startDate, endDate, useProjectStartDate = false, updatecompleteDate = false } = req.body;
        
        const dateError = dateCheck(startDate, endDate);

        if (dateError) {
            return res.status(400).json({ message: dateError });
        }

        const task = await Task.findByPk(taskId, {
            include: [
                {
                    model: Project, 
                    as: 'project', 
                    attributes: ['id','teamId','startDate','endDate'], 
                },
            ],
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const project = await Project.findByPk(task.projectId   );
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if(assignedTo){
            const user = await User.findByPk(assignedTo);
            if (!user || user.teamId !== project.teamId) {
                return res.status(404).json({ message: 'Assigned user is not a member of the project team.' });
            }
            
        }
        
        if (startDate && project.startDate===null) {
            if (useProjectStartDate) {
                project.startDate = startDate;
            } else {
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
            const dateError = dateCheck(
                project.startDate?.toISOString(),
                endDate ? new Date(endDate).toISOString() : undefined
            );
            if (dateError) {
                return res.status(400).json({ message: dateError });
            }
            
            if (updatecompleteDate && status === 'Completed') {
                project.endDate = endDate;
            }
        } else if (endDate && project.endDate !== null && new Date(endDate) > new Date(project.endDate)) {
            // If task end date is later than project end date, throw an error
            return res.status(400).json({ message: 'Task end date cannot be later than project end date.' });
        }
        
        task.assignedTo = assignedTo || task.assignedTo;
        task.status = status || task.status;
        task.startDate = startDate || task.startDate;
        task.endDate = endDate || task.endDate;
        
        await task.save();
        await project.save();
        return res.status(200).json({ message : 'Task updated successfully' });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while assigning user to task.' });
    }
}

export const getTaskByProject = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const projectId = req.params.projectId;
        if(!projectId){
            return res.status(400).json({ message: 'Project ID is required' });
        }
        

        const tasks = await Task.findAll({
            where: {
                projectId
            },
            include: [
                {
                    model: Project, 
                    as: 'project',
                    attributes: ['id', 'projectName', 'projectDescription'],
                },
                {
                    model: User, 
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });

        return res.status(200).json({ tasks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching tasks.' });
    }
}

export const getTaskById = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const taskId = req.params.taskId;

        if(!taskId){
            return res.status(400).json({ message: 'Task ID is required' });
        }

        const task = await Task.findByPk(taskId, {
            include: [
                {
                    model: Project, 
                    as: 'project', 
                    attributes: ['id', 'projectName', 'projectDescription'], 
                },
                {
                    model: User, 
                    as: 'creator', 
                    attributes: ['id', 'name', 'email'], 
                },
            ],
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        return res.status(200).json({ task });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching task.' });
    }
}

export const getAllTasks = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const tasks = await Task.findAll({
            include: [
                {
                    model: Project, 
                    as: 'project', 
                    attributes: ['id', 'projectName', 'projectDescription'], 
                },
                {
                    model: User, 
                    as: 'creator', 
                    attributes: ['id', 'name', 'email'], 
                },
            ],
        });

        return res.status(200).json({ tasks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching tasks.' });
    }
}

export const updateTask = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const taskId = req.params.taskId;
        if(!taskId){
            return res.status(400).json({ message: 'Task ID is required' });
        }
        const { taskName, taskDescription, status } = req.body;

        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.taskName = taskName || task.taskName;
        task.taskDescription = taskDescription || task.taskDescription;
        task.status = status || task.status;

        await task.save();
        return res.status(200).json({ task });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while updating task.' });
    }
}


export const deleteTask = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const taskId = req.params.taskId;
        if(!taskId){
            return res.status(400).json({ message: 'Task ID is required' });
        }
        const task = await Task.findByPk(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.destroy();
        return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while deleting task.' });
    }
}

export const getTaskByUser = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = req.params.userId;
        if(!userId){
            return res.status(400).json({ message: 'User ID is required' });
        }

        const tasks = await Task.findAll({
            where: {
                assignedTo: userId
            },
            include: [
                {
                    model: Project, 
                    as: 'project', 
                    attributes: ['id', 'projectName', 'projectDescription'], 
                },
                {
                    model: User, 
                    as: 'creator', 
                    attributes: ['id', 'name', 'email'], 
                },
            ],
        });

        return res.status(200).json({ tasks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching tasks.' });
    }
}