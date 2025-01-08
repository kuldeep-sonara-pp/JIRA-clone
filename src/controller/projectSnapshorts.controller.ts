import Project from "../model/project.model";
import ProjectSnapshot from "../model/projectSnapshots.model";
import User from "../model/user.model";
import { Request, Response } from 'express';
import { findFromToken } from "../util/auth.middleware";
import { FindOptions } from "sequelize";
import { paginate } from "../util/paginate";

export const createProjectSnapshot = async (projectID: number, finalizedByUserId: number): Promise<void> => {
    try {
        const project = await Project.findByPk(projectID);
        if (!project) {
            throw new Error(`Project with ID ${projectID} not found`);
        }

        const teamMembers = await User.findAll({
            where: { teamId: project.teamId },
            attributes: ['id', 'roleId', 'status'],
        });

        const projectSnapshotData = teamMembers.map((member) => ({
            projectId: projectID,
            teamMemberId: member.id,
            role: member.roleId ? member.roleId.toString() : 'No Role',
            status: member.status,
            completedAt: new Date(),
            finalizedByUserId,
        }));

        console.log('ProjectSnapshot Model:', ProjectSnapshot);

        if (projectSnapshotData.length > 0) {
            await ProjectSnapshot.bulkCreate(projectSnapshotData);
            console.log(`Snapshot created successfully for project ID: ${projectID} by user ID: ${finalizedByUserId}`);
        } else {
            console.log(`No team members found for project ID: ${projectID}. No snapshot created.`);
        }
    } catch (error) {
        // Enhanced error handling
        if (error instanceof Error) {
            console.error(`Error creating snapshot for project ID ${projectID}:`, error.message);
        } else {
            console.error(`Error creating snapshot for project ID ${projectID}:`, error);
        }
        throw error; // Re-throw error after logging
    }
};


export const getProjectSnapshots = async (req: Request, res:Response): Promise<void> => {
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'manager'){
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }

        const options : FindOptions = {
            include: [
                {
                    model: User,
                    as: 'teamMember',
                    attributes: ['name', 'email'],
                },
                {
                    model: Project,
                    as: 'project',
                }
            ],
        }

        try {
            const projectSnapshot = await paginate(ProjectSnapshot, options, req);
            res.status(200).json({ projectSnapshot });
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
    }
}

export const getSnapshotsByFilter = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'manager'){
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }
        const { projectId, teamMemberId, status } = req.query;

        // Build the filter object dynamically
        const filters: Record<string, string | number> = {};
        if (projectId) filters.projectId = projectId as string;
        if (teamMemberId) filters.teamMemberId = teamMemberId as string;
        if (status) filters.status = status as string;

        // Query the database using the filters
        const snapshots = await ProjectSnapshot.findAll({ where: filters, include: [
            {
                model: User,
                as: 'teamMember',
                attributes: ['name', 'email'],
            },
            {
                model: Project,
                as: 'project',
            }
        ], });

        // Send the filtered snapshots as the response
        res.status(200).json({ success: true, data: snapshots });
    } catch (error) {
        console.error('Error fetching snapshots:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
