import { Router } from "express";
import { login } from "../controller/user.controller";

const router = Router();

router.post("/login", login);


const userRouts = router;
export default userRouts;