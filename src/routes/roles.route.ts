import { Router } from "express";
import checkToken from "../util/auth.middleware";
import { createRole, deleteRole, getRoles, updateRole } from "../controller/roles.controller";
import { get } from "http";

const router = Router();
// @ts-ignore
router.post("/create", checkToken ,createRole);
// @ts-ignore
router.get("/", checkToken ,getRoles);
// @ts-ignore
router.put("/update/:roleId", checkToken ,updateRole);
// @ts-ignore
router.delete("/delete/:roleId", checkToken ,deleteRole);


const rolesRoutes = router;
export default rolesRoutes;