"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../util/database"));
class Task extends sequelize_1.Model {
}
Task.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    projectId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'projects',
            key: 'id',
        },
        allowNull: false,
    },
    assignedTo: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id',
        },
        allowNull: true,
    },
    createdBy: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id',
        },
        allowNull: false,
    },
    taskName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    taskDescription: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'To Do',
    }
}, {
    sequelize: database_1.default,
    tableName: 'tasks',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
    underscored: true
});
exports.default = Task;
