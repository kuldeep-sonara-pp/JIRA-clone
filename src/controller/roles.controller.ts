import jwt from "jsonwebtoken";
import Roles from "../model/rols.model";
import { Request, Response } from 'express';
import { recordExists } from "../util/database";


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

export const createRole = async (req: Request, res: Response) => {
    const { roleName } = req.body;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const exists = await recordExists(Roles, { role_name: roleName }); // Adjust the criteria if necessary

        if (exists) {
            return res.status(409).json({ message: 'Role already exists' });
        }
        const role = await Roles.create({ roleName });
        return res.status(201).json({ role });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    } 
}


export const getRoles = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const roles = await Roles.findAll();
        return res.status(200).json({ roles });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


export const updateRole = async (req: Request, res: Response) => {
    const { roleName } = req.body;
    const id  = req.params.roleId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const exists = await recordExists(Roles, { id });

        if (!exists) {
            return res.status(404).json({ message: 'Role not found' });
        }

        const role = await Roles.update({ roleName }, { where: { id } });
        return res.status(200).json({ role });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteRole = async (req: Request, res: Response) => {
    const id = req.params.roleId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const exists = await recordExists(Roles, { id });

        if (!exists) {
            return res.status(404).json({ message: 'Role not found' });
        }

        await Roles.destroy({ where: { id } });
        return res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}