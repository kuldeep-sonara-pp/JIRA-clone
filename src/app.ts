import bcrypt from 'bcrypt';
import dotenv from "dotenv"; // Move this line to the top
import express, { NextFunction, Request, Response } from "express";
import sequelize from "./util/database";
import cookieParser from "cookie-parser";

import project  from "./model/project.model";
import team  from "./model/team.model";
import user  from "./model/user.model";
import task  from "./model/task.model";
import rols from "./model/rols.model";
import userRouts from './routes/user.routes';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT ; // Default to 3000 if PORT is not set

app.use(express.json());
app.use(cookieParser());

app.use(userRouts)

const startServer = async () => {
    try {
        await sequelize.authenticate();
        // const password = "Kuldeep200#";
        // const hasw = bcrypt.hashSync(password,10);
        // console.log("hasw :", hasw);
        // const compare = bcrypt.compare(password,hasw).then((result) => {
        //     console.log("result :",result);
        // });
        
        await sequelize.sync({force:true})
        .then(() => {
            console.log("Database synced successfully.");
        })
        .catch((syncError) => {
            console.error("Error syncing database:", syncError);
        });
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};

// Start the server
startServer();
