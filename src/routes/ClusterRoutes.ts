import { Router } from "express"
import { getUnresolvedClusters, listClusters, resolveCluster } from "../controllers/ClusterController.js"

const router = Router()

router.get("/", listClusters)
router.get("/unresolved", getUnresolvedClusters)

router.post("/:id/resolve", resolveCluster)

export default router
