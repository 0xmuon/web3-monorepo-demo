import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env')
}

let isConnected = false

export default async function dbConnect() {
  if (isConnected) {
    console.log('Using existing database connection')
    return
  }

  try {
    console.log('Connecting to MongoDB...')
    const db = await mongoose.connect(MONGODB_URI as string, {
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      retryReads: true,
      family: 4
    })
    
    isConnected = db.connections[0].readyState === 1
    console.log('Successfully connected to MongoDB Atlas')
    console.log('Database name:', (db.connection.db as { databaseName: string }).databaseName)
    console.log('Host:', db.connection.host)
  } catch (error) {
    console.error('MongoDB connection error:', error)
    isConnected = false
    return false
  }
}

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
  isConnected = false
})

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
  isConnected = false
  setTimeout(() => {
    console.log('Attempting to reconnect to MongoDB...')
    dbConnect()
  }, 5000)
})

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected')
  isConnected = true
}) 