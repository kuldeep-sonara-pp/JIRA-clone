import Project from "../model/project.model";
import { Request, Response } from 'express';
import User from "../model/user.model";
import Team from "../model/team.model";
import { recordExists } from "../util/database";
import { findFromToken } from "../util/auth.middleware";
import Task from "../model/task.model";
import { finalizeProjectHandler } from "../util/projectFinlize";
import { FindOptions, Op } from "sequelize";
import { paginate } from "../util/paginate";


export const createProject = async (req: Request, res: Response) : Promise<void> => {
    const { projectName, projectDescription, teamId, startDate, endDate } = req.body; 
    const token = req.cookies.token;
    try {
        console.log("Request Body:", req.body);

        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }
        if (!projectName || !teamId) {
            res.status(400).json({ message: 'Project name and team ID are required' });
            return; 
        }

        const exists = await recordExists(Project, { project_name: projectName, team_id: teamId });

        if (exists) {
            res.status(409).json({ message: 'Project already exists' });
            return; 
        }

        const teamExists = await recordExists(Team, { id: teamId });
        if (!teamExists) {
            res.status(404).json({ message: 'Team not found' });
            return; 
        }

        const teamisInotherProject = await recordExists(Project, { team_id: teamId });
        if (teamisInotherProject) {
            res.status(409).json({ message: 'Team is already in a other project' });
            return; 
        }


        const project = await Project.create({
            projectName: projectName,          
            projectDescription: projectDescription,
            teamId: teamId,
            startDate: startDate || null,     
            endDate: endDate || null          
        });
        res.status(201).json({ project });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
}

export const getProjects = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead'){
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }

        const options: FindOptions = {
            include: [
                {
                    model: Team,
                    as: 'team',
                    include: [
                        { model: User, as: 'teamMembers', attributes: ['id', 'name', 'email'] },
                        { model: User, as: 'teamLead', attributes: ['id', 'name', 'email'] }
                    ]
                }
            ],
            // attributes: ['id', 'projectName', 'projectDescription', 'createdAt', 'updatedAt', 'startDate', 'endDate']
        }
        try {
            const projects = await paginate(Project, options, req);
            if (!projects) {
                res.status(404).json({ message: 'No projects found' });
                return; 
            }

            const processedProjects = projects.data.map((project) => {
                const plainProject = project.get({ plain: true });
    
                if (plainProject.team) {
                    const { teamLead, teamMembers } = plainProject.team;
    
                    // Filter out the teamLead from the teamMembers
                    plainProject.team.teamMembers = teamMembers.filter(
                        (member: { id: number; name: string; email: string }) => member.id !== teamLead?.id
                    );
                }
    
                return plainProject;
            });
            res.status(200).json({ projects,processedProjects });
        } catch (error: unknown) {
            // Check for pagination-related errors
            if (error instanceof Error && (error.message.includes("does not exist") || error.message.includes("invalid"))) {
                res.status(404).json({ message: error.message }); // Custom message for invalid page
            } else {
                res.status(400).json({ message: (error as Error).message }); // General error for pagination
            }
        } 

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
}

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    const projectId = req.params.projectId;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead'){
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }
        const project = await Project.findByPk(projectId, {
            include: [
                {
                    model: Team,
                    as: 'team',
                    include: [
                        { model: User, as: 'teamMembers', attributes: ['id', 'name', 'email'] },
                        { model: User, as: 'teamLead', attributes: ['id', 'name', 'email'] }
                    ]
                }
            ],
            // attributes: ['id', 'projectName', 'projectDescription', 'createdAt', 'updatedAt', 'startDate', 'endDate']
            
        });

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return; 
        }

        // Convert the project to a plain object
        const plainProject = project.get({ plain: true });

        // Process the team to filter out the teamLead from teamMembers
        if (plainProject.team) {
            const { teamLead, teamMembers } = plainProject.team;

            plainProject.team.teamMembers = teamMembers.filter(
                (member: { id: number; name: string; email: string }) => member.id !== teamLead?.id
            );
        }
        res.status(200).json({ plainProject });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
}

