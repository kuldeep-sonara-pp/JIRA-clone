"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../util/database"));
class Project extends sequelize_1.Model {
}
Project.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    projectName: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    projectDescription: {
        type: sequelize_1.DataTypes.TEXT, // or DataTypes.STRING if you prefer
        allowNull: true // Change to false if this field should be required
    },
    teamId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'teams',
            key: 'id'
        },
        allowNull: false,
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    }
}, {
    sequelize: database_1.default,
    tableName: 'projects',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
    underscored: true
});
exports.default = Project;
