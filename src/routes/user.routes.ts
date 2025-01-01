import { Router } from "express";
import { createUser, deleteUser, getAllUsers, getUserById, getUserByRole, login, logout, updateUser } from "../controller/user.controller";
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
router.get("/user/role/:role",checkToken,getUserByRole);
// @ts-ignore
router.get("/user/", checkToken, getAllUsers);
// @ts-ignore
router.get("/user/:userId", checkToken, getUserById);
// @ts-ignore
router.put("/user/update/:userId",checkToken, updateUser);
// @ts-ignore
router.delete("/user/delete/:userId", checkToken, deleteUser);

const userRouts = router;
export default userRouts;