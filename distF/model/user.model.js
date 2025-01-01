"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../util/database")); // Adjust the path as necessary
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER, // Change to INTEGER
        autoIncrement: true, // Enable auto-increment
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    roleId: {
        type: sequelize_1.DataTypes.INTEGER, // Change to INTEGER
        references: {
            model: 'roles', // Table name for reference
            key: 'id', // Column name for reference
        },
        onDelete: 'SET NULL', // Set null on delete of referenced role
        allowNull: true, // Allow null if no role assigned
    },
    teamId: {
        type: sequelize_1.DataTypes.INTEGER, // Change to INTEGER
        references: {
            model: 'teams', // Table name for reference
            key: 'id', // Column name for reference
        },
        onDelete: 'SET NULL', // Set null on delete of referenced team
        allowNull: true, // Allow null if no team assigned
    }
}, {
    sequelize: database_1.default,
    tableName: 'users',
    timestamps: true,
    updatedAt: true,
    createdAt: true,
    underscored: true,
});
exports.default = User;
