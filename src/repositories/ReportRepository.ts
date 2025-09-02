import db from "../utils/db.js"
import type { Report, NewReport } from "../models/Report.js"
import clusterRepo from "./ClusterRepository.js"
import type { IssueCluster } from "../models/IssueCluster.js"

// Ensure table exists
const createTable = `
CREATE TABLE IF NOT EXISTS report (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  building TEXT,
  floor TEXT,
  apartment_Number TEXT,
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending',
  is_processed BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  category TEXT,
  priority TEXT,
  cluster_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`
db.prepare(createTable).run()

class ReportRepository {
  create(data: NewReport): Report {
    const stmt = db.prepare(
      `INSERT INTO report
        (message, building, floor, apartment_Number,
         reporter_name, reporter_email, reporter_phone,
         category, priority)
       VALUES
        (@message, @building, @floor, @apartment_Number,
         @reporter_name, @reporter_email, @reporter_phone,
         @category, @priority)`,
    )
    // normalize undefined to null for optional fields
    const payload = {
      message: data.message,
      building: data.building ?? null,
      floor: data.floor ?? null,
      apartment_Number: data.apartment_Number ?? null,
      reporter_name: data.reporter_name ?? null,
      reporter_email: data.reporter_email ?? null,
      reporter_phone: data.reporter_phone ?? null,
      category: data.category ?? null,
      priority: data.priority ?? null,
    }
    const info = stmt.run(payload)
    return db.prepare("SELECT * FROM report WHERE id = ?").get(info.lastInsertRowid as number) as Report
  }

  findAll(): Report[] {
    return db.prepare("SELECT * FROM report").all() as Report[]
  }

  countUnprocessed(): number {
    const row = db.prepare("SELECT COUNT(*) as count FROM report WHERE is_processed = 0").get() as {
      count: number
    }
    return row.count
  }
  queryUnprocessed(): Report[] {
    return db.prepare("SELECT * FROM report WHERE is_processed = 0").all() as Report[]
  }

  queryByDate(start?: string, end?: string, processed?: boolean, resolved?: boolean): Report[] {
    let sql = "SELECT * FROM report WHERE 1=1"
    const params: Record<string, unknown> = {}
    if (start) {
      sql += " AND timestamp >= @start"
      params["start"] = start
    }
    if (end) {
      sql += " AND timestamp <= @end"
      params["end"] = end
    }
    if (processed !== undefined) {
      sql += " AND is_processed = @processed"
      params["processed"] = processed ? 1 : 0
    }
    if (resolved !== undefined) {
      sql += " AND is_resolved = @resolved"
      params["resolved"] = resolved ? 1 : 0
    }
    return db.prepare(sql).all(params) as Report[]
  }

  markProcessed(report: Report): void {
    report.is_processed = true // mark in object as well
    db.prepare("UPDATE report SET is_processed = 1 WHERE id = ?").run(report.id)
  }

  markResolvedByCluster(clusterId: number): void {
    db.prepare("UPDATE report SET is_resolved = 1 WHERE cluster_id = ?").run(clusterId)
  }

  assignCluster(reportId: number, clusterId: number): void {
    db.prepare("UPDATE report SET cluster_id = ? WHERE id = ?").run(clusterId, reportId)
  }

  async processAll(): Promise<IssueCluster[]> {
    const unprocessedReports = this.queryUnprocessed()
    const reportsWithVector = await createVectors(unprocessedReports)
    const newClusters: IssueCluster[] = []
    for (const report of reportsWithVector) {
      if (report.is_processed) continue // skip already linked reports
      console.debug(`Processing report ${report.id}: ${report.message}`)
      const cluster = this.processOne(report, reportsWithVector)
      newClusters.push(cluster)
      console.debug("-----------------------")
    }
    return newClusters
  }

  processOne(report: Report, unprocessedReports: Report[]): IssueCluster {
    const similarReports = [report] // as this report is not linked yet, start a new cluster
    this.markProcessed(report)

    // compare with other unprocessed reports
    for (const otherReport of unprocessedReports) {
      if (otherReport.id === report.id) continue // don't compare with itself
      if (otherReport.is_processed) {
        console.debug(`Skipping already linked report ${otherReport.id}`)
        continue
      }

      const similarity = compareReports(report.vector ?? 0, otherReport.vector ?? 0)

      if (similarity > 70) {
        console.debug(`Reports ${report.id} and ${otherReport.id} are similar (${similarity}%)`) // 70%
        // threshold for similarity
        similarReports.push(otherReport) // add as similar report
        this.markProcessed(otherReport) // mark as processed
      }
    }

    // create a issue cluster for similar reports
    const newCluster = clusterRepo.create(report.message)
    // link similar reports to the new cluster
    similarReports.forEach((similarReport) => {
      console.debug(`Linking report ${similarReport.id} to cluster ${newCluster.id}`)
      this.assignCluster(similarReport.id, newCluster.id)
    })
    return newCluster
  }
}

function compareReports(reportVector: number, otherVector: number) {
  return 100 - Math.abs(reportVector - otherVector)
}

function createVectors(reports: Report[]): Promise<Report[]> {
  return Promise.all(
    reports.map(async (report) => {
      if (!report.vector) {
        report.vector = await generateVector(report)
        // db.prepare("UPDATE report SET vector = ? WHERE id = ?").run(report.vector, report.id)
      }
      return report
    }),
  )
}

async function generateVector(report: Report): Promise<number> {
  // Placeholder: Replace with actual vector generation logic

  return new Promise((resolve) => {
    // simulate async operation by waiting 50ms
    setTimeout(() => {
      console.debug(`Creating vector for report ${report.id}`)
      // random number between 0 and 100
      const vectorScore = Math.floor(Math.random() * 100)
      return resolve(vectorScore)
    }, 100)
  })
}

export default new ReportRepository()
