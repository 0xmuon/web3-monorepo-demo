// src/index.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import dbConnect from './lib/mongodb';
import fs from 'fs';
import competitionsRouter from './routes/competitions';
import usersRouter from './routes/users';
import statsRouter from './routes/stats';
import uploadRouter from './routes/upload';
import chessRouter from './routes/chess';

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });
} else {
  dotenv.config();
}

const app: Express = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  'https://co3pe.vercel.app',
  'https://co3pe.vercel.app/',
  'https://co3pe-git-main-rudraksh-joshis-projects-444a4ec5.vercel.app',
  'https://co3pe-j8uapg95q-rudraksh-joshis-projects-444a4ec5.vercel.app',
  'http://localhost:3000'
];

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Request with no origin allowed');
      return callback(null, true);
    }
    
    console.log('Request origin:', origin);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Origin not allowed:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    
    console.log('Origin allowed:', origin);
    return callback(null, true);
  },
  credentials: true
}));

// Middleware
app.use(bodyParser.json());
app.use(express.static('uploads'));

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Connect to MongoDB
dbConnect();

// Create a router for the health check
const healthRouter = express.Router();

// Health check endpoint
healthRouter.get('/', (req: Request, res: Response): void => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    serverUrl: process.env.NODE_ENV === 'production' ? 'https://co3pe.onrender.com' : 'http://localhost:5000'
  });
});

// Routes
app.use('/api/competitions', competitionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/stats', statsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/chess', chessRouter);
app.use('/health', healthRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Server URL: ${process.env.NODE_ENV === 'production' ? 'https://co3pe.onrender.com' : 'http://localhost:5000'}`);
});