import { Router } from "express";
import verifyAuthToken from "../util/auth.middleware";
import { addMeberToTeam, createTeam, deleteTeam, getTeam, getTeamByFilter, getTeamById, removeTeamMember, updateTeam } from "../controller/team.controller";


const router = Router();

router.post("/create", verifyAuthToken ,createTeam);

router.get("/filter", verifyAuthToken ,getTeamByFilter);

router.get("/:teamId", verifyAuthToken ,getTeamById);

router.put("/update/:teamId", verifyAuthToken ,updateTeam);

router.delete("/remove-member/:teamId", verifyAuthToken ,removeTeamMember);

router.put("/add-member/:teamId", verifyAuthToken ,addMeberToTeam);

router.delete("/delete/:teamId", verifyAuthToken ,deleteTeam);


router.get("/", verifyAuthToken ,getTeam);

const teamRoutes = router;
export default teamRoutes;