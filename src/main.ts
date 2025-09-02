import express, { type Request, type Response, type NextFunction } from "express"
import dotenv from "dotenv"
import reportRouter from "./routes/ReportRoutes.js"
import clusterRouter from "./routes/ClusterRoutes.js"
import { ingestEmail } from "./controllers/ReportController.js"

dotenv.config()

const app = express()
app.use(express.json())
app.post("/ingest", ingestEmail)

// Mount feature routers
app.use("/reports", reportRouter)
app.use("/clusters", clusterRouter)

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const error = err as { status?: number; message?: string }
  console.error(error)
  res.status(error.status || 500).json({ error: error.message || "Internal Server Error" })
})

const port = process.env["PORT"] || 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

export default app
