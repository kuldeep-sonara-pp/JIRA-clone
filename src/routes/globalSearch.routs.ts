import { Router } from "express";
import verifyAuthToken from "../util/auth.middleware";
import { globalSearch } from "../controller/searchController";

const routs = Router();

routs.get('/',verifyAuthToken, globalSearch);

const globalRouts = routs;

export default globalRouts;