import { GoogleGenAI } from "@google/genai"
import type { Report } from "../models/Report.js"
import ClusterRepository from "./ClusterRepository.js"
import cosineSimilarity from "compute-cosine-similarity"
import ReportRepository from "./ReportRepository.js"

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

export const CompareReport = async (report: Report) => {
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

const getEmbeddings = async (compare: CompareMessages[]): Promise<EmbeddingsResult[]> => {
  const ai = new GoogleGenAI({})
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: compare.map((c) => ({ text: c.message })),
    config: { taskType: "SEMANTIC_SIMILARITY" },
  })
  if (!response.embeddings) throw new Error("No embedding found")
  const embeddings: EmbeddingsResult[] = response.embeddings.map((e, index) => ({
    id: compare[index]?.id ?? null,
    embedding: e.values ?? null,
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

const createNewCluster = (report: Report) => {
  const newCluster = ClusterRepository.new(report.message, report.category)
  const createdCluster = ClusterRepository.create(newCluster)
  ReportRepository.assignCluster(report.id, createdCluster.id)
  return createdCluster.id
}
