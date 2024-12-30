import bcrypt from 'bcrypt';
import dotenv from "dotenv"; // Move this line to the top
import express, { NextFunction, Request, Response } from "express";
import sequelize from "./util/database";
import cookieParser from "cookie-parser";


import project  from "./model/project.model";
import Team  from "./model/team.model";
import task  from "./model/task.model";
import userRouts from './routes/user.routes';
import User from './model/user.model';
import Roles from './model/rols.model';
import teamRoutes from './routes/team.routes';

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

const startServer = async () => {
    try {
        User.belongsTo(Roles, { foreignKey: 'roleId', as: 'role' });
        Roles.hasMany(User, { foreignKey: 'roleId', as: 'users' });

        User.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
        Team.hasMany(User, { foreignKey: 'teamId', as: 'teamMembers' });

        Team.hasOne(User, { foreignKey: 'teamLeadId', as: 'teamLead' });
        User.belongsTo(Team, { foreignKey: 'teamLeadId', as: 'leadTeam' });

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

// Start the server
startServer();
