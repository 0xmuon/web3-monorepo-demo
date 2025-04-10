"use client"

import { Suspense } from "react"
import { LoadingState } from "./ui/loading-state"
import { ClientCompetitions } from "./client-competitions"
import type { Competition } from "@/types/dashboard"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

async function getCompetitions(): Promise<Competition[]> {
  try {
    const res = await fetch(`/api/competitions`, {
      cache: 'force-cache', // Use Next.js cache
      next: { 
        revalidate: 300 // Revalidate every 5 minutes
      }
    })
    
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  } catch (error) {
    console.error('Error fetching competitions:', error)
    return []
  }
}

interface CompetitionsListProps {
  competitions: Competition[]
}

export function CompetitionsList({ competitions }: CompetitionsListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {competitions.map((competition) => (
        <Card key={competition._id}>
          <CardHeader>
            <CardTitle>{competition.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{competition.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export async function CompetitionsListComponent() {
  const initialCompetitions = await getCompetitions()

  return (
    <Suspense fallback={<LoadingState />}>
      <ClientCompetitions initialData={initialCompetitions} />
    </Suspense>
  )
} 