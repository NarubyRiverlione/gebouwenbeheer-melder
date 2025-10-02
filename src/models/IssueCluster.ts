export interface IssueCluster {
  id: number
  main_issue: string
  severity: string
  category: string
  estimated_impact: string | null
  created_date: string
  status: string
  linked_reports?: { id: number; message: string }[]
  embeddings?: number[]
}

export type NewIssueCluster = Omit<IssueCluster, "id" | "created_date" | "status">
