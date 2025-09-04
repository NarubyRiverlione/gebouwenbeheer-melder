import type { Report } from "../models/Report.js"
import type { IssueCluster } from "../models/IssueCluster.js"
import ClusterRepository from "./ClusterRepository.js"
import type { GenerateResponse } from "ollama"
import ReportRepository from "./ReportRepository.js"

type CompareResult = { similar: true; cluster_id: number } | { similar: false }

const createPrompt = (message: string, clusters: IssueCluster[]): string =>`
U bent een expert in het categoriseren van onderhoudsproblemen in woongebouwen. Een bewoner heeft het volgende probleem gemeld: "${message}"
We hebben de volgende bestaande onopgeloste probleemclusters in ons systeem:
${clusters.map((issue) => `${issue.id}. ${issue.main_issue}`).join("\n")}

Bepaal of het gemelde probleem vergelijkbaar is met een van de bestaande probleemclusters.
Antwoord in json-formaat met een van de twee onderstaande antwoorden:
1. Als het vergelijkbaar is met een bestaand cluster, antwoord dan met:
{
  "similar": true,
  "cluster_id": X
}
waarbij X het nummer is van het vergelijkbare cluster uit de bovenstaande lijst.

2. Als het niet vergelijkbaar is met een van de bestaande clusters, antwoord dan met:
{
  "similar": false
}
Geef alleen een van de twee bovenstaande antwoorden zonder verdere uitleg.`

const compareWithOllama = async (prompt: string): Promise<CompareResult> => {
  const { Ollama } = await import("ollama")
  const model = process.env["OLLAMA_MODEL"]
  if (!model) throw new Error("OLLAMA_MODEL is not set in environment variables")

  const ollama = new Ollama()
  const response: GenerateResponse = await ollama.generate({
    model,
    prompt,
    format: "json",
    stream: false,
  })

  const result: CompareResult = JSON.parse(response.response as string)
  return result
}

const createNewCluster = (report: Report) => {
  const newCluster = ClusterRepository.new(report.message)
  const createdCluster = ClusterRepository.create(newCluster)
  ReportRepository.assignCluster(report.id, createdCluster.id)
}

// return if report is a new issue cluster
const compareReportWithClusters = async (report: Report, clusters: IssueCluster[]) => {
  // if no unresolved clusters, create a new cluster
  if (clusters.length === 0) {
    console.log("- No existing clusters, creating new cluster for report", report.debugId)
    createNewCluster(report)
    return Promise.resolve(true)
  }

  // create prompt with the report message and the list of existing clusters
  const prompt = createPrompt(report.message, clusters)
  const result = await compareWithOllama(prompt)
  if (result.similar) {
    // if similar issue cluster =  this issue is already reported, add it to the cluster
    console.log("- Report", report.debugId, "is similar to cluster", result.cluster_id)
    ReportRepository.assignCluster(report.id, result.cluster_id)
    return Promise.resolve(false)
  }
  // if no similar issue cluster = create a new issue cluster
  console.log("- Report", report.debugId, "is not similar to any existing cluster, creating new cluster")
  createNewCluster(report)
  return Promise.resolve(true)
}
export default compareReportWithClusters
