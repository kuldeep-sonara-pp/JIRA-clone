import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const checkToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token; 

    if (!token) {
        return res.status(404).json({message:'Token is not found'}); 
    }

    const secretKey = process.env.JWT_SECRET 
    
    if (!secretKey) {
        console.error('JWT secret is not defined in environment variables');
        return res.status(500).json({message: 'Internal Server Error'});
    }

    jwt.verify(token, secretKey, (err: any) => {
        if (err) {
            return res.status(401).send({message: 'Not Authenticated '});
        }
        
        next(); 
    });
};

export default checkToken;
