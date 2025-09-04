import db from "../utils/db.js"
import type { Report, NewReport } from "../models/Report.js"
import ClusterRepository from "./ClusterRepository.js"
import compareReportWithClusters from "./CompareRepository.js"

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
  debugId TEXT,
  cluster_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`
db.prepare(createTable).run()

class ReportRepository {
  async create(data: NewReport, processNow: boolean): Promise<{ report: Report; isProcessed: boolean }> {
    const stmt = db.prepare(
      `INSERT INTO report
        (message, building, floor, apartment_Number,
         reporter_name, reporter_email, reporter_phone,
         category, priority,debugId)
       VALUES
        (@message, @building, @floor, @apartment_Number,
         @reporter_name, @reporter_email, @reporter_phone,
         @category, @priority,@debugId)`,
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
      debugId: data.debugId ?? null,
    }
    const info = stmt.run(payload)
    const report = db
      .prepare("SELECT * FROM report WHERE id = ?")
      .get(info.lastInsertRowid as number) as Report

    // if processNow is true, process this report immediately
    if (processNow) {
      await this.processOne(report)
      return { report, isProcessed: true }
    }
    return { report, isProcessed: false }
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

  processOne = async (report: Report) => {
    try {
      console.log("Processing report", report.debugId)
      // always get the latest unresolved clusters, in case new ones were created during this loop
      const unresolvedClusters = ClusterRepository.findUnresolved()
      const isNewCluster = await compareReportWithClusters(report, unresolvedClusters)
      console.log(
        `Report ${report.debugId} ${isNewCluster ? "is new" : "is similar to unresolved"} Issue Cluster`,
      )
      this.markProcessed(report)
      console.log("--------------------")
    } catch (error) {
      console.error("Error processing report", error)
    }
  }
}
export default new ReportRepository()
