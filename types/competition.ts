export interface Competition {
  _id: string
  title: string
  description: string
  prize: number
  startDate: string
  endDate: string
  status: 'upcoming' | 'active' | 'completed'
  participants: string[]
} 