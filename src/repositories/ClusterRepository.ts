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
  create = (main_issue: string, category = "general", severity = "medium") => {
    const clusterData: NewIssueCluster = {
      main_issue,
      severity,
      category,
      estimated_impact: null,
    }

    const cluster = this.new(clusterData)

    return cluster
  }

  new(data: NewIssueCluster): IssueCluster {
    const stmt = db.prepare(
      `INSERT INTO issue_cluster
        (main_issue, severity, category, estimated_impact)
       VALUES
        (@main_issue, @severity, @category, @estimated_impact)`,
    )
    const info = stmt.run(data)
    const cluster = db
      .prepare("SELECT * FROM issue_cluster WHERE id = ?")
      .get(info.lastInsertRowid as number) as IssueCluster
    const linked_reports: number[] = []
    return { ...cluster, linked_reports }
  }
  findAll(): IssueCluster[] {
    const clusters = db.prepare("SELECT * FROM issue_cluster").all() as IssueCluster[];
    return clusters.map(cluster => {
      const rows = db.prepare("SELECT id FROM report WHERE cluster_id = ?").all(cluster.id) as { id: number }[];
      const linked_reports = rows.map(r => r.id);
      return { ...cluster, linked_reports };
    });
  }
  findUnresolved(): IssueCluster[] {
    const clusters = db.prepare("SELECT * FROM issue_cluster WHERE status = 'open'").all() as IssueCluster[];
    return clusters.map(cluster => {
      const rows = db.prepare("SELECT id FROM report WHERE cluster_id = ?").all(cluster.id) as { id: number }[];
      const linked_reports = rows.map(r => r.id);
      return { ...cluster, linked_reports };
    });
  }

  resolve(id: number): void {
    db.prepare("UPDATE issue_cluster SET status = 'resolved' WHERE id = ?").run(id)
  }
}

export default new ClusterRepository()
