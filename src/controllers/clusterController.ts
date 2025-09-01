import type { Request, Response } from "express"
import clusterRepo from "../repositories/ClusterRepository.js"
import reportRepo from "../repositories/ReportRepository.js"
import type { NewIssueCluster } from "../models/IssueCluster.js"

export const processClusters = (_req: Request, res: Response) => {
  const unprocessedReports = reportRepo.findAll().filter((r) => !r.is_processed)
  const clusters = unprocessedReports.map((report) => {
    const clusterData: NewIssueCluster = {
      main_issue: report.message,
      severity: "medium",
      category: report.category ?? "uncategorized",
      estimated_impact: null,
    }
    const cluster = clusterRepo.create(clusterData)
    reportRepo.assignCluster(report.id, cluster.id)
    reportRepo.markProcessed(report.id)
    return cluster
  })
  res.json(clusters)
}

export const listClusters = (_req: Request, res: Response) => {
  const clusters = clusterRepo.findUnresolved()
  res.json(clusters)
}

export const resolveCluster = (req: Request, res: Response) => {
  const id = Number(req.params["id"])
  clusterRepo.resolve(id)
  reportRepo.markResolvedByCluster(id)
  res.status(204).end()
}
