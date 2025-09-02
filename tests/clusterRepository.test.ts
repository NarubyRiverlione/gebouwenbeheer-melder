/// <reference types="vitest" />
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import dbModule from "../src/utils/db.js"
import clusterRepoModule from "../src/repositories/ClusterRepository.js"
import reportRepoModule from "../src/repositories/ReportRepository.js"

describe("ClusterRepository", () => {
  let db: typeof dbModule
  let clusterRepo: typeof clusterRepoModule
  let reportRepo: typeof reportRepoModule

  beforeEach(async () => {
    process.env["DB_FILE"] = ":memory:"
    vi.resetModules()
    const dbImport = await import("../src/utils/db.js")
    db = dbImport.default
    const clusterImport = await import("../src/repositories/ClusterRepository.js")
    clusterRepo = clusterImport.default
    const reportImport = await import("../src/repositories/ReportRepository.js")
    reportRepo = reportImport.default
  })

  afterEach(() => {
    // Clean up tables after each test to ensure isolation
    db.prepare("DELETE FROM report").run()
    db.prepare("DELETE FROM issue_cluster").run()
    db.close()
  })

  it("creates and retrieves unresolved clusters", () => {
    const clusterData = {
      main_issue: "Issue A",
      severity: "high",
      category: "electrical",
      estimated_impact: "medium",
    }
    const c = clusterRepo.new(clusterData)
    expect(c.id).toBeGreaterThan(0)
    const all = clusterRepo.findUnresolved()
    expect(all).toEqual(expect.arrayContaining([c]))
  })
})
