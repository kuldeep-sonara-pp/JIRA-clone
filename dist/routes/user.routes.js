"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controller/user.controller");
const auth_middleware_1 = __importDefault(require("../util/auth.middleware"));
const router = (0, express_1.Router)();
// @ts-nocheck
// @ts-ignore
router.post("/login", user_controller_1.login);
// @ts-ignore
router.post("/logout", auth_middleware_1.default, user_controller_1.logout);
// @ts-ignore
router.post("/user/create", auth_middleware_1.default, user_controller_1.createUser);
// @ts-ignore
router.get("/user/getuser", auth_middleware_1.default, user_controller_1.getUser);
// @ts-ignore
router.get("/user/getAllUsers", auth_middleware_1.default, user_controller_1.getAllUsers);
// @ts-ignore
router.put("/user/update/:userId", auth_middleware_1.default, user_controller_1.updateUser);
// @ts-ignore
router.delete("/user/delete/:userId", auth_middleware_1.default, (req, res) => {
    res.send("User deleted");
});
const userRouts = router;
exports.default = userRouts;
