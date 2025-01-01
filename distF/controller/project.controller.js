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
exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const project_model_1 = __importDefault(require("../model/project.model"));
const user_model_1 = __importDefault(require("../model/user.model"));
const team_model_1 = __importDefault(require("../model/team.model"));
const database_1 = require("../util/database");
const auth_middleware_1 = require("../util/auth.middleware");
// interface TokenPayload {
//     userId: number; // Adjust as necessary
//     roleName: string;
//     teamId?: number; // Optional if not always provided
// }
// const findFromToken = (token: string) => {
//     const secretKey = process.env.JWT_SECRET;
//     if (!secretKey) {
//         throw new Error('Secret key is not defined in environment variables');
//     }
//     const decodedToken = jwt.verify(token, secretKey) as TokenPayload;
//     return decodedToken;
// };
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectName, projectDescription, teamId, startDate, endDate } = req.body;
    const token = req.cookies.token;
    try {
        console.log("Request Body:", req.body);
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!projectName || !teamId) {
            return res.status(400).json({ message: 'Project name and team ID are required' });
        }
        const exists = yield (0, database_1.recordExists)(project_model_1.default, { project_name: projectName, team_id: teamId });
        if (exists) {
            return res.status(409).json({ message: 'Project already exists' });
        }
        const project = yield project_model_1.default.create({
            projectName: projectName,
            projectDescription: projectDescription,
            teamId: teamId,
            startDate: startDate || null,
            endDate: endDate || null
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
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const projects = yield project_model_1.default.findAll({
            include: [
                {
                    model: team_model_1.default,
                    as: 'team',
                    include: [
                        { model: user_model_1.default, as: 'teamMembers', attributes: ['id', 'name', 'email'] },
                        { model: user_model_1.default, as: 'teamLead', attributes: ['id', 'name', 'email'] }
                    ]
                }
            ],
            // attributes: ['id', 'projectName', 'projectDescription' 'createdAt', 'updatedAt', 'startDate', 'endDate']
        });
        if (!projects || projects.length === 0) {
            return res.status(404).json({ message: 'No projects found' });
        }
        // Post-process to filter out the teamLead from teamMembers
        const processedProjects = projects.map((project) => {
            const plainProject = project.get({ plain: true });
            if (plainProject.team) {
                const { teamLead, teamMembers } = plainProject.team;
                // Filter out the teamLead from the teamMembers
                plainProject.team.teamMembers = teamMembers.filter((member) => member.id !== (teamLead === null || teamLead === void 0 ? void 0 : teamLead.id));
            }
            return plainProject;
        });
        return res.status(200).json({ processedProjects });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getProjects = getProjects;
const getProjectById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    const projectId = req.params.projectId;
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const project = yield project_model_1.default.findByPk(projectId, {
            include: [
                {
                    model: team_model_1.default,
                    as: 'team',
                    include: [
                        { model: user_model_1.default, as: 'teamMembers', attributes: ['id', 'name', 'email'] },
                        { model: user_model_1.default, as: 'teamLead', attributes: ['id', 'name', 'email'] }
                    ]
                }
            ],
            // attributes: ['id', 'projectName', 'projectDescription', 'createdAt', 'updatedAt', 'startDate', 'endDate']
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        // Convert the project to a plain object
        const plainProject = project.get({ plain: true });
        // Process the team to filter out the teamLead from teamMembers
        if (plainProject.team) {
            const { teamLead, teamMembers } = plainProject.team;
            plainProject.team.teamMembers = teamMembers.filter((member) => member.id !== (teamLead === null || teamLead === void 0 ? void 0 : teamLead.id));
        }
        return res.status(200).json({ plainProject });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getProjectById = getProjectById;
const updateProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectName, projectDescription, teamId, startDate, endDate } = req.body; // Add startDate and endDate
    const projectId = req.params.projectId;
    const token = req.cookies.token;
    // console.log("Request body:", req.body);
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const updateData = {};
        if (projectName)
            updateData.projectName = projectName;
        if (projectDescription)
            updateData.projectDescription = projectDescription;
        if (teamId)
            updateData.teamId = teamId;
        if (startDate !== undefined)
            updateData.startDate = startDate || null;
        if (endDate !== undefined)
            updateData.endDate = endDate || null;
        const [updatedRows] = yield project_model_1.default.update(updateData, { where: { id: projectId } });
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        return res.status(200).json({ message: 'Project updated successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateProject = updateProject;
const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projectId = req.params.projectId;
    const token = req.cookies.token;
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const exists = yield (0, database_1.recordExists)(project_model_1.default, { projectId });
        if (!exists) {
            return res.status(404).json({ message: 'Project is not exists' });
        }
        yield project_model_1.default.destroy({ where: { id: projectId } });
        return res.status(200).json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteProject = deleteProject;
