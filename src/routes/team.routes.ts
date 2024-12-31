import { Router } from "express";
import checkToken from "../util/auth.middleware";
import { addMeberToTeam, createTeam, deleteTeam, getTeam, getTeamById, removeTeamMember, updateTeam } from "../controller/team.controller";


const router = Router();
// @ts-ignore
router.post("/create", checkToken ,createTeam);
// @ts-ignore
router.get("/getAllTeam", checkToken ,getTeam);
// @ts-ignore
router.get("/getTeam/:teamId", checkToken ,getTeamById);
// @ts-ignore
router.put("/updateTeam/:teamId", checkToken ,updateTeam);
// @ts-ignore
router.delete("/removeMember/:teamId", checkToken ,removeTeamMember);
// @ts-ignore
router.put("/addMember/:teamId", checkToken ,addMeberToTeam);
// @ts-ignore
router.delete("/deleteTeam/:teamId", checkToken ,deleteTeam);


const teamRoutes = router;
export default teamRoutes;