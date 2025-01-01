import Project from "../model/project.model";
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from "../model/user.model";
import Team from "../model/team.model";
import { recordExists } from "../util/database";
import { findFromToken } from "../util/auth.middleware";
import Task from "../model/task.model";

export const createProject = async (req: Request, res: Response) => {
    const { projectName, projectDescription, teamId, startDate, endDate } = req.body; 
    const token = req.cookies.token;
    try {
        console.log("Request Body:", req.body);

        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!projectName || !teamId) {
            return res.status(400).json({ message: 'Project name and team ID are required' });
        }

        const exists = await recordExists(Project, { project_name: projectName, team_id: teamId });

        if (exists) {
            return res.status(409).json({ message: 'Project already exists' });
        }

        const project = await Project.create({
            projectName: projectName,          
            projectDescription: projectDescription,
            teamId: teamId,
            startDate: startDate || null,     
            endDate: endDate || null          
        });
        return res.status(201).json({ project });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const getProjects = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead'){
            return res.status(401).json({ message: 'Unauthorized' });
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
            return res.status(404).json({ message: 'No projects found' });
        }

        // Post-process to filter out the teamLead from teamMembers
        const processedProjects = projects.map((project) => {
            const plainProject = project.get({ plain: true });

            if (plainProject.team) {
                const { teamLead, teamMembers } = plainProject.team;

                // Filter out the teamLead from the teamMembers
                plainProject.team.teamMembers = teamMembers.filter(
                    (member: any) => member.id !== teamLead?.id
                );
            }

            return plainProject;
        });
        return res.status(200).json({ processedProjects });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const getProjectById = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    const projectId = req.params.projectId;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead'){
            return res.status(401).json({ message: 'Unauthorized' });
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
            return res.status(404).json({ message: 'Project not found' });
        }

        // Convert the project to a plain object
        const plainProject = project.get({ plain: true });

        // Process the team to filter out the teamLead from teamMembers
        if (plainProject.team) {
            const { teamLead, teamMembers } = plainProject.team;

            plainProject.team.teamMembers = teamMembers.filter(
                (member: any) => member.id !== teamLead?.id
            );
        }
        return res.status(200).json({ plainProject });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateProject = async (req: Request, res: Response) => {
    const { projectName, projectDescription, teamId, startDate, endDate } = req.body; // Add startDate and endDate
    const projectId = req.params.projectId;
    const token = req.cookies.token;
    // console.log("Request body:", req.body);
    
    
    try {
        const decodedToken = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const updateData: any = {};
        if (projectName) updateData.projectName = projectName
        if (projectDescription) updateData.projectDescription = projectDescription;
        if (teamId) updateData.teamId = teamId;
        if (startDate !== undefined) updateData.startDate = startDate || null;
        if (endDate !== undefined) updateData.endDate = endDate || null; 
        
        const [updatedRows] = await Project.update(updateData, { where: { id: projectId } });
      
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        return res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


export const deleteProject = async (req: Request, res: Response) => {
    const projectId = req.params.projectId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const exists = await recordExists(Project, { id:projectId });

        if (!exists) {
            return res.status(404).json({ message: 'Project is not exists' });
        }

        await Task.destroy({ where: { projectId } });

        await Project.destroy({ where: { id: projectId } });
        return res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const reopenProject = async (req: Request, res: Response) => {
    const projectId = req.params.projectId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const exists = await recordExists(Project, { id: projectId });

        if (!exists) {
            return res.status(404).json({ message: 'Project is not exists' });
        }
        await Project.update(
            { endDate: null },
            { where: { id: projectId } }
        );
        return res.status(200).json({ message: 'Project reopened successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}