import type { Report } from "../models/Report.js"
import ClusterRepository from "./ClusterRepository.js"
import type { EmbedResponse, GenerateResponse } from "ollama"
import ReportRepository from "./ReportRepository.js"
import { Ollama } from "ollama"

const model = process.env["OLLAMA_MODEL"]
if (!model) throw new Error("OLLAMA_MODEL is not set in environment variables")
const embeddingModel = process.env["OLLAMA_EMBEDDING_MODEL"]
if (!embeddingModel) throw new Error("OLLAMA_EMBEDDING_MODEL is not set in environment variables")
const ollama = new Ollama()

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

const createNewCluster = (report: Report) => {
  const newCluster = ClusterRepository.new(report.message, report.category)
  const createdCluster = ClusterRepository.create(newCluster)
  ReportRepository.assignCluster(report.id, createdCluster.id)
  return createdCluster.id
}

export const compareReportWithClusters = async (report: Report) => {
  const unresolvedClustersByCategory = ClusterRepository.findUnresolvedByCategory(
    report.category || "Onbekend",
  )
  // no unresolved clusters for this reported category, create a new cluster
  if (unresolvedClustersByCategory.length === 0) {
    console.log("- No unresolved clusters, creating new cluster for report", report.debugId)
    createNewCluster(report)
    return Promise.resolve(true)
  }
  console.log(
    `found ${unresolvedClustersByCategory.length} unresolved cluster for report category ${report.category}`,
  )
  const compare: CompareMessages[] = [
    { id: report.id, message: report.message },
    ...unresolvedClustersByCategory.map((c) => ({ id: c.id, message: c.main_issue })),
  ]

  const embeddings: EmbeddingsResult[] = await getEmbeddings(compare)
  if (!embeddings) {
    throw new Error("No embeddings returned from Google GenAI")
  }
  const compareResults: CompareResult[] = compareEmbeddings(embeddings)
  if (!compareResults || compareResults.length < 1) {
    throw new Error("No compare results")
  }
  const bestResult = compareResults[0]?.score ?? 0
  const threshold: number = parseInt(process.env["REPORT_SIMILARITY_THRESHOLD"] ?? "60", 10)
  if (bestResult > threshold) {
    // if similar issue cluster =  this issue is already reported, add it to the cluster
    console.log("- Report", report.debugId, "is similar to cluster", compareResults[0]?.id)
    // TODO check is report and found cluster have the same category,

    ReportRepository.assignCluster(report.id, compareResults[0]?.id ?? 0)
    return Promise.resolve(false)
  }
  // if no similar issue cluster = create a new issue cluster
  const newClusterId = createNewCluster(report)
  console.log(
    `- Report ${report.debugId}  is not similar to any existing cluster, creating new cluster ${newClusterId}`,
  )
  return Promise.resolve(true)
}

import cosineSimilarity from "compute-cosine-similarity"

type EmbeddingsResult = {
  id: number | null
  embedding: number[] | null
}
type CompareResult = {
  id: number
  score: number
}
type CompareMessages = {
  id: number
  message: string
}

const getEmbeddings = async (compare: CompareMessages[]): Promise<EmbeddingsResult[]> => {
  const input = compare.map((c) => c.message)
  const response: EmbedResponse = await ollama.embed({ model: embeddingModel, input })

  if (!response.embeddings) throw new Error("No embedding found")
  const embeddings: EmbeddingsResult[] = response.embeddings.map((embedding, index) => ({
    id: compare[index]?.id ?? null,
    embedding,
  }))

  return embeddings
}

const compareEmbeddings = (embeddings: EmbeddingsResult[]): CompareResult[] => {
  if (embeddings.length < 2) throw new Error("no embeddings to compare")

  const base = embeddings[0]?.embedding ?? []
  const results: CompareResult[] = []

  for (let i = 1; i < embeddings.length; i++) {
    const compare = embeddings[i]?.embedding ?? []
    const similarity = cosineSimilarity(base, compare)
    // console.log(`- similarity with issue cluster ${embeddings[i]?.id}: ${similarity})`)
    if (!similarity) throw new Error("No similarity score calculated")
    results.push({ id: embeddings[i]?.id ?? 0, score: similarity * 100 })
  }
  results.sort((a, b) => b.score - a.score)
  return results
}
