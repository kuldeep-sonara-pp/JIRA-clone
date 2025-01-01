import User from '../model/user.model';
import Roles from '../model/rols.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import dotenv from "dotenv";
import { recordExists } from '../util/database';
import { findFromToken } from '../util/auth.middleware';

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

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Roles, as: 'role' }] 
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const roleName = user.role ? user.role.dataValues.roleName : null; 
        const teamId = user.teamId; 

        const tokenPayLode: TokenPayload = {
            userId: user.id, 
            roleName: roleName || 'guest',
            teamId: teamId !== null ? teamId : undefined, 
        };
        
        const token = generateToken(tokenPayLode);

        res.cookie('token', token, { 
            httpOnly: true ,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
        });

        // console.log(req.cookies.token)

        return res.status(200).json({ message: 'Login successful' }); 
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
};


export const createUser = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    const { name, email, password, roleId, teamId } = req.body;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }
    try{
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            return res.status(403).json({ message: 'Forbidden: You do not have permission to create a user.' });
        } 
        const userExists = await recordExists(User, { name, email});
        if (userExists) {
            return res.status(409).json({ message: 'user is exist' });
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

export const getUserByRole = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const roleName = req.params.role as string;
        console.log("roleName", roleName);
        if (!roleName) {
            return res.status(400).json({ message: 'Bad Request: role are required.' });
        }
        const user = await User.findAll({
            include: [{
                model: Roles,
                as: 'role',
                where: { roleName }
            }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: 'Bad Request: User ID is required.' });
        }

        const user = await User.findByPk(userId, {
            include: [{
                model: Roles,
                as: 'role'
            }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getAllUsers = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decodedToken: TokenPayload = findFromToken(token);
        
        // Check the roleName property instead of comparing the entire token
        if (decodedToken.roleName !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to create a user.' });
        }
        const users = await User.findAll({
            include: [{
                model: Roles,
                as: 'role'
            }]
        });

        return res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decodedToken: TokenPayload = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to update a user.' });
        }

        const userId = Number(req.params.userId); // Ensure userId is an integer
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const { name, email, roleId, teamId } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({ message: 'Email already in use by another user.' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.roleId = roleId || user.roleId;
        user.teamId = teamId || user.teamId;

        await user.save();
        return res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


export const deleteUser = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decodedToken: TokenPayload = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to delete a user.' });
        }

        const userId = req.params.userId;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};