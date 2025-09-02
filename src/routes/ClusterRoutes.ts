import { Router } from "express"
import { listClusters,getUnresolvedClusters, resolveCluster } from "../controllers/ClusterController.js"

const router = Router()


router.get("/", listClusters)
router.get("/getUnresolvedClusters", getUnresolvedClusters)
router.post("/:id/resolve", resolveCluster)

export default router
