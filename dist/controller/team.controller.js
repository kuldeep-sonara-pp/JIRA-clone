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
exports.getTeam = exports.createTeam = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const team_model_1 = __importDefault(require("../model/team.model"));
const user_model_1 = __importDefault(require("../model/user.model"));
const findFromToken = (token) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error('Secret key is not defined in environment variables');
    }
    const decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
    return decodedToken;
};
const createTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamName, teamLeadId } = req.body;
    console.log("teamName :", teamName);
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
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
        const decodedToken = findFromToken(token);
        if (decodedToken.roleName !== 'admin' && decodedToken.roleName !== 'teamLead') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const team = yield team_model_1.default.findAll({
            include: [
                { model: user_model_1.default, as: 'teamLead', attributes: ['id', 'name', 'email'] },
                { model: user_model_1.default, as: 'teamMembers', attributes: ['id', 'name', 'email'] }
            ],
        });
        return res.status(200).json(team);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getTeam = getTeam;
