"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../util/auth.middleware"));
const team_controller_1 = require("../controller/team.controller");
const router = (0, express_1.Router)();
// @ts-ignore
router.post("/create", auth_middleware_1.default, team_controller_1.createTeam);
// @ts-ignore
router.get("/getAllTeam", auth_middleware_1.default, team_controller_1.getTeam);
// @ts-ignore
router.get("/getTeam/:teamId", auth_middleware_1.default, team_controller_1.getTeamById);
// @ts-ignore
router.put("/updateTeam/:teamId", auth_middleware_1.default, team_controller_1.updateTeam);
// @ts-ignore
router.delete("/removeMember/:teamId", auth_middleware_1.default, team_controller_1.removeTeamMember);
// @ts-ignore
router.put("/addMember/:teamId", auth_middleware_1.default, team_controller_1.addMeberToTeam);
// @ts-ignore
router.delete("/deleteTeam/:teamId", auth_middleware_1.default, team_controller_1.deleteTeam);
const teamRoutes = router;
exports.default = teamRoutes;