export const updateProject = async (req: Request, res: Response): Promise<void> => {
    const { projectName, projectDescription, teamId, startDate, endDate } = req.body; // Add startDate and endDate
    const projectId = req.params.projectId;
    const token = req.cookies.token;
    // console.log("Request body:", req.body);
    
    
    try {
        const decodedToken = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }
        
        interface UpdateData {
            projectName?: string;
            projectDescription?: string;
            teamId?: number;
            startDate?: Date | null;
            endDate?: Date | null;
        }

        const updateData: UpdateData = {};
        if (projectName) updateData.projectName = projectName
        if (projectDescription) updateData.projectDescription = projectDescription;
        if (teamId) updateData.teamId = teamId;
        if (startDate !== undefined) updateData.startDate = startDate || null;
        if (endDate !== undefined) updateData.endDate = endDate || null; 
        
        const [updatedRows] = await Project.update(updateData, { where: { id: projectId } });
      
        if (updatedRows === 0) {
            res.status(404).json({ message: 'Project not found' });
            return; 
        }
        
        res.status(200).json({ message: 'Project updated successfully' });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
};


export const deleteProject = async (req: Request, res: Response): Promise<void> => {
    const projectId = req.params.projectId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }

        const exists = await recordExists(Project, { id:projectId });

        if (!exists) {
            res.status(404).json({ message: 'Project is not exists' });
            return; 
        }

        await Task.destroy({ where: { projectId } });

        await Project.destroy({ where: { id: projectId } });
        res.status(200).json({ message: 'Project deleted successfully' });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
}

export const reopenProject = async (req: Request, res: Response): Promise<void> => {
    const projectId = req.params.projectId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }

        const exists = await recordExists(Project, { id: projectId });

        if (!exists) {
            res.status(404).json({ message: 'Project is not exists' });
            return; 
        }
        await Project.update(
            { endDate: null },
            { where: { id: projectId } }
        );
        res.status(200).json({ message: 'Project reopened successfully' });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
}

export const finalizeProject = async (req: Request, res: Response): Promise<void> => {
    const projectId = req.params.projectId;
    const token = req.cookies.token;
    const decodedToken = findFromToken(token);
    if(decodedToken.roleName !== 'admin'){
        res.status(401).json({ message: 'Unauthorized' });
        return; 
    }
    const result = await finalizeProjectHandler(parseInt(projectId), decodedToken.userId);
    if (result) {
        res.status(result.statusCode).json({ message: result.message });
        return;
    }
    res.status(200).json({ message: 'Project finalized successfully' });
}

export const getProjectsByFilter = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    if (token === undefined) {
        res.status(401).json({ message: 'Unauthorized' });
        return; 
    }
    
    try {
        const decodedToken = findFromToken(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead') {
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }
         
        const { teamId, startDate, endDate, projectName, activeProject = false, closeProject = false, soonToStartProject = false } = req.query;

        const options: FindOptions = {
            where: {},
            include: [],
        };

        // Using a type assertion to allow Op symbols in the where clause
        const whereClause: any = {};

        if (teamId) whereClause['teamId'] = teamId;
        if (startDate && typeof startDate === 'string') whereClause['startDate'] = { [Op.gte]: new Date(startDate) };
        if (endDate && typeof endDate === 'string') whereClause['endDate'] = { [Op.lte]: new Date(endDate) };
        if (projectName) whereClause['projectName'] = { [Op.like]: `%${projectName}%` };

        if (activeProject) {
            console.log('Active Project Filter Applied');
            
            // Log current date for reference
            const currentDate = new Date();
            console.log('Current Date:', currentDate);
        
            whereClause[Op.and] = [
                {
                    // Start date must be in the past
                    startDate: { [Op.lt]: currentDate },
                },
                {
                    [Op.or]: [
                        // End date must be in the future or end date is null
                        { endDate: { [Op.gt]: currentDate } },
                        { endDate: null },
                    ],
                },
            ];
            
            console.log('Where Clause:', JSON.stringify(whereClause, null, 2));
        }
        
        

        // Filter for closed projects
        if (closeProject) {
            whereClause['endDate'] = { [Op.lt]: new Date() }; // endDate has passed
        }

        // Filter for soon to start projects
        if (soonToStartProject) {
            whereClause['startDate'] = { [Op.gte]: new Date() }; // startDate is in the future
        }

        // Combine where clause into options
        options.where = whereClause;

        // Log the options to debug
        console.log('Query options:', options);

        // Fetch projects based on the filter
        try {
            const porject = await paginate(Project, options, req);
            res.status(200).json({ porject });
        } catch (error: unknown) {
            // Check for pagination-related errors
            if (error instanceof Error && (error.message.includes("does not exist") || error.message.includes("invalid"))) {
                res.status(404).json({ message: error.message }); // Custom message for invalid page
            } else {
                res.status(400).json({ message: (error as Error).message }); // General error for pagination
            }
        } 
        
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
