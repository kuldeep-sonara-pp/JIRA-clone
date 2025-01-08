import { Router } from "express";
import { createProject, deleteProject, finalizeProject, getProjectById, getProjects, getProjectsByFilter, reopenProject, updateProject } from "../controller/project.controller";
import verifyAuthToken from "../util/auth.middleware";

const router = Router();


router.post("/create", verifyAuthToken ,createProject);

router.get("/", verifyAuthToken ,getProjects);

router.get("/filter", verifyAuthToken, getProjectsByFilter);

router.get("/:projectId", verifyAuthToken ,getProjectById);

router.put("/update/:projectId", verifyAuthToken ,updateProject);

router.put("/finalize/:projectId", verifyAuthToken ,finalizeProject);

router.delete("/delete/:projectId", verifyAuthToken , deleteProject);

router.put("/reopen/:projectId", verifyAuthToken , reopenProject);

const projectRoutes = router;
export default projectRoutes;