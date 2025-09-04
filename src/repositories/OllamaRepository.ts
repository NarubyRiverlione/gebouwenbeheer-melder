import type { Report } from "../models/Report.js"
import type { IssueCluster } from "../models/IssueCluster.js"
import ClusterRepository from "./ClusterRepository.js"
import type { GenerateResponse } from "ollama"
import ReportRepository from "./ReportRepository.js"
import { Ollama } from "ollama"
const model = process.env["OLLAMA_MODEL"]
if (!model) throw new Error("OLLAMA_MODEL is not set in environment variables")
const ollama = new Ollama()

type CompareResult = { similar: true; cluster_id: number } | { similar: false }

const createComparePrompt = (message: string, clusters: IssueCluster[]): string => {
  const clustersText = `${clusters.map((cluster) => `${cluster.id}   ${cluster.main_issue}`).join("\n")}`
  //  console.debug(`-- message compared with : ${clustersText}`)
  return `
U bent een expert in het categoriseren van onderhoudsproblemen in woongebouwen. Een bewoner heeft het volgende probleem gemeld: "${message}"
We hebben de volgende bestaande onopgeloste probleemclusters in ons systeem.
${clustersText}

Bepaal of het gemelde probleem vergelijkbaar is met een van de bestaande probleemclusters.
Elke probleemcluster begint met een cluster_id, gebruik dit niet om te vergelijken, maar alleen om te antwoorden welk cluster overeenkomt.
Antwoord in json-formaat met een van de twee onderstaande antwoorden:
1. Als het vergelijkbaar is met een bestaand cluster, antwoord dan met:{"similar": true, "cluster_id": cluster_id}
2. Als het niet vergelijkbaar is met een van de bestaande clusters, antwoord dan met:{"similar": false}
Geef alleen een van de twee bovenstaande antwoorden zonder verdere uitleg.
`
}

const createCategoryPrompt = (message: string): string => {
  const categories = [
    "Defecte verlichting",
    "Liftproblemen",
    "Verstopping of geurhinder",
    "Waterlek of vochtprobleem",
    "Verwarmingsproblemen",
    "Defecte garagepoort",
    "Schade of slijtage",
    "Geluidsoverlast",
    "Ongedierte",
    "Brievenbus of parlofoon",
  ]

  return `U bent een expert in het categoriseren van onderhoudsproblemen in woongebouwen. Een bewoner heeft het volgende probleem gemeld: "${message}"
Bepaal de meest geschikte categorie voor dit probleem uit de volgende lijst:
${categories.map((cat) => `- ${cat}`).join("\n")}

antwoord in de json formaat {category: categorie} zonder verdere uitleg.
`
}

export const categorizeWithOllama = async (message: string): Promise<string> => {
  const prompt = createCategoryPrompt(message)
  const response: GenerateResponse = await ollama.generate({
    model,
    prompt,
    format: "json",
    stream: false,
    // think: true,
  })
  const result: { category: string } = JSON.parse(response.response as string)
  return result.category ?? "Categorie onbekend"
}

const compareWithOllama = async (prompt: string): Promise<CompareResult> => {
  const response: GenerateResponse = await ollama.generate({
    model,
    prompt,
    format: "json",
    stream: false,
    // think: true,
  })

  const result: CompareResult = JSON.parse(response.response as string)
  return result
}

const createNewCluster = (report: Report) => {
  const newCluster = ClusterRepository.new(report.message, report.category)
  const createdCluster = ClusterRepository.create(newCluster)
  ReportRepository.assignCluster(report.id, createdCluster.id)
  return createdCluster.id
}

// return if report is a new issue cluster
export const compareReportWithClusters = async (report: Report, clusters: IssueCluster[]) => {
  // if no unresolved clusters, create a new cluster
  if (clusters.length === 0) {
    console.log("- No unresolved clusters, creating new cluster for report", report.debugId)
    createNewCluster(report)
    return Promise.resolve(true)
  }
  console.log(
    `- Comparing report ${report.debugId} with ${clusters.length} unresolved clusters for category ${report.category} `,
  )
  // create prompt with the report message and the list of existing clusters
  const prompt = createComparePrompt(report.message, clusters)
  const result = await compareWithOllama(prompt)
  if (result.similar) {
    // if similar issue cluster =  this issue is already reported, add it to the cluster
    console.log("- Report", report.debugId, "is similar to cluster", result.cluster_id)
    // TODO check is report and found cluster have the same category,

    ReportRepository.assignCluster(report.id, result.cluster_id)
    return Promise.resolve(false)
  }
  // if no similar issue cluster = create a new issue cluster
  const newClusterId = createNewCluster(report)
  console.log(
    `- Report ${report.debugId}  is not similar to any existing cluster, creating new cluster ${newClusterId}`,
  )
  return Promise.resolve(true)
}
