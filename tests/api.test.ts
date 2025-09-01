/// <reference types="vitest" />
import { describe, it, expect, beforeAll } from "vitest"
import request from "supertest"

let app: any

beforeAll(async () => {
  process.env["DB_FILE"] = ":memory:"
  const mod = await import("../src/main.js")
  app = mod.default
})

describe("API Endpoints", () => {
  let reportId: number
  let clusterId: number

  it("POST /reports creates a report", async () => {
    const res = await request(app)
      .post("/reports")
      .send({
        message: "API test report",
        building: "A",
        floor: "1",
        apartment_Number: "101",
        reporter_name: "Tester",
        reporter_email: "test@example.com",
        reporter_phone: "12345",
        category: "test",
        priority: "low",
      })
      .expect(201)
    expect(res.body.id).toBeGreaterThan(0)
    reportId = res.body.id
  })

  it("GET /reports returns the report", async () => {
    const res = await request(app).get("/reports").expect(200)
    expect(res.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: reportId, message: "API test report" })]),
    )
  })

  it("GET /reports/countUnprocessed returns unprocessed count", async () => {
    const res = await request(app).get("/reports/countUnprocessed").expect(200)
    expect(res.body.count).toBeGreaterThanOrEqual(1)
  })

  it("GET /reports/unprocessed returns unprocessed reports", async () => {
    const res = await request(app).get("/reports/unprocessed").expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: reportId, message: "API test report" })])
    )
  })

  it("POST /ingest creates a report with validation", async () => {
    const res = await request(app).post("/ingest").send({ message: "Ingest report" }).expect(201)
    expect(res.body.message).toBe("Ingest report")
  })

  it("POST /clusters/process clusters reports", async () => {
    const res = await request(app).post("/clusters/process").expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(1)
    clusterId = res.body[0].id
  })

  it("GET /clusters returns unresolved clusters", async () => {
    const res = await request(app).get("/clusters").expect(200)
    expect(res.body).toEqual(expect.arrayContaining([expect.objectContaining({ id: clusterId })]))
  })

  it("POST /clusters/:id/resolve resolves cluster", async () => {
    await request(app).post(`/clusters/${clusterId}/resolve`).expect(204)
    const res = await request(app).get("/clusters").expect(200)
    expect(res.body.find((c: any) => c.id === clusterId)).toBeUndefined()
  })
})
