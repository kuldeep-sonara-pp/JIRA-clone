import { Router } from "express";
import checkToken from "../util/auth.middleware";
import { addMeberToTeam, createTeam, deleteTeam, getTeam, getTeamByFilter, getTeamById, removeTeamMember, updateTeam } from "../controller/team.controller";


const router = Router();

router.post("/create", checkToken ,createTeam);

router.get("/filter", checkToken ,getTeamByFilter);

router.get("/:teamId", checkToken ,getTeamById);

router.put("/update/:teamId", checkToken ,updateTeam);

router.delete("/remove-member/:teamId", checkToken ,removeTeamMember);

router.put("/add-member/:teamId", checkToken ,addMeberToTeam);

router.delete("/delete/:teamId", checkToken ,deleteTeam);


router.get("/", checkToken ,getTeam);

const teamRoutes = router;
export default teamRoutes;