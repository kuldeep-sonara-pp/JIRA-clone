import { Router } from "express";
import checkToken from "../util/auth.middleware";
import { createTask, deleteTask, getAllTasks, getTaskById, getTaskByProject, getTaskByUser, updateAssignedToTaskAndStaus, updateTask } from "../controller/task.controller";

const routes = Router();


routes.get("/", checkToken ,getAllTasks);

routes.post("/create", checkToken ,createTask);

routes.get("/project/:projectId", checkToken ,getTaskByProject);

routes.get("/:taskId", checkToken ,getTaskById);

routes.put("/update/:taskId", checkToken ,updateTask);

routes.put("/assigned/:taskId", checkToken ,updateAssignedToTaskAndStaus);

routes.delete("/delete/:taskId", checkToken ,deleteTask);

routes.get("/user/:userId", checkToken ,getTaskByUser);


const taskRoutes = routes;
export default taskRoutes;
