import { Model, DataTypes } from 'sequelize';
import sequelize from '../util/database'; 

class Team extends Model {
    public id!: number; 
    public teamName!: string; // VARCHAR(50)
    public teamLeadId!: number;
}

Team.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey: true
    },
    teamName:{
        type:DataTypes.STRING(255),
        allowNull:false,
        unique:true
    },
    teamLeadId:{
        type:DataTypes.INTEGER,
        references:{
            model:'users',
            key:'id'
        },
        allowNull:false
    },
    createdAt:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW,
        allowNull:false,
    },
    updatedAt:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW,
        allowNull:false
    }
},{
    sequelize,
    tableName: 'teams',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
    underscored:true
});

export default Team;