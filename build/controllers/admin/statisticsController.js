"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogStatistics = exports.getJobStatistics = exports.getUserStatistics = exports.getCourseStatistics = void 0;
const catchAsync_1 = require("../../utils/helpers/catchAsync");
const appResponse_1 = require("../../utils/helpers/appResponse");
const statisticsService = __importStar(require("../../service/admin/statisticsService"));
exports.getCourseStatistics = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await statisticsService.getCourseStatistics();
    (0, appResponse_1.successResponse)(stats, res, { message: 'Course statistics fetched successfully' });
});
exports.getUserStatistics = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await statisticsService.getUserStatistics();
    (0, appResponse_1.successResponse)(stats, res, { message: 'User statistics fetched successfully' });
});
exports.getJobStatistics = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await statisticsService.getJobStatistics();
    (0, appResponse_1.successResponse)(stats, res, { message: 'Job statistics fetched successfully' });
});
exports.getBlogStatistics = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await statisticsService.getBlogStatistics();
    (0, appResponse_1.successResponse)(stats, res, { message: 'Blog statistics fetched successfully' });
});
