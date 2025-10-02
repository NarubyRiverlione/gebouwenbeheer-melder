import { Module } from "@nestjs/common"
import { ClustersController } from "../controllers/ClustersController.js"
import { ClustersService } from "../services/ClusterService.js"

@Module({
  controllers: [ClustersController],
  providers: [ClustersService],
})
export class ClustersModule {}
