import { Module } from "@nestjs/common"
import { ReportsController } from "../controllers/ReportsController.js"
import { ReportsService } from "../services/ReportService.js"

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
