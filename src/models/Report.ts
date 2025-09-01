export interface Report {
  id: number
  message: string
  building: string | null
  floor: string | null
  apartment_Number: string | null
  reporter_name: string | null
  reporter_email: string | null
  reporter_phone: string | null
  timestamp: string
  status: string
  is_processed: boolean
  is_resolved: boolean
  category: string | null
  priority: string | null
  cluster_id: number | null
  created_at: string
}

export type NewReport = Omit<
  Report,
  "id" | "timestamp" | "status" | "is_processed" | "is_resolved" | "created_at" | "cluster_id"
>
