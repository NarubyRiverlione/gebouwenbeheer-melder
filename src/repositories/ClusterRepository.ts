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
    return db.prepare("SELECT * FROM issue_cluster").all() as IssueCluster[]
  }
  findUnresolved(): IssueCluster[] {
    return db.prepare("SELECT * FROM issue_cluster WHERE status = 'open'").all() as IssueCluster[]
  }
  findUnresolvedByCategory(categorie: string): IssueCluster[] {
    return db
      .prepare("SELECT * FROM issue_cluster WHERE status = 'open' AND category='" + categorie+"'")
      .all() as IssueCluster[]
  }

  resolve(id: number): void {
    db.prepare("UPDATE issue_cluster SET status = 'resolved' WHERE id = ?").run(id)
  }
}

export default new ClusterRepository()
