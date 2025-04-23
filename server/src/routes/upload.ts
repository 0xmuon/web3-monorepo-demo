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

// Google Drive API setup
const credentials = {
  type: process.env.GOOGLE_DRIVE_TYPE,
  project_id: process.env.GOOGLE_DRIVE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_DRIVE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_DRIVE_AUTH_URI,
  token_uri: process.env.GOOGLE_DRIVE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_DRIVE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_DRIVE_CLIENT_CERT_URL
};

// Validate required credentials
const requiredCredentials = [
  'GOOGLE_DRIVE_TYPE',
  'GOOGLE_DRIVE_PROJECT_ID',
  'GOOGLE_DRIVE_PRIVATE_KEY',
  'GOOGLE_DRIVE_CLIENT_EMAIL',
  'GOOGLE_DRIVE_CLIENT_ID'
];

const missingCredentials = requiredCredentials.filter(key => !process.env[key]);

if (missingCredentials.length > 0) {
  const errorMessage = `Missing required Google Drive credentials: ${missingCredentials.join(', ')}. Please ensure all required environment variables are set.`;
  console.error(errorMessage);
  console.error('Current environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PWD: process.cwd(),
  });
  throw new Error(errorMessage);
}

const auth = new GoogleAuth({
  credentials,
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

    // Upload to Google Drive
    let driveResponse;
    try {
      driveResponse = await drive.files.create({
        requestBody: {
          name: req.file.filename,
          mimeType: 'text/x-c++src',
        },
        media: {
          mimeType: 'text/x-c++src',
          body: fs.createReadStream(req.file.path),
        },
      });
      console.log('File uploaded to Google Drive:', driveResponse.data);
    } catch (error) {
      const driveError = error as Error;
      console.error('Google Drive upload failed:', driveError);
      throw new Error(`Google Drive upload failed: ${driveError.message}`);
    }

    // Get the file ID from the filename (without extension)
    const fileId = path.basename(req.file.filename, '.cpp');
    console.log('Generated fileId:', fileId);

    // Clean up the local file
    try {
      fs.unlinkSync(req.file.path);
      console.log('Local file cleaned up');
    } catch (cleanupError) {
      console.error('Failed to clean up local file:', cleanupError);
      // Continue even if cleanup fails
    }

    // Return the file information
    res.json({
      success: true,
      fileId,
      driveFileId: driveResponse.data.id,
      message: 'File uploaded successfully',
      name: req.file.originalname
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