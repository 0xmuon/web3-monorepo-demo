"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/upload.ts
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const google_auth_library_1 = require("google-auth-library");
const router = express_1.default.Router();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'agents');
        console.log('Upload directory:', uploadDir);
        // Ensure the upload directory exists
        if (!fs_1.default.existsSync(uploadDir)) {
            console.log('Creating upload directory...');
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
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
const upload = (0, multer_1.default)({
    storage,
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
const auth = new google_auth_library_1.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file']
});
const drive = googleapis_1.google.drive({
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
        if (!fs_1.default.existsSync(req.file.path)) {
            throw new Error(`File not found at path: ${req.file.path}`);
        }
        console.log('File saved successfully at:', req.file.path);
        // Get the file ID from the filename (without extension)
        const fileId = path_1.default.basename(req.file.filename, '.cpp');
        console.log('Generated fileId:', fileId);
        // Return the file information
        res.json({
            success: true,
            fileId,
            message: 'File uploaded successfully',
            path: req.file.path
        });
    }
    catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({
            error: 'Failed to process upload',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
