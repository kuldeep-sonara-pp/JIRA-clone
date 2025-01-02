import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const checkToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token; 

    if (!token) {
        res.status(404).json({message:'Token is not found'}); 
        return;
    }

    const secretKey = process.env.JWT_SECRET 

    
    if (!secretKey) {
        console.error('JWT secret is not defined in environment variables');
        res.status(500).json({message: 'Internal Server Error'});
        return;
    }

    jwt.verify(token, secretKey, (err: jwt.VerifyErrors | null) => {
        if (err) {
            res.status(401).send({message: 'Not Authenticated'});
            console.log("error", err);
            return;
        }
        
        next(); 
    });
};


interface TokenPayload {
    userId: number; // Adjust as necessary
    roleName: string;
    teamId?: number; // Optional if not always provided
}

export const findFromToken = (token: string) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error('Secret key is not defined in environment variables');
    }

    const decodedToken = jwt.verify(token, secretKey) as TokenPayload;
    return decodedToken;
};


export default checkToken;
