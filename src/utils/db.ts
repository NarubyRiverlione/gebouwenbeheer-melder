import Database from "better-sqlite3"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

const dbFile = process.env["DB_FILE"] || "database.sqlite"
const dbPath = path.resolve(process.cwd(), dbFile)
const db = new Database(dbPath)

export default db
