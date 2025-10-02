import { Body, Controller, Post, HttpCode } from "@nestjs/common"
import reportRepo from "../repositories/ReportRepository.js"
import type { NewReport } from "../models/Report.js"

@Controller()
export class IngestController {
  @Post("ingest")
  @HttpCode(201)
  ingest(@Body() body: Partial<NewReport>) {
    const data: NewReport = {
      message: body.message!,
      building: body.building ?? null,
      floor: body.floor ?? null,
      apartment_Number: body.apartment_Number ?? null,
      reporter_name: body.reporter_name ?? null,
      reporter_email: body.reporter_email ?? null,
      reporter_phone: body.reporter_phone ?? null,
      category: body.category ?? null,
      priority: body.priority ?? null,
    }
    return reportRepo.create(data)
  }
}
