import jwt from "jsonwebtoken";
import Team from "../model/team.model";
import { Request, Response } from 'express';
import User from "../model/user.model";

interface TokenPayload {
    userId: number; // Adjust as necessary
    roleName: string;
    teamId?: number; // Optional if not always provided
}

const findFromToken = (token: string) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error('Secret key is not defined in environment variables');
    }

    const decodedToken = jwt.verify(token, secretKey) as TokenPayload;
    return decodedToken;
};

export const createTeam = async (req: Request, res: Response) => {
    
    const { teamName, teamLeadId } = req.body;
    console.log("teamName :", teamName);
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const team = await Team.create({
            teamName,
            teamLeadId
        });
        await User.update(
            { teamId: team.id }, // Set the new team ID
            { where: { id: teamLeadId } } // Find the user by teamLeadId
        );
        return res.status(201).json({ massage: 'Team created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const getTeam = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead'){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const team = await Team.findAll({
            include: [
                { model: User, as: 'teamLead', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'teamMembers', attributes: ['id', 'name', 'email'] }
            ],
        });
        return res.status(200).json(team);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};