import { Request, Response } from 'express';
import { findFromToken } from '../util/auth.middleware';
import Task from '../model/task.model';
// import { useInflection } from 'sequelize';
import User from '../model/user.model';
import Project from '../model/project.model';
import { dateCheck } from '../util/dateChack';

export const createTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            res.status(401).json({ message: 'Token is not found' });
            return; 
        }

        const { projectId, taskName, taskDescription, status } = req.body;

        const newTask = await Task.create({
            projectId,
            taskName,
            taskDescription,
            createdBy: decodedToken.userId,
            status: status || "To Do"
        });

        res.status(200).json({ newTask });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the task.' });
        return; 
    }
};

export const updateAssignedToTaskAndStaus = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            res.status(401).json({ message: 'Token is not found' });
            return; 
        }

        const taskId = req.params.taskId;
        if(!taskId){
            res.status(400).json({ message: 'Task ID is required' });
            return; 
        }
        
        const { assignedTo, status, startDate, endDate, useProjectStartDate = false, updatecompleteDate = false } = req.body;
        
        const dateError = dateCheck(startDate, endDate);

        if (dateError) {
            res.status(400).json({ message: dateError });
            return; 
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
            res.status(404).json({ message: 'Task not found' });
            return; 
        }
        const project = await Project.findByPk(task.projectId   );
        
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return; 
        }
        if(assignedTo){
            const user = await User.findByPk(assignedTo);
            if (!user || user.teamId !== project.teamId) {
                res.status(404).json({ message: 'Assigned user is not a member of the project team.' });
                return; 
            }
            
        }
        
        if (startDate && project.startDate===null) {
            if (useProjectStartDate) {
                project.startDate = startDate;
            } else {
                // an error
                // Otherw;ise, return 
                res.status(400).json({ message: 'Task start date cannot be earlier than project start date.' });
                return; 
            }
        }

        if (endDate && project.endDate === null) {
            // Check project start date
            if (project.startDate === null) {
                res.status(400).json({ message: 'Project start date is not defined.' });
                return; 
            }
        
            // Validate the relationship between task start and end dates
            const dateError = dateCheck(
                project.startDate?.toISOString(),
                endDate ? new Date(endDate).toISOString() : undefined
            );
            if (dateError) {
                res.status(400).json({ message: dateError });
                return; 
            }
            
            if (updatecompleteDate && status === 'Completed') {
                project.endDate = endDate;
            }
        } else if (endDate && project.endDate !== null && new Date(endDate) > new Date(project.endDate)) {
            // If task end date is later than project end date, throw an error
            res.status(400).json({ message: 'Task end date cannot be later than project end date.' });
            return; 
        }
        
        task.assignedTo = assignedTo || task.assignedTo;
        task.status = status || task.status;
        task.startDate = startDate || task.startDate;
        task.endDate = endDate || task.endDate;
        
        await task.save();
        await project.save();
        res.status(200).json({ message : 'Task updated successfully' });
        return; 
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while assigning user to task.' });
        return; 
    }
}

export const getTaskByProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            res.status(401).json({ message: 'Token is not found' });
            return; 
        }

        const projectId = req.params.projectId;
        if(!projectId){
            res.status(400).json({ message: 'Project ID is required' });
            return; 
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

        res.status(200).json({ tasks });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching tasks.' });
        return; 
    }
}

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            res.status(401).json({ message: 'Token is not found' });
            return; 
        }

        const taskId = req.params.taskId;

        if(!taskId){
            res.status(400).json({ message: 'Task ID is required' });
            return; 
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
            res.status(404).json({ message: 'Task not found' });
            return; 
        }

        res.status(200).json({ task });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching task.' });
        return; 
    }
}

export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            res.status(401).json({ message: 'Token is not found' });
            return; 
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

        res.status(200).json({ tasks });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching tasks.' });
        return; 
    }
}

export const updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            res.status(401).json({ message: 'Token is not found' });
            return; 
        }

        const taskId = req.params.taskId;
        if(!taskId){
            res.status(400).json({ message: 'Task ID is required' });
            return; 
        }
        const { taskName, taskDescription, status } = req.body;

        const task = await Task.findByPk(taskId);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return; 
        }

        task.taskName = taskName || task.taskName;
        task.taskDescription = taskDescription || task.taskDescription;
        task.status = status || task.status;

        await task.save();
        res.status(200).json({ task });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating task.' });
        return; 
    }
}


export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            res.status(401).json({ message: 'Token is not found' });
            return; 
        }

        const taskId = req.params.taskId;
        if(!taskId){
            res.status(400).json({ message: 'Task ID is required' });
            return; 
        }
        const task = await Task.findByPk(taskId);

        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return; 
        }

        await task.destroy();
        res.status(200).json({ message: 'Task deleted successfully' });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting task.' });
        return; 
    }
}

export const getTaskByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies.token;
        const decodedToken = findFromToken(token);

        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== "teamLead") {
            res.status(401).json({ message: 'Token is not found' });
            return; 
        }

        const userId = req.params.userId;
        if(!userId){
            res.status(400).json({ message: 'User ID is required' });
            return; 
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

        res.status(200).json({ tasks });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching tasks.' });
        return; 
    }
}