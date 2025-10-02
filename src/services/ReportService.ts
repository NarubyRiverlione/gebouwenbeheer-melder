import { Injectable } from "@nestjs/common"
import reportRepo from "../repositories/ReportRepository.js"
import type { Report, NewReport } from "../models/Report.js"

@Injectable()
export class ReportsService {
  findAll() {
    return reportRepo.findAll()
  }

  create(data: NewReport): Report {
    return reportRepo.create(data)
  }

  // Minimal ingest: adapt to your existing ingestEmail logic if needed
  ingest(data: NewReport): Report {
    // For now reuse create; adapt if ingest has different logic
    return reportRepo.create(data)
  }

  countUnprocessed() {
    return reportRepo.countUnprocessed()
  }
}
