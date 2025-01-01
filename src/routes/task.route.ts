import { Router } from "express";
import checkToken from "../util/auth.middleware";
import { createTask, deleteTask, getAllTasks, getTaskById, getTaskByProject, getTaskByUser, updateAssignedToTaskAndStaus, updateTask } from "../controller/task.controller";
import { get } from "http";
const routes = Router();

//  @ts-ignore
routes.get("/", checkToken ,getAllTasks);
// @ts-ignore
routes.post("/create", checkToken ,createTask);
//  @ts-ignore
routes.get("/project/:projectId", checkToken ,getTaskByProject);
//  @ts-ignore
routes.get("/:taskId", checkToken ,getTaskById);
//  @ts-ignore
routes.put("/update/:taskId", checkToken ,updateTask);
//  @ts-ignore
routes.put("/assigned/:taskId", checkToken ,updateAssignedToTaskAndStaus);
//  @ts-ignore
routes.delete("/delete/:taskId", checkToken ,deleteTask);
//  @ts-ignore
routes.get("/user/:userId", checkToken ,getTaskByUser);




const taskRoutes = routes;
export default taskRoutes;
