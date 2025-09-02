import { Router } from "express"
import { processClusters, listClusters, resolveCluster } from "../controllers/clusterController.js"

const router = Router()

router.post("/process", processClusters)
router.get("/", listClusters)
router.post("/:id/resolve", resolveCluster)

export default router
