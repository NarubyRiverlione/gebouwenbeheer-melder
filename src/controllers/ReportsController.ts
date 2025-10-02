import { Body, Controller, Get, Post, HttpCode } from "@nestjs/common"
import { CreateReportDto } from "../models/create-report.dto.js"
import reportRepo from "../repositories/ReportRepository.js"
import clusterRepo from "../repositories/ClusterRepository.js"
import type { Report, NewReport } from "../models/Report.js"

@Controller("reports")
export class ReportsController {
  @Get()
  findAll(): Report[] {
    return reportRepo.findAll()
  }

  @Get("countUnprocessed")
  countUnprocessed() {
    return { count: reportRepo.countUnprocessed() }
  }

  @Get("unprocessed")
  unprocessed() {
    return reportRepo.queryUnprocessed()
  }

  @Post()
  create(@Body() body: { report?: CreateReportDto; processNow?: boolean }): Report {
    const payload = body.report ?? body
    const report = reportRepo.create(payload as NewReport)
    if (body.processNow) {
      // process immediately if requested
      void reportRepo.processOne(report)
    }
    return report
  }

  @Post("process")
  @HttpCode(200)
  async processReports() {
    const unprocessed = reportRepo.queryUnprocessed()
    for (const r of unprocessed) await reportRepo.processOne(r)
    return clusterRepo.findUnresolved()
  }
}
