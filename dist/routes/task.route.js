"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../util/auth.middleware"));
const task_controller_1 = require("../controller/task.controller");
const routes = (0, express_1.Router)();
//  @ts-ignore
routes.get("/", auth_middleware_1.default, task_controller_1.getAllTasks);
// @ts-ignore
routes.post("/create", auth_middleware_1.default, task_controller_1.createTask);
//  @ts-ignore
routes.get("/project/:projectId", auth_middleware_1.default, task_controller_1.getTaskByProject);
//  @ts-ignore
routes.get("/:taskId", auth_middleware_1.default, task_controller_1.getTaskById);
//  @ts-ignore
routes.put("/update/:taskId", auth_middleware_1.default, task_controller_1.updateTask);
//  @ts-ignore
routes.put("/assigned/:taskId", auth_middleware_1.default, task_controller_1.updateAssignedToTaskAndStaus);
//  @ts-ignore
routes.delete("/delete/:taskId", auth_middleware_1.default, task_controller_1.deleteTask);
//  @ts-ignore
routes.get("/user/:userId", auth_middleware_1.default, task_controller_1.getTaskByUser);
const taskRoutes = routes;
exports.default = taskRoutes;
