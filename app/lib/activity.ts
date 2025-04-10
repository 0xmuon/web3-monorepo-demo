import dbConnect from './mongodb'
import Activity from '@/models/activity'

export async function createActivity(data: {
  user: string
  type: string
  description: string
  metadata?: any
}) {
  try {
    await dbConnect()
    const activity = await Activity.create(data)
    return activity
  } catch (error) {
    console.error('Failed to create activity:', error)
    throw error
  }
} 