import { Controller, Get, Param, Post, HttpCode } from "@nestjs/common"
import clusterRepo from "../repositories/ClusterRepository.js"
import reportRepo from "../repositories/ReportRepository.js"
import type { IssueCluster } from "../models/IssueCluster.js"

@Controller("clusters")
export class ClustersController {
  @Get()
  findAll(): IssueCluster[] {
    return clusterRepo.findAll()
  }

  @Get("unresolved")
  unresolved(): IssueCluster[] {
    return clusterRepo.findUnresolved()
  }

  @Post(":id/resolve")
  @HttpCode(204)
  resolve(@Param("id") id: string): void {
    const cid = Number(id)
    clusterRepo.resolve(cid)
    reportRepo.markResolvedByCluster(cid)
  }
}
