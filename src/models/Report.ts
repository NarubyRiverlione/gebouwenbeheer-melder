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

export interface NewReport {
  message: string
  building?: string | null
  floor?: string | null
  apartment_Number?: string | null
  reporter_name?: string | null
  reporter_email?: string | null
  reporter_phone?: string | null
  category?: string | null
  priority?: string | null
}
