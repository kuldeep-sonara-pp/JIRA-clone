import { Router } from "express";
import checkToken from "../util/auth.middleware";
import { getProjectSnapshots, getSnapshotsByFilter } from "../controller/projectSnapshorts.controller";

const router = Router();

router.get("/", checkToken, getProjectSnapshots);

router.get("/filter", checkToken, getSnapshotsByFilter);

const projectSnapshortRoutes = router;
export default projectSnapshortRoutes;