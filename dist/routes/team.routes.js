"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_controller_1 = require("../controller/team.controller");
const auth_middleware_1 = __importDefault(require("../util/auth.middleware"));
const router = (0, express_1.Router)();
// @ts-ignore
router.post("/create", auth_middleware_1.default, team_controller_1.createTeam);
router.get("/getTeam", auth_middleware_1.default, team_controller_1.getTeam);
const teamRoutes = router;
exports.default = teamRoutes;
