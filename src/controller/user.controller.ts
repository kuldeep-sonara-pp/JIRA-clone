import User from '../model/user.model';
import Roles from '../model/rols.model';
import Task from '../model/task.model';
import ProjectSnapshot from '../model/projectSnapshots.model';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import dotenv from "dotenv";
import { recordExists } from '../util/database';
import { findFromToken } from '../util/auth.middleware';
import { chackUserStatus } from '../util/userUtil';
import Team from '../model/team.model';

import { paginate } from '../util/paginate';
import { FindOptions } from 'sequelize';

import { Op } from "sequelize"; // Add this import



dotenv.config();

interface TokenPayload {
    userId: number; // Adjust as necessary
    roleName: string;
    teamId?: number; // Optional if not always provided
}


const generateToken = (payload: TokenPayload) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error('Secret key is not defined in environment variables');
    }

    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Roles, as: 'role' }],
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if(user.status === 'inactive'){
            res.status(401).json({ message: 'not autorize to login' });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            
            return;
        }

        const roleName = user.role ? user.role.dataValues.roleName : null;
        const teamId = user.teamId;

        const tokenPayload: TokenPayload = {
            userId: user.id,
            roleName: roleName || 'guest',
            teamId: teamId !== null ? teamId : undefined,
        };

        const token = generateToken(tokenPayload);
        console.log("token",token);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
        });

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    const { name, email, password, roleId, teamId, status= 'active' } = req.body;

    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided.' });
        return; 
    }
    try{
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            res.status(403).json({ message: 'Forbidden: You do not have permission to create a user.' });
            return; 
        } 
        const userExists = await recordExists(User, { name, email});
        if (userExists) {
            res.status(409).json({ message: 'user is exist' });
            return; 
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name,email, password: hashedPassword, roleId, teamId, status });
        res.status(201).json(newUser);
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }


};


export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return; 
    }

    try {
        const userId = req.params.userId;
        if (!userId) {
            res.status(400).json({ message: 'Bad Request: User ID is required.' });
            return; 
        }

        const user = await User.findByPk(userId, {
            include: [{
                model: Roles,
                as: 'role'
            }]
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return; 
        }

        res.status(200).json({ user });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return; 
    }

    try {
        const decodedToken: TokenPayload = findFromToken(token);
        
        // Check the roleName property instead of comparing the entire token
        if (decodedToken.roleName !== 'admin') {
            res.status(403).json({ message: 'Forbidden: You do not have permission to create a user.' });
            return; 
        }


        const options : FindOptions = {
            include : [{
                model: Roles,
                as: 'role'
            }]
        } 

        try {
            const UserPagination = await paginate(User, options, req);
            res.status(200).json({ UserPagination });
        } catch (error: unknown) {
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
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return; 
    }

    try {
        const decodedToken: TokenPayload = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            res.status(403).json({ message: 'Forbidden: You do not have permission to update a user.' });
            return; 
        }

        const userId = Number(req.params.userId); // Ensure userId is an integer
        if (isNaN(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return; 
        }

        const { name, email, roleId, teamId } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return; 
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.id !== userId) {
            res.status(400).json({ message: 'Email already in use by another user.' });
            return; 
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.roleId = roleId || user.roleId;
        user.teamId = teamId || user.teamId;

        await user.save();
        res.status(200).json({ user });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
};


export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return; 
    }

    try {
        const decodedToken: TokenPayload = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            res.status(403).json({ message: 'Forbidden: You do not have permission to delete a user.' });
            return; 
        }

        const userId = req.params.userId;

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return; 
        }

        const userActive = await chackUserStatus(user.id);
        if (userActive) {
            res.status(400).json({ message: 'User is active! So plase inactive first tha return' });
            return; 
        }

        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
};


export const chnageStataus = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return; 
    }

    try {
        const decodedToken: TokenPayload = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            res.status(403).json({ message: 'Forbidden: You do not have permission to update a user.' });
            return; 
        }

        const userId = req.params.userId;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return; 
        }

        const userActive = await chackUserStatus(user.id);
        if (userActive) {

            await Task.update({ assignedTo: null }, { where: { assignedTo:userId } });

            await Team.update({ teamLeadId: null }, { where: { teamLeadId: userId } });

            await ProjectSnapshot.update({status: 'inactive'}, {where: {teamMemberId: userId}});

            await User.update({ status: 'inactive' }, { where: { id: userId } });
            res.status(200).json({ message: 'User inactivated successfully' });
            return; 
        }
        await ProjectSnapshot.update({status: 'active'}, {where: {teamMemberId: userId}});
        await User.update({ status: 'active' }, { where: { id: userId } });
        res.status(200).json({ message: 'User activated successfully' });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
}


export const getUserByFilter = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return; 
    }

    try {
        const decodedToken: TokenPayload = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            res.status(403).json({ message: 'Forbidden: You do not have permission to view users.' });
            return; 
        }

        const { name, email, roleId, teamId, status } = req.query;

        // Create the options object for the query with a properly defined where clause
        const options: FindOptions = {
            where: {} 
        };

        const whereClause: FindOptions['where'] = {};

        // Use LIKE for partial matching with name and email
        if (typeof name === 'string') {
            whereClause.name = { [Op.like]: `%${name}%` }; // Use LIKE for partial matching in name
        }
        if (typeof email === 'string') {
            whereClause.email = { [Op.like]: `%${email}%` }; // Use LIKE for partial matching in email
        }
        if (typeof roleId === 'string') {
            whereClause.roleId = roleId; 
        }
        if (typeof teamId === 'string') {
            whereClause.teamId = teamId;
        }
        if (typeof status === 'string') {
            whereClause.status = status;
        }

        options.where = whereClause; // Assign the constructed where clause to the options

        // Handle pagination and filtering
        try {
            const usersFilterPagination = await paginate(User, options, req);
            res.status(200).json({ usersFilterPagination });
        } catch (error: unknown) {
            // Check for pagination-related errors
            if (error instanceof Error && (error.message.includes("does not exist") || error.message.includes("invalid"))) {
                res.status(404).json({ message: error.message }); // Custom message for invalid page
            } else {
                res.status(400).json({ message: (error as Error).message }); // General error for pagination
            }
        } 

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};