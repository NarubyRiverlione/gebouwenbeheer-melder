import type { Request, Response } from "express"
import reportRepo from "../repositories/ReportRepository.js"
import type { NewReport } from "../models/Report.js"
import ClusterRepository from "../repositories/ClusterRepository.js"
import type { NewIssueCluster } from "../models/IssueCluster.js"

// create a new report, set processNow to true to process it immediately
export const createReport = async (req: Request, res: Response) => {
  const data = req.body["report"] as NewReport
  // const processNow = req.body["processNow"] ?? false
  // save the report
  const reportResult = reportRepo.create(data)
  // // if no category, categorize it
  // if (!reportResult.category) {
  //   const category = await reportRepo.categorize(reportResult)
  //   console.log(`- Report ${reportResult.debugId} categorized as ${category}`)
  //   if (data.debug_category && data.debug_category !== category) {
  //     console.warn(`-- Overriding category ${category} with user provided category ${data.category}`)
  //   }
  //   ReportRepository.updateCategory(reportResult.id, category)
  // }
  // // if requested, process the report immediately
  // if (processNow) {
  //   await reportRepo.processOne(reportResult)
  // }
  res.status(201).json(reportResult)
}

export const listReports = (_req: Request, res: Response) => {
  const reports = reportRepo.findAll()
  res.json(reports)
}

export const countUnprocessedReports = (_req: Request, res: Response) => {
  const count = reportRepo.countUnprocessed()
  res.json({ count })
}

export const getUnprocessedReports = (_req: Request, res: Response) => {
  const reports = reportRepo.queryUnprocessed()
  res.json(reports)
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


export const processReports = (_req: Request, res: Response) => {
  const dummyCluster: NewIssueCluster = {
    main_issue: "test",
    severity: "low",
    category: "test",
    estimated_impact: "low",
  }
  ClusterRepository.create(dummyCluster)
  res.json([{ id: 1, status: "resolved" }]) // TODO: implement clustering logic
}
