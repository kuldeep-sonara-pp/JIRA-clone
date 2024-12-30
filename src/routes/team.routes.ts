import { Router } from "express";
import { createTeam, getTeam } from "../controller/team.controller";
import checkToken from "../util/auth.middleware";
import { get } from "http";

const router = Router();
// @ts-ignore
router.post("/create", checkToken ,createTeam);
router.get("/getTeam", checkToken ,getTeam);

const teamRoutes = router;
export default teamRoutes;