import "reflect-metadata"
import dotenv from "dotenv"
import { ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./modules/AppModule.js"

dotenv.config()

// Create and start the Nest application, export the underlying HTTP server so
// tests (and supertest) can use it via `import '../src/main.js'`.
async function createAndStart() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  const port = process.env["PORT"] || 3000
  // initialize and listen
  await app.listen(Number(port))
  console.log(`Server listening on port ${port}`)
  return app
}

const _appPromise = createAndStart()

// Export the http server for supertest. We await the promise to ensure it's ready
// when imported by tests. Top-level await is supported under ESM.
const _app = await _appPromise
export default _app.getHttpServer()
