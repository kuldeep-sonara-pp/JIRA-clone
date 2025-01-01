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
exports.deleteTeam = exports.addMeberToTeam = exports.removeTeamMember = exports.updateTeam = exports.getTeamById = exports.getTeam = exports.createTeam = void 0;
const team_model_1 = __importDefault(require("../model/team.model"));
const user_model_1 = __importDefault(require("../model/user.model"));
const rols_model_1 = __importDefault(require("../model/rols.model"));
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
const createTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamName, teamLeadId } = req.body;
    console.log("teamName :", teamName);
    const token = req.cookies.token;
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const teamLeadExists = yield (0, database_1.recordExists)(user_model_1.default, teamLeadId);
        if (!teamLeadExists) {
            return res.status(404).json({ message: 'Team lead not found' });
        }
        const teamExists = yield (0, database_1.recordExists)(team_model_1.default, { teamName: teamName, teamLeadId: teamLeadId });
        if (teamExists) {
            return res.status(409).json({ message: 'Team is alrady exist' });
        }
        const team = yield team_model_1.default.create({
            teamName,
            teamLeadId
        });
        yield user_model_1.default.update({ teamId: team.id }, // Set the new team ID
        { where: { id: teamLeadId } } // Find the user by teamLeadId
        );
        return res.status(201).json({ massage: 'Team created successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createTeam = createTeam;
const getTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const team = yield team_model_1.default.findAll({
            include: [
                { model: user_model_1.default, as: 'teamLead', attributes: ['id', 'name', 'email'] },
                { model: user_model_1.default, as: 'teamMembers', attributes: ['id', 'name', 'email'] }
            ],
        });
        const filteredTeam = team.map((team) => {
            const plainTeam = team.get({ plain: true });
            const { teamLead, teamMembers } = plainTeam;
            const filteredTeamMembers = teamMembers.filter((member) => member.id !== teamLead.id);
            return Object.assign(Object.assign({}, plainTeam), { teamMembers: filteredTeamMembers });
        });
        return res.status(200).json(filteredTeam);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getTeam = getTeam;
const getTeamById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const team = yield team_model_1.default.findByPk(id, {
            include: [
                { model: user_model_1.default, as: 'teamLead', attributes: ['id', 'name', 'email'] },
                { model: user_model_1.default, as: 'teamMembers', attributes: ['id', 'name', 'email'] }
            ],
        });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        const plainTeam = team.get({ plain: true });
        const { teamLead, teamMembers } = plainTeam;
        const filteredTeamMembers = teamMembers.filter((member) => member.id !== teamLead.id);
        return res.status(200).json(Object.assign(Object.assign({}, plainTeam), { teamMembers: filteredTeamMembers }));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getTeamById = getTeamById;
const updateTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { teamName, teamLeadId } = req.body;
    const id = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const team = yield team_model_1.default.findByPk(id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        if (teamLeadId) {
            const newTeamLead = yield user_model_1.default.findByPk(teamLeadId, {
                include: [
                    {
                        model: rols_model_1.default,
                        as: 'role'
                    }
                ]
            });
            console.log("newTEamLead", newTeamLead);
            if (!newTeamLead || ((_a = newTeamLead.role) === null || _a === void 0 ? void 0 : _a.roleName) !== 'teamLead') {
                return res.status(400).json({ message: 'Invalid team lead ID' });
            }
        }
        const currentTeamLeadId = team.teamLeadId;
        console.log("currentTeamLeadId :", currentTeamLeadId);
        yield team_model_1.default.update({ teamName, teamLeadId }, { where: { id } });
        if (currentTeamLeadId) {
            yield user_model_1.default.update({ teamId: null }, { where: { id: currentTeamLeadId } });
        }
        if (teamLeadId) {
            yield user_model_1.default.update({ teamId: id }, { where: { id: teamLeadId } });
        }
        return res.status(200).json({ message: 'Team updated successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateTeam = updateTeam;
const removeTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamMemberId } = req.body;
    const id = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const team = yield team_model_1.default.findByPk(id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        const userExists = yield (0, database_1.recordExists)(user_model_1.default, { userId: id });
        if (!userExists) {
            return res.status(404).json({ message: 'user is not exist' });
        }
        yield user_model_1.default.update({ teamId: null }, { where: { id: teamMemberId } });
        return res.status(200).json({ message: 'Team member removed successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.removeTeamMember = removeTeamMember;
const addMeberToTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamMemberId } = req.body;
    const id = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const team = yield team_model_1.default.findByPk(id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        const userExists = yield (0, database_1.recordExists)(user_model_1.default, { userId: id });
        if (!userExists) {
            return res.status(404).json({ message: 'user is not exist' });
        }
        yield user_model_1.default.update({ teamId: id }, { where: { id: teamMemberId } });
        return res.status(200).json({ message: 'Team member added successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.addMeberToTeam = addMeberToTeam;
const deleteTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.teamId;
    const token = req.cookies.token;
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const team = yield team_model_1.default.findByPk(id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        yield user_model_1.default.update({ teamId: null }, { where: { teamId: id } });
        yield team.destroy();
        return res.status(200).json({ message: 'Team deleted successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteTeam = deleteTeam;
