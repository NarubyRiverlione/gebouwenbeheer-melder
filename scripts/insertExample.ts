#!/usr/bin/env tsx
import "../src/main.ts"
import fs from 'fs/promises'
import dotenv from 'dotenv'

dotenv.config()

// Use global fetch (Node.js 18+)
const fetchFn = (globalThis as any).fetch as (
  input: RequestInfo,
  init?: RequestInit
) => Promise<Response>

const PORT = process.env.PORT || '3000'
const REPORTS_URL = `http://localhost:${PORT}/reports`

async function main() {
  try {
    const raw = await fs.readFile(
      new URL('../ExampleReports.json', import.meta.url),
      'utf-8'
    )
    const reports = JSON.parse(raw) as Array<Record<string, any>>
    console.log(`Posting ${reports.length} reports to ${REPORTS_URL}`)
    let success = 0
    let failure = 0
    for (const [i, report] of reports.entries()) {
      try {
        const res = await fetchFn(REPORTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        })
        if (!res.ok) {
          const text = await res.text()
          console.error(`Report ${i} failed: ${res.status} ${text}`)
          failure++
        } else {
          success++
        }
      } catch (err) {
        console.error(`Report ${i} exception:`, err)
        failure++
      }
    }
    console.log(`Completed. Success: ${success}, Failures: ${failure}`)
    process.exit(failure > 0 ? 1 : 0)
  } catch (err) {
    console.error('Failed to read ExampleReports.json:', err)
    process.exit(1)
  }
}

main()
