import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

console.log('Attempting MongoDB connection...')

const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4
}

async function dbConnect() {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log('Using existing MongoDB connection')
      return mongoose.connection
    }

    console.log('Connecting to MongoDB...')
    const conn = await mongoose.connect(MONGODB_URI, options)
    console.log('MongoDB connected successfully:', conn.connection.host)
    return conn
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export default dbConnect 