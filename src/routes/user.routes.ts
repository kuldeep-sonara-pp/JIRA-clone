import { Router } from "express";
import { chnageStataus, createUser, deleteUser, getAllUsers, getUserById, getUserByRole, getUserByState, login, logout, updateUser } from "../controller/user.controller";
import checkToken from "../util/auth.middleware";

const router = Router();

router.post("/login", login);

router.post("/logout", checkToken, logout);

router.post("/user/create",checkToken,createUser);

router.get("/user/role/:role",checkToken,getUserByRole);

router.get("/user/state", checkToken, getUserByState);

router.get("/user/:userId", checkToken, getUserById);


router.put("/user/update/:userId",checkToken, updateUser);

router.put("/user/state/:userId",checkToken, chnageStataus);


router.delete("/user/delete/:userId", checkToken, deleteUser);

router.get("/user/", checkToken, getAllUsers);

const userRouts = router;
export default userRouts;