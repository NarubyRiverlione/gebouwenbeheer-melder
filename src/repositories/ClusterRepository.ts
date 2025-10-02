import db from "../utils/db.js"
import type { IssueCluster, NewIssueCluster } from "../models/IssueCluster.js"

// Ensure table exists
const createTable = `
CREATE TABLE IF NOT EXISTS issue_cluster (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  main_issue TEXT NOT NULL,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_impact TEXT,
  created_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'open'
)`
db.prepare(createTable).run()

class ClusterRepository {
  new(main_issue: string, category?: string): NewIssueCluster {
    return {
      main_issue,
      severity: "unknown",
      category: category ?? "Onbekend",
      estimated_impact: null,
    }
  }

  create(data: NewIssueCluster): IssueCluster {
    const stmt = db.prepare(
      `INSERT INTO issue_cluster
        (main_issue, severity, category, estimated_impact)
       VALUES
        (@main_issue, @severity, @category, @estimated_impact)`,
    )
    const info = stmt.run(data)
    return db
      .prepare("SELECT * FROM issue_cluster WHERE id = ?")
      .get(info.lastInsertRowid as number) as IssueCluster
  }

  findAll(): IssueCluster[] {
    const clusters = db.prepare("SELECT * FROM issue_cluster").all() as IssueCluster[]
    const clusterWithLinkedReports = clusters.map((cluster) => this.addLinkedReport(cluster))
    return clusterWithLinkedReports
  }
  findUnresolved(): IssueCluster[] {
    const clusters = db.prepare("SELECT * FROM issue_cluster WHERE status = 'open'").all() as IssueCluster[]
    const clusterWithLinkedReports = clusters.map((cluster) => this.addLinkedReport(cluster))
    return clusterWithLinkedReports
  }
  findUnresolvedByCategory(categorie: string): IssueCluster[] {
    const clusters = db
      .prepare("SELECT * FROM issue_cluster WHERE status = 'open' AND category = ?")
      .all(categorie) as IssueCluster[]
    const clusterWithLinkedReports = clusters.map((cluster) => this.addLinkedReport(cluster))
    return clusterWithLinkedReports
  }

  resolve(id: number): void {
    db.prepare("UPDATE issue_cluster SET status = 'resolved' WHERE id = ?").run(id)
  }

  addLinkedReport(cluster: IssueCluster): IssueCluster {
    const linked_reports = db
      .prepare("SELECT id,message FROM report WHERE cluster_id = ?")
      .all(cluster.id) as {
      id: number
      message: string
    }[]
    return { ...cluster, linked_reports }
  }

  updateEmbeddings(id:number, embeddings:number[]) {
    db.prepare("UPDATE issue_cluster SET embeddings = ? WHERE id = ?").run(embeddings, id)
  }
}

export default new ClusterRepository()
