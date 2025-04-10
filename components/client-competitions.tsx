"use client"

import { useState, useEffect } from 'react'
import { LoadingState } from '@/components/ui/loading-state'
import { CompetitionsList } from './competitions-list'
import type { Competition } from '@/types/dashboard'

interface ClientCompetitionsProps {
  initialData?: Competition[]
}

export function ClientCompetitions({ initialData = [] }: ClientCompetitionsProps) {
  const [competitions, setCompetitions] = useState<Competition[]>(initialData)
  const [loading, setLoading] = useState(!initialData.length)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData.length) return

    async function fetchCompetitions() {
      try {
        const res = await fetch('/api/competitions')
        if (!res.ok) throw new Error('Failed to fetch competitions')
        const data = await res.json()
        setCompetitions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitions()
  }, [initialData])

  if (loading) return <LoadingState />
  if (error) return <div className="text-red-500">{error}</div>

  return <CompetitionsList competitions={competitions} />
} 