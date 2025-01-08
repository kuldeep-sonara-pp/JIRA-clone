import { Router } from "express";
import verifyAuthToken from "../util/auth.middleware";
import { createTask, deleteTask, getAllTasks, getTaskByFilter, getTaskById, updateAssignedToTaskAndStaus, updateTask } from "../controller/task.controller";

const routes = Router();


routes.get("/", verifyAuthToken ,getAllTasks);

routes.post("/create", verifyAuthToken ,createTask);

routes.get("/filter", verifyAuthToken ,getTaskByFilter);


routes.get("/:taskId", verifyAuthToken ,getTaskById);

routes.put("/update/:taskId", verifyAuthToken ,updateTask);

routes.put("/assigned/:taskId", verifyAuthToken ,updateAssignedToTaskAndStaus);

routes.delete("/delete/:taskId", verifyAuthToken ,deleteTask);



const taskRoutes = routes;
export default taskRoutes;
