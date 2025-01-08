import { Model, Sequelize, ModelStatic,WhereOptions } from "sequelize";
import dotenv from "dotenv";


dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME as string,        
    process.env.DB_USER as string,       
    process.env.DB_PASSWORD as string,    
    {
        host: process.env.DB_HOST || "localhost",
        dialect: "postgres",
        port: parseInt(process.env.DB_PORT || "5432", 10),
    }
);


const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

testConnection();


export const recordExists = async (model: ModelStatic<Model>, criteria: WhereOptions) => {
    const existingRecord = await model.findOne({ where: criteria });
    return existingRecord !== null; 
};

export default sequelize;
