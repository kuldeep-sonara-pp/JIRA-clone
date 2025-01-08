import { Router } from "express";
import verifyAuthToken from "../util/auth.middleware";
import { createRole, deleteRole, getRoles, updateRole } from "../controller/roles.controller";


const router = Router();

router.post("/create", verifyAuthToken ,createRole);


router.put("/update/:roleId", verifyAuthToken ,updateRole);

router.delete("/delete/:roleId", verifyAuthToken ,deleteRole);

router.get("/", verifyAuthToken ,getRoles);

const rolesRoutes = router;
export default rolesRoutes;