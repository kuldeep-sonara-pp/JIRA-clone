import { Router } from "express";
import checkToken from "../util/auth.middleware";
import { createRole, deleteRole, getRoles, updateRole } from "../controller/roles.controller";


const router = Router();

router.post("/create", checkToken ,createRole);

router.get("/", checkToken ,getRoles);

router.put("/update/:roleId", checkToken ,updateRole);

router.delete("/delete/:roleId", checkToken ,deleteRole);


const rolesRoutes = router;
export default rolesRoutes;