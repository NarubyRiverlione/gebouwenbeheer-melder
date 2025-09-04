import type { Request, Response } from "express"
import clusterRepo from "../repositories/ClusterRepository.js"
import reportRepo from "../repositories/ReportRepository.js"

export const listClusters = (_req: Request, res: Response) => {
  const clusters = clusterRepo.findAll()
  res.json(clusters)
}
export const getUnresolvedClusters = (_req: Request, res: Response) => {
  const clusters = clusterRepo.findUnresolved()
  res.json(clusters)
}

export const resolveCluster = (req: Request, res: Response) => {
  const id = Number(req.params["id"])
  clusterRepo.resolve(id)
  reportRepo.markResolvedByCluster(id)
  res.status(204).end()
}
