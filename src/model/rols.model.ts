import { Model, DataTypes } from "sequelize";
import sequelize from '../util/database'; 

class Roles extends Model {
    public id!: number; 
    public roleName!: string; 
}

Roles.init(
    {
        id: {
            type: DataTypes.NUMBER,
            autoIncrement: true,
            primaryKey: true,
        },
        roleName: {
            type: DataTypes.STRING(50), 
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize, 
        tableName: 'roles',
        underscored:true,
        timestamps: true,
        createdAt: true,
        updatedAt: true
    }
);

export default Roles;
