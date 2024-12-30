import { Router } from "express";
import { createUser, getAllUsers, getUser, login, logout, updateUser } from "../controller/user.controller";
import checkToken from "../util/auth.middleware";

const router = Router();
// @ts-nocheck
// @ts-ignore
router.post("/login", login);
// @ts-ignore
router.post("/logout", checkToken, logout);
// @ts-ignore
router.post("/user/create",checkToken,createUser);
// @ts-ignore
router.get("/user/getuser",checkToken,getUser);
// @ts-ignore
router.get("/user/getAllUsers", checkToken, getAllUsers);
// @ts-ignore
router.put("/user/update/:userId",checkToken, updateUser);
// @ts-ignore
router.delete("/user/delete/:userId", checkToken, (req, res) => {
    res.send("User deleted");
});

const userRouts = router;
export default userRouts;