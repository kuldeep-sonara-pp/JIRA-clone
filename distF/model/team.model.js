"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../util/database"));
class Team extends sequelize_1.Model {
}
Team.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    teamName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    teamLeadId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id'
        },
        allowNull: false
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: false
    }
}, {
    sequelize: database_1.default,
    tableName: 'teams',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
    underscored: true
});
exports.default = Team;
