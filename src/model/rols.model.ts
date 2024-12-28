import { Model, DataTypes, Sequelize } from "sequelize";
import sequelize from '../util/database'; 

class Rols extends Model {
    public id!: string; // UUID
    public roleName!: string; // VARCHAR(50)
}

Rols.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
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

export default Rols;
