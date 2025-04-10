import mongoose, { Connection } from 'mongoose'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local')
}

const MONGODB_URI: string = process.env.MONGODB_URI

interface MongooseConnection {
  conn: Connection | null
  promise: Promise<typeof mongoose> | null
}

let cached: MongooseConnection = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  }
}

async function dbConnect(): Promise<Connection> {
  if (cached.conn) {
    console.log('Using cached database connection')
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }

    console.log('Connecting to MongoDB...')
    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    const mongooseInstance = await cached.promise
    cached.conn = mongooseInstance.connection
    console.log('MongoDB connected successfully')
    
    // Add connection event listeners
    cached.conn.on('error', console.error.bind(console, 'MongoDB connection error:'))
    cached.conn.once('open', () => {
      console.log('MongoDB connection opened')
    })
    
    return cached.conn
  } catch (e) {
    cached.promise = null
    console.error('MongoDB connection failed:', e)
    throw e
  }
}

export default dbConnect 