/// <reference types="vitest" />
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import dbModule from "../src/utils/db.js"
import repoModule from "../src/repositories/ReportRepository.js"

describe("ReportRepository", () => {
  let db: typeof dbModule
  let reportRepo: typeof repoModule

  beforeEach(async () => {
    process.env["DB_FILE"] = ":memory:"
    vi.resetModules()
    const dbImport = await import("../src/utils/db.js")
    db = dbImport.default
    const repoImport = await import("../src/repositories/ReportRepository.js")
    reportRepo = repoImport.default
  })

  afterEach(() => {
    // Clean up tables after each test to ensure isolation
    db.prepare("DELETE FROM report").run()
    db.close()
    // Reset module cache for next test
    vi.resetModules()
  })

  it("creates and retrieves a report", () => {
    const data = { message: "Test message" }
    const report = reportRepo.create(data)
    expect(report.id).toBeGreaterThan(0)
    const all = reportRepo.findAll()
    expect(all).toEqual(expect.arrayContaining([report]))
  })

  it("counts unprocessed", () => {
    const data = { message: "Unprocessed count test" }
    const report = reportRepo.create(data)
    expect(reportRepo.countUnprocessed()).toBeGreaterThanOrEqual(1)
    reportRepo.markProcessed(report)
    expect(reportRepo.countUnprocessed()).toBe(0)
  })

  it("assigns and resolves cluster", () => {
    const data = { message: "Cluster test" }
    const report = reportRepo.create(data)
    reportRepo.assignCluster(report.id, 123)
    reportRepo.markResolvedByCluster(123)
    const updated = reportRepo.findAll().find((r) => r.id === report.id)
    expect(updated?.is_resolved).toBeTruthy()
  })
})
