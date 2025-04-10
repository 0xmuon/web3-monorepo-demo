// src/routes/upload.ts
import express from "express";
import multer from "multer";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { drive_v3 } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
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
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Google Drive API setup
const keyFilePath = path.join(process.cwd(), '..', 'public', 'co3pe-453808-0e053faf0259.json');
console.log('Google Drive key file path:', keyFilePath);

if (!fs.existsSync(keyFilePath)) {
  console.error('Google Drive credentials file not found at:', keyFilePath);
  throw new Error('Google Drive credentials file not found');
}

const auth = new GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/drive.file']
});

const drive = google.drive({
  version: 'v3',
  auth: auth
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
      path: req.file.path
    });
  } catch (error: any) {
    console.error('Upload error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    // Clean up the file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message,
      code: error.code
    });
  }
});

export default router;