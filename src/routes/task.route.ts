import { Router } from "express";
import checkToken from "../util/auth.middleware";
import { createTask, deleteTask, getAllTasks, getTaskByFilter, getTaskById, updateAssignedToTaskAndStaus, updateTask } from "../controller/task.controller";

const routes = Router();


routes.get("/", checkToken ,getAllTasks);

routes.post("/create", checkToken ,createTask);

routes.get("/filter", checkToken ,getTaskByFilter);


routes.get("/:taskId", checkToken ,getTaskById);

routes.put("/update/:taskId", checkToken ,updateTask);

routes.put("/assigned/:taskId", checkToken ,updateAssignedToTaskAndStaus);

routes.delete("/delete/:taskId", checkToken ,deleteTask);



const taskRoutes = routes;
export default taskRoutes;
