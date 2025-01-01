"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFromToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const checkToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(404).json({ message: 'Token is not found' });
    }
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        console.error('JWT secret is not defined in environment variables');
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    jsonwebtoken_1.default.verify(token, secretKey, (err) => {
        if (err) {
            return res.status(401).send({ message: 'Not Authenticated ' });
        }
        next();
    });
};
const findFromToken = (token) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error('Secret key is not defined in environment variables');
    }
    const decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
    return decodedToken;
};
exports.findFromToken = findFromToken;
exports.default = checkToken;
