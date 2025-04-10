"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}
let isConnected = false;
async function dbConnect() {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }
    try {
        console.log('Connecting to MongoDB...');
        const db = await mongoose_1.default.connect(MONGODB_URI, {
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            heartbeatFrequencyMS: 10000,
            retryReads: true,
            family: 4
        });
        isConnected = db.connections[0].readyState === 1;
        console.log('Successfully connected to MongoDB Atlas');
        console.log('Database name:', db.connection.db.databaseName);
        console.log('Host:', db.connection.host);
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        isConnected = false;
        return false;
    }
}
exports.default = dbConnect;
mongoose_1.default.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    isConnected = false;
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    isConnected = false;
    setTimeout(() => {
        console.log('Attempting to reconnect to MongoDB...');
        dbConnect();
    }, 5000);
});
mongoose_1.default.connection.on('connected', () => {
    console.log('MongoDB connected');
    isConnected = true;
});
