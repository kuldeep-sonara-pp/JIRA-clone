"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../util/auth.middleware"));
const roles_controller_1 = require("../controller/roles.controller");
const router = (0, express_1.Router)();
// @ts-ignore
router.post("/create", auth_middleware_1.default, roles_controller_1.createRole);
// @ts-ignore
router.get("/get", auth_middleware_1.default, roles_controller_1.getRoles);
// @ts-ignore
router.put("/update/:roleId", auth_middleware_1.default, roles_controller_1.updateRole);
// @ts-ignore
router.delete("/delete/:roleId", auth_middleware_1.default, roles_controller_1.deleteRole);
const rolesRoutes = router;
exports.default = rolesRoutes;
