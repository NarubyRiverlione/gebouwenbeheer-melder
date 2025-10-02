import { Injectable } from "@nestjs/common"
import clusterRepo from "../repositories/ClusterRepository.js"
import type { IssueCluster } from "../models/IssueCluster.js"

@Injectable()
export class ClustersService {
  findAll(): IssueCluster[] {
    return clusterRepo.findAll()
  }
  resolve(id: number): void {
    return clusterRepo.resolve(id)
  }
}
