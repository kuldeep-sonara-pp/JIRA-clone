import { Router } from "express";
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from "../controller/project.controller";
import checkToken from "../util/auth.middleware";

const router = Router();

// @ts-ignore
router.post("/create", checkToken ,createProject);
// @ts-ignore
router.get("/get", checkToken ,getProjects);
// @ts-ignore
router.get("/get/:projectId", checkToken ,getProjectById);
// @ts-ignore
router.put("/update/:projectId", checkToken ,updateProject);
// @ts-ignore
router.delete("/delete/:projectId", checkToken , deleteProject);

const projectRoutes = router;
export default projectRoutes;