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
exports.getProjects = exports.createProject = void 0;
const dotenv_1 = __importDefault(require("dotenv")); // Move this line to the top
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./util/database"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const team_model_1 = __importDefault(require("./model/team.model"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const user_model_1 = __importDefault(require("./model/user.model"));
const rols_model_1 = __importDefault(require("./model/rols.model"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const roles_route_1 = __importDefault(require("./routes/roles.route"));
const project_route_1 = __importDefault(require("./routes/project.route"));
const project_model_1 = __importDefault(require("./model/project.model"));
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = process.env.PORT; // Default to 3000 if PORT is not set
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(user_routes_1.default);
app.use('/team', team_routes_1.default);
app.use('/roles', roles_route_1.default);
app.use('/project', project_route_1.default);
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
        yield database_1.default.authenticate();
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
    }
    catch (error) {
        console.log(error);
    }
});
const findFromToken = (token) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error('Secret key is not defined in environment variables');
    }
    const decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
    return decodedToken;
};
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectName, projectDescription, teamId } = req.body;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const project = yield project_model_1.default.create({
            projectName,
            projectDescription,
            teamId
        });
        return res.status(201).json({ project });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createProject = createProject;
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const projects = yield project_model_1.default.findAll({
            include: [
                { model: team_model_1.default, as: 'team', include: [
                        { model: user_model_1.default, as: 'teamMembers', attributes: ['id', 'name', 'email'] },
                        { model: user_model_1.default, as: 'teamLead', attributes: ['id', 'name', 'email'] }
                    ] }
            ],
        });
        return res.status(200).json({ projects });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getProjects = getProjects;
// Start the server
startServer();
