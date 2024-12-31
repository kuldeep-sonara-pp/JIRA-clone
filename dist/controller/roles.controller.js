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
exports.deleteRole = exports.updateRole = exports.getRoles = exports.createRole = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const rols_model_1 = __importDefault(require("../model/rols.model"));
const database_1 = require("../util/database");
const findFromToken = (token) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error('Secret key is not defined in environment variables');
    }
    const decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
    return decodedToken;
};
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roleName } = req.body;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const exists = yield (0, database_1.recordExists)(rols_model_1.default, { role_name: roleName }); // Adjust the criteria if necessary
        if (exists) {
            return res.status(409).json({ message: 'Role already exists' });
        }
        const role = yield rols_model_1.default.create({ roleName });
        return res.status(201).json({ role });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createRole = createRole;
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const roles = yield rols_model_1.default.findAll();
        return res.status(200).json({ roles });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getRoles = getRoles;
const updateRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roleName } = req.body;
    const id = req.params.roleId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const exists = yield (0, database_1.recordExists)(rols_model_1.default, { id });
        if (!exists) {
            return res.status(404).json({ message: 'Role not found' });
        }
        const role = yield rols_model_1.default.update({ roleName }, { where: { id } });
        return res.status(200).json({ role });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateRole = updateRole;
const deleteRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.roleId;
    const token = req.cookies.token;
    try {
        const decodedToken = findFromToken(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const exists = yield (0, database_1.recordExists)(rols_model_1.default, { id });
        if (!exists) {
            return res.status(404).json({ message: 'Role not found' });
        }
        yield rols_model_1.default.destroy({ where: { id } });
        return res.status(200).json({ message: 'Role deleted successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteRole = deleteRole;
