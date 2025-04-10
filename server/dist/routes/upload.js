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
const keyFilePath = path_1.default.join(process.cwd(), '..', 'public', 'co3pe-453808-0e053faf0259.json');
console.log('Google Drive key file path:', keyFilePath);
if (!fs_1.default.existsSync(keyFilePath)) {
    console.error('Google Drive credentials file not found at:', keyFilePath);
    throw new Error('Google Drive credentials file not found');
}
const auth = new google_auth_library_1.GoogleAuth({
    keyFile: keyFilePath,
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
        console.error('Upload error:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        // Clean up the file in case of error
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        res.status(500).json({
            error: 'Upload failed',
            details: error.message,
            code: error.code
        });
    }
});
exports.default = router;
