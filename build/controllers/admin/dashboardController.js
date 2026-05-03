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
exports.getActivityFeed = exports.getRecentEnrollments = exports.getTopCourses = exports.getRevenueTrend = exports.getDashboardStats = void 0;
const catchAsync_1 = require("../../utils/helpers/catchAsync");
const appResponse_1 = require("../../utils/helpers/appResponse");
const dashboardService = __importStar(require("../../service/admin/dashboardService"));
exports.getDashboardStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await dashboardService.getDashboardStats();
    (0, appResponse_1.successResponse)(stats, res, { message: 'Dashboard statistics fetched successfully' });
});
exports.getRevenueTrend = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { period, startDate, endDate } = req.query;
    const trend = await dashboardService.getRevenueTrend({
        period: period,
        startDate: startDate,
        endDate: endDate,
    });
    (0, appResponse_1.successResponse)(trend, res, { message: 'Revenue trend fetched successfully' });
});
exports.getTopCourses = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { limit = 5, period = 'month' } = req.query;
    const courses = await dashboardService.getTopPerformingCourses({
        limit: Number(limit),
        period: period,
    });
    (0, appResponse_1.successResponse)({ courses }, res, { message: 'Top performing courses fetched successfully' });
});
exports.getRecentEnrollments = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { limit = 10 } = req.query;
    const enrollments = await dashboardService.getRecentEnrollments(Number(limit));
    (0, appResponse_1.successResponse)({ enrollments }, res, { message: 'Recent enrollments fetched successfully' });
});
exports.getActivityFeed = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { limit = 10, types } = req.query;
    const typesArray = types ? types.split(',') : undefined;
    const activities = await dashboardService.getActivityFeed({
        limit: Number(limit),
        types: typesArray,
    });
    (0, appResponse_1.successResponse)({ activities }, res, { message: 'Activity feed fetched successfully' });
});
