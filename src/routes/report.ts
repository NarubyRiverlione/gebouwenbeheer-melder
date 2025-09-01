import { Router } from "express"
import {
  createReport,
  listReports,
  countUnprocessedReports,
  queryReports,
} from "../controllers/reportController.js"

const router = Router()

router.post("/", createReport)
router.get("/", listReports)
router.get("/count", countUnprocessedReports)
router.get("/query", queryReports)

export default router
