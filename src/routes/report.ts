import { Router } from "express"
import {
  createReport,
  listReports,
  countUnprocessedReports,
  getUnprocessedReports,
  queryReports,
} from "../controllers/reportController.js"

const router = Router()

router.post("/", createReport)
router.get("/", listReports)
router.get("/countUnprocessed", countUnprocessedReports)
router.get("/unprocessed", getUnprocessedReports)
router.get("/query", queryReports)

export default router
