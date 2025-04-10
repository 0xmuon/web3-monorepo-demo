"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongodb_1 = __importDefault(require("./lib/mongodb"));
const fs_1 = __importDefault(require("fs"));
const competitions_1 = __importDefault(require("./routes/competitions"));
const users_1 = __importDefault(require("./routes/users"));
const stats_1 = __importDefault(require("./routes/stats"));
const upload_1 = __importDefault(require("./routes/upload"));
const chess_1 = __importDefault(require("./routes/chess"));
// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
    dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env.production') });
}
else {
    dotenv_1.default.config();
}
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
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
app.use(body_parser_1.default.json());
app.use(express_1.default.static('uploads'));
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir);
}
// Connect to MongoDB
(0, mongodb_1.default)();
// Create a router for the health check
const healthRouter = express_1.default.Router();
// Health check endpoint
healthRouter.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        serverUrl: process.env.NODE_ENV === 'production' ? 'https://co3pe.onrender.com' : 'http://localhost:5000'
    });
});
// Routes
app.use('/api/competitions', competitions_1.default);
app.use('/api/users', users_1.default);
app.use('/api/stats', stats_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/chess', chess_1.default);
app.use('/health', healthRouter);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!', details: err.message });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Server URL: ${process.env.NODE_ENV === 'production' ? 'https://co3pe.onrender.com' : 'http://localhost:5000'}`);
});
