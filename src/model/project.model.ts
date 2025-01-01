import { Model, DataTypes } from "sequelize";
import sequelize from '../util/database'; 

class Project extends Model {
   public id! : number; //UUiD
   public projectName! : string;//VARCHAR(50)
   public teamId!: number ; // UUID
   public startDate!: Date | null;
   public endDate!: Date | null;
}
Project.init({
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    projectName:{
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    projectDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    teamId:{
        type: DataTypes.INTEGER,
        references:{
            model:'teams',
            key:'id'
        },
        allowNull: false,
    },
    startDate:{
        type: DataTypes.DATE,
        allowNull: true,
    },
    endDate:{
        type: DataTypes.DATE,
        allowNull: true,
    }
},{
    sequelize,
    tableName: 'projects',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
    underscored: true
});

export default Project;