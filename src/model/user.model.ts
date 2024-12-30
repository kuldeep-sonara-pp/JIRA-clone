import { Model, DataTypes } from 'sequelize';
import sequelize from '../util/database'; // Adjust the path as necessary
import Roles from './rols.model';

class User extends Model {
    public id!: number; // Auto-incrementing integer
    public name!: string; // VARCHAR(255)
    public email!: string; // VARCHAR(255)
    public password!: string; // VARCHAR(255)
    public roleId!: number | null;
    public teamId!: number | null;

    public role?: Roles;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER, // Change to INTEGER
            autoIncrement: true, // Enable auto-increment
            primaryKey: true, 
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        roleId: {
            type: DataTypes.INTEGER, // Change to INTEGER
            references: {
                model: 'roles', // Table name for reference
                key: 'id', // Column name for reference
            },
            onDelete: 'SET NULL', // Set null on delete of referenced role
            allowNull: true, // Allow null if no role assigned
        },
        teamId: {
            type: DataTypes.INTEGER, // Change to INTEGER
            references: {
                model: 'teams', // Table name for reference
                key: 'id', // Column name for reference
            },
            onDelete: 'SET NULL', // Set null on delete of referenced team
            allowNull: true, // Allow null if no team assigned
        }
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
        updatedAt: true,
        createdAt: true,
        underscored: true,
    }
);

export default User;
