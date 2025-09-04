import type { Report } from "../models/Report.js"
import type { IssueCluster } from "../models/IssueCluster.js"
import ClusterRepository from "./ClusterRepository.js"

const CompareReportWithClusters = (_report: Report, _clusters: IssueCluster[]) => {
  // if no similar issue cluster = create a new issue cluster
  const newCluster = ClusterRepository.new(_report.message)
  ClusterRepository.create(newCluster)
}

export default CompareReportWithClusters
