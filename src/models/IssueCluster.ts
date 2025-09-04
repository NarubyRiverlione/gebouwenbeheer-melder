export  interface IssueCluster {
  id: number
  main_issue: string
  severity: string
  category: string
  estimated_impact: string | null
  created_date: string
  status: string
}

export type NewIssueCluster = Omit<IssueCluster, "id" | "created_date" | "status">
