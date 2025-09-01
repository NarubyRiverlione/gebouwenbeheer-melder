import type { Request, Response } from "express"
import reportRepo from "../repositories/ReportRepository.js"
import type { NewReport } from "../models/Report.js"

export const createReport = (req: Request, res: Response) => {
  const data = req.body as NewReport
  const report = reportRepo.create(data)
  res.status(201).json(report)
}

export const listReports = (_req: Request, res: Response) => {
  const reports = reportRepo.findAll()
  res.json(reports)
}

export const countUnprocessedReports = (_req: Request, res: Response) => {
  const count = reportRepo.countUnprocessed()
  res.json({ count })
}

export const queryReports = (req: Request, res: Response) => {
  const { start, end, processed, resolved } = req.query
  const reports = reportRepo.queryByDate(
    start as string | undefined,
    end as string | undefined,
    processed !== undefined ? processed === "true" : undefined,
    resolved !== undefined ? resolved === "true" : undefined,
  )
  res.json(reports)
}

export const ingestEmail = (req: Request, res: Response) => {
  const data = req.body as Partial<NewReport>
  const errors: string[] = []
  if (!data.message) errors.push("message is required")
  if (errors.length) {
    return res.status(400).json({ errors })
  }
  const newReportData: NewReport = {
    message: data.message!,
    building: data.building ?? null,
    floor: data.floor ?? null,
    apartment_Number: data.apartment_Number ?? null,
    reporter_name: data.reporter_name ?? null,
    reporter_email: data.reporter_email ?? null,
    reporter_phone: data.reporter_phone ?? null,
    category: data.category ?? null,
    priority: data.priority ?? null,
  }
  const report = reportRepo.create(newReportData)
  res.status(201).json(report)
}
