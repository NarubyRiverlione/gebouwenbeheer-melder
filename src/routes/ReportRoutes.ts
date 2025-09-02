import { Router } from "express"
import {
  createReport,
  listReports,
  countUnprocessedReports,
  getUnprocessedReports,
  queryReports,
  processReports,
} from "../controllers/ReportController.js"

const router = Router()

router.post("/", createReport)
router.get("/", listReports)
router.get("/countUnprocessed", countUnprocessedReports)
router.get("/unprocessed", getUnprocessedReports)
router.get("/query", queryReports)

router.post("/process", processReports)

export default router
