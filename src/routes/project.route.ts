import { Router } from "express";
import { createProject, deleteProject, finalizeProject, getProjectById, getProjects, getProjectsByFilter, reopenProject, updateProject } from "../controller/project.controller";
import checkToken from "../util/auth.middleware";

const router = Router();


router.post("/create", checkToken ,createProject);

router.get("/", checkToken ,getProjects);

router.get("/filter", checkToken, getProjectsByFilter);

router.get("/:projectId", checkToken ,getProjectById);

router.put("/update/:projectId", checkToken ,updateProject);

router.put("/finalize/:projectId", checkToken ,finalizeProject);

router.delete("/delete/:projectId", checkToken , deleteProject);

router.put("/reopen/:projectId", checkToken , reopenProject);

const projectRoutes = router;
export default projectRoutes;