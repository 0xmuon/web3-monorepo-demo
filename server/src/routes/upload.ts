// src/routes/upload.ts
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { ChessEngine } from '../engine/chess-engine'

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'agents');
    console.log('Upload directory:', uploadDir);
    
    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      console.log('Creating upload directory...');
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with .cpp extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}.cpp`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Only allow .cpp files
    if (!file.originalname.endsWith('.cpp')) {
      console.error('Invalid file type:', file.originalname);
      cb(null, false);
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// POST endpoint to handle file uploads
router.post("/agent", upload.single("file"), async (req, res) => {
  console.log('Upload request received:', {
    file: req.file,
    body: req.body,
    headers: req.headers
  });

  if (!req.file) {
    console.log('No file in request');
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (!req.body.wallet) {
    console.log('No wallet address provided');
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try {
    // Verify file exists after upload
    if (!fs.existsSync(req.file.path)) {
      throw new Error(`File not found at path: ${req.file.path}`);
    }

    console.log('File saved successfully at:', req.file.path);

    // Get the file ID from the filename (without extension)
    const fileId = path.basename(req.file.filename, '.cpp');
    console.log('Generated fileId:', fileId);

    // Return the file information
    res.json({
      success: true,
      fileId,
      message: 'File uploaded successfully',
      name: req.file.originalname,
      path: req.file.path
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({
      error: 'Failed to process upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;