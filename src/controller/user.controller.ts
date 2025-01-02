import User from '../model/user.model';
import Roles from '../model/rols.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import dotenv from "dotenv";
import { recordExists } from '../util/database';
import { findFromToken } from '../util/auth.middleware';
import { chackUserStatus } from '../util/userUtil';


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
    const { name, email, password, roleId, teamId } = req.body;

    if (!token) {
        res.status(401).json({ message: 'Token is not found: No token provided.' });
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
        const newUser = await User.create({ name,email, password: hashedPassword, roleId, teamId });
        res.status(201).json(newUser);
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }


};

export const getUserByRole = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: 'Token is not found' });
        return; 
    }

    try {
        const roleName = req.params.role as string;
        console.log("roleName", roleName);
        if (!roleName) {
            res.status(400).json({ message: 'Bad Request: role are required.' });
            return; 
        }
        const user = await User.findAll({
            include: [{
                model: Roles,
                as: 'role',
                where: { roleName }
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
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: 'Token is not found' });
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
        res.status(401).json({ message: 'Token is not found' });
        return; 
    }

    try {
        const decodedToken: TokenPayload = findFromToken(token);
        
        // Check the roleName property instead of comparing the entire token
        if (decodedToken.roleName !== 'admin') {
            res.status(403).json({ message: 'Forbidden: You do not have permission to create a user.' });
            return; 
        }
        const users = await User.findAll({
            include: [{
                model: Roles,
                as: 'role'
            }]
        });

        res.status(200).json({ users });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: 'Token is not found' });
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
        res.status(401).json({ message: 'Token is not found' });
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
        res.status(401).json({ message: 'Token is not found' });
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
            await User.update({ status: 'inactive' }, { where: { id: userId } });
            res.status(200).json({ message: 'User inactivated successfully' });
            return; 
        }

        await User.update({ status: 'active' }, { where: { id: userId } });
        res.status(200).json({ message: 'User activated successfully' });
        return; 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return; 
    }
}

export const getUserByState = async (req: Request, res: Response): Promise<void> => {
    console.log('==================== Request Received ====================');
    const token = req.cookies.token;
    console.log("Query parameters:", req.query);

    if (!token) {
        res.status(401).json({ message: 'Token is not found' });
        return; 
    }

    try {
        const decodedToken: TokenPayload = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            res.status(403).json({ message: 'Forbidden: You do not have permission to view users.' });
            return; 
        }

        const state = req.query.state;
        if (!state) {
            res.status(400).json({ message: 'Bad Request: State is required.' });
            return; 
        }

        console.log("Fetching users with status:", state);
        const users = await User.findAll({ where: { status: state } });
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
