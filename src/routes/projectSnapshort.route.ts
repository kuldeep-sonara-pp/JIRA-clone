import { Router } from "express";
import verifyAuthToken from "../util/auth.middleware";
import { getProjectSnapshots, getSnapshotsByFilter } from "../controller/projectSnapshorts.controller";

const router = Router();

router.get("/", verifyAuthToken, getProjectSnapshots);

router.get("/filter", verifyAuthToken, getSnapshotsByFilter);

const projectSnapshortRoutes = router;
export default projectSnapshortRoutes;