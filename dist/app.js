"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv")); // Move this line to the top
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./util/database"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const team_model_1 = __importDefault(require("./model/team.model"));
const user_model_1 = __importDefault(require("./model/user.model"));
const rols_model_1 = __importDefault(require("./model/rols.model"));
const project_model_1 = __importDefault(require("./model/project.model"));
const task_model_1 = __importDefault(require("./model/task.model"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const roles_route_1 = __importDefault(require("./routes/roles.route"));
const project_route_1 = __importDefault(require("./routes/project.route"));
const task_route_1 = __importDefault(require("./routes/task.route"));
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = process.env.PORT; // Default to 3000 if PORT is not set
app.use((0, cookie_parser_1.default)());
app.use(user_routes_1.default);
app.use('/team', team_routes_1.default);
app.use('/roles', roles_route_1.default);
app.use('/projects', project_route_1.default);
app.use('/tasks', task_route_1.default);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Role and User
        user_model_1.default.belongsTo(rols_model_1.default, { foreignKey: 'roleId', as: 'role' });
        rols_model_1.default.hasMany(user_model_1.default, { foreignKey: 'roleId', as: 'users' });
        // Team and User
        team_model_1.default.hasOne(user_model_1.default, { foreignKey: 'id', sourceKey: 'teamLeadId', as: 'teamLead' });
        team_model_1.default.hasMany(user_model_1.default, { foreignKey: 'teamId', as: 'teamMembers' });
        user_model_1.default.belongsTo(team_model_1.default, { foreignKey: 'teamId', as: 'team' });
        // Team and Project
        team_model_1.default.hasMany(project_model_1.default, { foreignKey: 'teamId', as: 'projects' });
        project_model_1.default.belongsTo(team_model_1.default, { foreignKey: 'teamId', as: 'team' });
        // Project and Task
        project_model_1.default.hasMany(task_model_1.default, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
        task_model_1.default.belongsTo(project_model_1.default, { foreignKey: 'projectId', as: 'project' });
        // User and Task
        user_model_1.default.hasMany(task_model_1.default, { foreignKey: 'assignedTo', as: 'tasks' });
        task_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'assignedTo', as: 'assignee' });
        // User and Task
        user_model_1.default.hasMany(task_model_1.default, { foreignKey: 'createdBy', as: 'createdTasks' });
        task_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'createdBy', as: 'creator' });
        yield database_1.default.authenticate();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
});
// Start the server
startServer();
