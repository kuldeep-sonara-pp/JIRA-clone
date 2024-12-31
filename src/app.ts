import bcrypt from 'bcrypt';
import dotenv from "dotenv"; // Move this line to the top
import express, { NextFunction, Request, Response } from "express";
import sequelize from "./util/database";
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken';

import project  from "./model/project.model";
import Team  from "./model/team.model";
import task  from "./model/task.model";
import userRouts from './routes/user.routes';
import User from './model/user.model';
import Roles from './model/rols.model';
import teamRoutes from './routes/team.routes';
import rolesRoutes from './routes/roles.route';
import projectRoutes from './routes/project.route';
import Project from './model/project.model';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT ; // Default to 3000 if PORT is not set

app.use(cookieParser());

app.use(express.json());
app.use(cookieParser());

app.use(userRouts)
app.use('/team', teamRoutes);
app.use('/roles', rolesRoutes);
app.use('/project', projectRoutes);

const startServer = async () => {
    try {
        // Role and User
        User.belongsTo(Roles, { foreignKey: 'roleId', as: 'role' });
        Roles.hasMany(User, { foreignKey: 'roleId', as: 'users' });

        // Team and User
        Team.hasOne(User, { foreignKey: 'id', sourceKey: 'teamLeadId', as: 'teamLead' });
        Team.hasMany(User, { foreignKey: 'teamId', as: 'teamMembers' });
        User.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

        // Team and Project
        Team.hasMany(Project, { foreignKey: 'teamId', as: 'projects' });
        Project.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

        await sequelize.authenticate();
        // const password = "Kuldeep200#";
        // const hasw = bcrypt.hashSync(password,10);
        // console.log("hasw :", hasw);
        // const compare = bcrypt.compare(password,hasw).then((result) => {
        //     console.log("result :",result);
        // });
        // await sequelize.sync({force:true})
        // .then(() => {
        //     console.log("Database synced successfully.");
        // })
        // .catch((syncError) => {
        //     console.error("Error syncing database:", syncError);
        // });
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};

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

export const createProject = async (req: Request, res: Response) => {
    const { projectName, projectDescription, teamId } = req.body;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if(decodedToken.roleName !== 'admin'){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const project = await Project.create({
            projectName,
            projectDescription,
            teamId
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
                { model: Team, as: 'team', include: [
                    { model: User, as: 'teamMembers', attributes: ['id', 'name', 'email'] },
                    { model: User, as: 'teamLead', attributes: ['id', 'name', 'email'] }
                ]}
            ],
        });
        return res.status(200).json({ projects });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Start the server
startServer();
