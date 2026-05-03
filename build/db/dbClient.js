"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../config/common");
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        if (!common_1.CommonConfig.DATABASE_URL || common_1.CommonConfig.DATABASE_URL.trim().length === 0) {
            throw new Error('DATABASE_URL is not set. Please provide a valid MongoDB connection string.');
        }
        mongoose_1.default.set('strictQuery', true);
        mongoose_1.default.connection.on('connected', () => {
            const { host, port, name } = mongoose_1.default.connection;
            console.log(`MongoDB connected: ${host}:${port}/${name}`);
        });
        mongoose_1.default.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err.message);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });
        await mongoose_1.default.connect(common_1.CommonConfig.DATABASE_URL, {
            serverSelectionTimeoutMS: 10000,
        });
    }
    catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};
exports.default = connectDB;
