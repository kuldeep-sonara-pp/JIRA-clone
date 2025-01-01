import { Router } from "express";
import checkToken from "../util/auth.middleware";
import { addMeberToTeam, createTeam, deleteTeam, getTeam, getTeamById, removeTeamMember, updateTeam } from "../controller/team.controller";


const router = Router();
// @ts-ignore
router.post("/create", checkToken ,createTeam);
// @ts-ignore
router.get("/", checkToken ,getTeam);
// @ts-ignore
router.get("/:teamId", checkToken ,getTeamById);
// @ts-ignore
router.put("/update/:teamId", checkToken ,updateTeam);
// @ts-ignore
router.delete("/remove-member/:teamId", checkToken ,removeTeamMember);
// @ts-ignore
router.put("/add-member/:teamId", checkToken ,addMeberToTeam);
// @ts-ignore
router.delete("/delete/:teamId", checkToken ,deleteTeam);


const teamRoutes = router;
export default teamRoutes;