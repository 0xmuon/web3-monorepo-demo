"use client"

import { useEffect, useState } from "react"
import type { Competition } from "@/types/competition"

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompetitions() {
      try {
        const res = await fetch('/api/competitions')
        const data = await res.json()
        setCompetitions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch competitions')
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitions()
  }, [])

  return { competitions, loading, error }
} 