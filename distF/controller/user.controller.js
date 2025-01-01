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
exports.deleteUser = exports.updateUser = exports.getAllUsers = exports.getUser = exports.createUser = exports.logout = exports.login = void 0;
const user_model_1 = __importDefault(require("../model/user.model"));
const rols_model_1 = __importDefault(require("../model/rols.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("../util/database");
const auth_middleware_1 = require("../util/auth.middleware");
dotenv_1.default.config();
const generateToken = (payload) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error('Secret key is not defined in environment variables');
    }
    return jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: '1h' });
};
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_model_1.default.findOne({
            where: { email },
            include: [{ model: rols_model_1.default, as: 'role' }]
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const roleName = user.role ? user.role.dataValues.roleName : null;
        const teamId = user.teamId;
        const tokenPayLode = {
            userId: user.id,
            roleName: roleName || 'guest',
            teamId: teamId !== null ? teamId : undefined,
        };
        const token = generateToken(tokenPayLode);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
        });
        // console.log(req.cookies.token)
        return res.status(200).json({ message: 'Login successful' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
});
exports.logout = logout;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    const { name, email, password, roleId, teamId } = req.body;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to create a user.' });
        }
        const userExists = yield (0, database_1.recordExists)(user_model_1.default, { userName: name, email: email });
        if (userExists) {
            return res.status(409).json({ message: 'user is exist' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = yield user_model_1.default.create({ name, email, password: hashedPassword, roleId, teamId });
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createUser = createUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const userEmail = req.query.userEmail;
        const userRole = req.query.role;
        console.log("usreame", userEmail);
        console.log("userRole:", userRole);
        if (!userEmail || !userRole) {
            return res.status(400).json({ message: 'Bad Request: userName and role are required.' });
        }
        const user = yield user_model_1.default.findOne({
            where: {
                email: userEmail,
            },
            include: [{
                    model: rols_model_1.default,
                    as: 'role',
                    where: { roleName: userRole }
                }]
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getUser = getUser;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        // Check the roleName property instead of comparing the entire token
        if (decodedToken.roleName !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to create a user.' });
        }
        const users = yield user_model_1.default.findAll({
            include: [{
                    model: rols_model_1.default,
                    as: 'role'
                }]
        });
        return res.status(200).json({ users });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAllUsers = getAllUsers;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to update a user.' });
        }
        const userId = parseInt(req.params.userId, 10); // Ensure userId is an integer
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        console.log("userId", userId);
        const { name, email, roleId, teamId } = req.body;
        const user = yield user_model_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.name = name;
        user.email = email;
        user.roleId = roleId;
        user.teamId = teamId;
        yield user.save();
        return res.status(200).json({ user });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decodedToken = (0, auth_middleware_1.findFromToken)(token);
        if (decodedToken.roleName !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to delete a user.' });
        }
        const userId = req.params.userId;
        const user = yield user_model_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        yield user.destroy();
        return res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteUser = deleteUser;
