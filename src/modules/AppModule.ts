import { Module } from "@nestjs/common"
import { ReportsModule } from "./ReportModule.js"
import { ClustersModule } from "./ClusterModule.js"
import { IngestController } from "../controllers/IngestController.js"

@Module({
  imports: [ReportsModule, ClustersModule],
  controllers: [IngestController],
})
export class AppModule {}
