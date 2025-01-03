import { Model, DataTypes } from "sequelize";
import sequelize from '../util/database'; 

class ProjectSnapshot extends Model {
    public id!: number;
    public projectId!: number;
    public teamMemberId!: number;
    public role!: string;
    public status!: 'active' | 'inactive';
    public completedAt!: Date;
    public finalizedByUserId!: number; // New column to store the user ID who finalized
}

ProjectSnapshot.init({
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
    teamMemberId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id',
        },
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    finalizedByUserId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id',
        },
        allowNull: false,
    }
}, {
    sequelize,
    tableName: 'project_snapshots',
    underscored: true,
    timestamps: false,
});


export default ProjectSnapshot;
