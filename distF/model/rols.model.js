"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../util/database"));
class Roles extends sequelize_1.Model {
}
Roles.init({
    id: {
        type: sequelize_1.DataTypes.NUMBER,
        autoIncrement: true,
        primaryKey: true,
    },
    roleName: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
}, {
    sequelize: database_1.default,
    tableName: 'roles',
    underscored: true,
    timestamps: true,
    createdAt: true,
    updatedAt: true
});
exports.default = Roles;
