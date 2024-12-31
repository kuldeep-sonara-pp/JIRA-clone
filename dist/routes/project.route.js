"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controller/project.controller");
const auth_middleware_1 = __importDefault(require("../util/auth.middleware"));
const router = (0, express_1.Router)();
// @ts-ignore
router.post("/create", auth_middleware_1.default, project_controller_1.createProject);
// @ts-ignore
router.get("/get", auth_middleware_1.default, project_controller_1.getProjects);
// @ts-ignore
router.get("/get/:projectId", auth_middleware_1.default, project_controller_1.getProjectById);
// @ts-ignore
router.put("/update/:projectId", auth_middleware_1.default, project_controller_1.updateProject);
// @ts-ignore
router.delete("/delete/:projectId", auth_middleware_1.default, project_controller_1.deleteProject);
const projectRoutes = router;
exports.default = projectRoutes;
