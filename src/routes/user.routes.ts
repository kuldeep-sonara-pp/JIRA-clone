import { Router } from "express";
import { chnageStataus, createUser, deleteUser, getAllUsers, getUserByFilter, getUserById, login, logout, updateUser } from "../controller/user.controller";
import verifyAuthToken from "../util/auth.middleware";

const router = Router();

router.post("/login", login);

router.post("/logout", verifyAuthToken, logout);

router.post("/user/create",verifyAuthToken,createUser);

router.put("/user/update/:userId",verifyAuthToken, updateUser);

router.put("/user/state/:userId",verifyAuthToken, chnageStataus);

router.delete("/user/delete/:userId", verifyAuthToken, deleteUser);

router.get("/user/filter", verifyAuthToken, getUserByFilter);

router.get("/user/:userId", verifyAuthToken, getUserById);

router.get("/user/", verifyAuthToken, getAllUsers);


const userRouts = router;
export default userRouts;