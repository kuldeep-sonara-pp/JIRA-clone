import dotenv from "dotenv"; // Move this line to the top
import express from "express";
import sequelize from "./util/database";
import cookieParser from "cookie-parser";

import Team  from "./model/team.model";
import User from './model/user.model';
import Roles from './model/rols.model';
import Project from './model/project.model';
import Task from './model/task.model';

import userRouts from './routes/user.routes';
import teamRoutes from './routes/team.routes';
import rolesRoutes from './routes/roles.route';
import projectRoutes from './routes/project.route';
import taskRoutes from "./routes/task.route";

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT ; // Default to 3000 if PORT is not set

app.use(cookieParser());


app.use(userRouts)
app.use('/team', teamRoutes);
app.use('/roles', rolesRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);

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

        // Project and Task
        Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
        Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

        // User and Task
        User.hasMany(Task, { foreignKey: 'assignedTo', as: 'tasks' });
        Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

        // User and Task
        User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
        Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });


        await sequelize.authenticate();
    
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};


// Start the server
startServer();
