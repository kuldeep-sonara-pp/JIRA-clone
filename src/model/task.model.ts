import { Model, DataTypes } from "sequelize";
import sequelize from '../util/database'; 

class Task extends Model {
    public id!: number; 
    public projectId!: number; 
    public assignedTo!: number;
    public createdBy!: number; 
    public taskName!: string; // VARCHAR(255)
    public taskDescription!: string | null; // TEXT
    public startDate!: Date | null;
    public endDate!: Date | null;
    public status!: string; // VARCHAR(50)
}

Task.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    projectId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'projects',
            key: 'id',
        },
        allowNull: false,
    },
    assignedTo: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id',
        },
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id',
        },
        allowNull: false,
    },
    taskName: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    taskDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'To Do',
    }
},{
    sequelize,
    tableName: 'tasks',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
    underscored: true
});

export default Task