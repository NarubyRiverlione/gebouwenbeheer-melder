import { InferenceClient } from "@huggingface/inference"
const huggingfaceApiKey = process.env["HUGGINGFACE_API_KEY"] || ""
if (!huggingfaceApiKey) {
  throw new Error("HUGGINGFACE_API_KEY is not set")
}
const hf = new InferenceClient(huggingfaceApiKey)
// const model = "GroNLP/robbert-2022-dutch-sentence-transformers"
const model = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Arrays must have the same length")
  }
  const dot = a.reduce((sum, val, i) => sum + val * (b[i] ?? 0), 0)
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dot / (normA * normB)
}

export async function getEmbedding(sentence: string): Promise<number[]> {
  const embeddings = (await hf.featureExtraction({
    model,
    inputs: sentence,
  })) as number[]
  return embeddings
}
