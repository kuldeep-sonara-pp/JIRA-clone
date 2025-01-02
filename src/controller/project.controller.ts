import Project from "../model/project.model";
import { Request, Response } from 'express';
import User from "../model/user.model";
import Team from "../model/team.model";
import { recordExists } from "../util/database";
import { findFromToken } from "../util/auth.middleware";
import Task from "../model/task.model";

export const createProject = async (req: Request, res: Response) : Promise<void> => {
    const { projectName, projectDescription, teamId, startDate, endDate } = req.body; 
    const token = req.cookies.token;
    try {
        console.log("Request Body:", req.body);

        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            res.status(401).json({ message: 'Token is not found' });
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
            res.status(401).json({ message: 'Token is not found' });
            return; 
        }
        const projects = await Project.findAll({
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
            // attributes: ['id', 'projectName', 'projectDescription' 'createdAt', 'updatedAt', 'startDate', 'endDate']
        });

        if (!projects || projects.length === 0) {
            res.status(404).json({ message: 'No projects found' });
            return; 
        }

        // Post-process to filter out the teamLead from teamMembers
        const processedProjects = projects.map((project) => {
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
        res.status(200).json({ processedProjects });
        return; 
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
            res.status(401).json({ message: 'Token is not found' });
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
            res.status(401).json({ message: 'Token is not found' });
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
            res.status(401).json({ message: 'Token is not found' });
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
            res.status(401).json({ message: 'Token is not found' });
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

export const  finalizeProject = async (req: Request, res: Response): Promise<void> => {
    const projectId = req.params.projectId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            res.status(401).json({ message: 'Token is not found' });
            return; 
        }

        const exists = await recordExists(Project, { id: projectId });

        if (!exists) {
            res.status(404).json({ message: 'Project is not exists' });
            return; 
        }

        
        await Project.update(
            { endDate: new Date() },
            { where: { id: projectId } }
        );
        res.status(200).json({ message: 'Project finalized successfully' });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
}