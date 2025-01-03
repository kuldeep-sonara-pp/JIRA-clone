import Roles from "../model/rols.model";
import { Request, Response } from 'express';
import { recordExists } from "../util/database";
import { findFromToken } from "../util/auth.middleware";

export const createRole = async (req: Request, res: Response) : Promise<void> => {
    const { roleName } = req.body;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }
        const exists = await recordExists(Roles, { role_name: roleName }); // Adjust the criteria if necessary

        if (exists) {
            res.status(409).json({ message: 'Role already exists' });
            return; 
        }
        const role = await Roles.create({ roleName });
        res.status(201).json({ role });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    } 
}


export const getRoles = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }
        const roles = await Roles.findAll();
        res.status(200).json({ roles });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
}


export const updateRole = async (req: Request, res: Response): Promise<void> => {
    const { roleName } = req.body;
    const id  = req.params.roleId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }
        const exists = await recordExists(Roles, { id });

        if (!exists) {
            res.status(404).json({ message: 'Role not found' });
            return; 
        }

        const sameRole = await recordExists(Roles, { roleName });
        if (sameRole) {
            res.status(409).json({ message: 'Role already exists' });
            return; 
        }

        await Roles.update({ roleName }, { where: { id } });
        res.status(200).json({ message: 'Role updated successfully' });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
}

export const deleteRole = async (req: Request, res: Response) : Promise<void> => {
    const id = req.params.roleId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            res.status(401).json({ message: 'Unauthorized' });
            return; 
        }
        const exists = await recordExists(Roles, { id });

        if (!exists) {
            res.status(404).json({ message: 'Role not found' });
            return; 
        }

        await Roles.destroy({ where: { id } });
        res.status(200).json({ message: 'Role deleted successfully' });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
}

