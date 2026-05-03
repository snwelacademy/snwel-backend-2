"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogStatistics = exports.getJobStatistics = exports.getUserStatistics = exports.getCourseStatistics = void 0;
const CourseModel_1 = require("../../models/CourseModel");
const CourseEnrollment_1 = __importDefault(require("../../models/CourseEnrollment"));
const User_1 = require("../../models/User");
const date_fns_1 = require("date-fns");
let JobVacancyModel;
let JobApplicationModel;
let BlogModel;
try {
    JobVacancyModel = require('../../models/JobVacancy').JobVacancyModel;
}
catch (e) {
    JobVacancyModel = null;
}
try {
    JobApplicationModel = require('@/models/JobApplication').JobApplicationModel;
}
catch (e) {
    JobApplicationModel = null;
}
try {
    BlogModel = require('@/models/Blog').BlogModel;
}
catch (e) {
    BlogModel = null;
}
const getCourseStatistics = async () => {
    const totalCourses = await CourseModel_1.CourseModel.countDocuments();
    const publishedCourses = await CourseModel_1.CourseModel.countDocuments({ status: 'PUBLISHED' });
    const draftCourses = await CourseModel_1.CourseModel.countDocuments({ status: 'SAVED' });
    const totalEnrollments = await CourseEnrollment_1.default.countDocuments();
    const averageRating = 4.5;
    const completedEnrollments = await CourseEnrollment_1.default.countDocuments({ status: 'completed' });
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
    return {
        totalCourses,
        publishedCourses,
        draftCourses,
        totalEnrollments,
        averageRating,
        completionRate: Number(completionRate.toFixed(2)),
    };
};
exports.getCourseStatistics = getCourseStatistics;
const getUserStatistics = async () => {
    const now = new Date();
    const startOfThisMonth = (0, date_fns_1.startOfMonth)(now);
    const totalUsers = await User_1.UserModel.countDocuments();
    const activeUsers = await User_1.UserModel.countDocuments({ isActive: true });
    const newThisMonth = await User_1.UserModel.countDocuments({
        createdAt: { $gte: startOfThisMonth },
    });
    const roleAggregation = await User_1.UserModel.aggregate([
        {
            $lookup: {
                from: 'roles',
                localField: 'roles',
                foreignField: '_id',
                as: 'roleDetails',
            },
        },
        { $unwind: { path: '$roleDetails', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$roleDetails.name',
                count: { $sum: 1 },
            },
        },
    ]);
    const byRole = {};
    roleAggregation.forEach((item) => {
        const roleName = item._id || 'No Role';
        byRole[roleName.toLowerCase()] = item.count;
    });
    return {
        totalUsers,
        activeUsers,
        newThisMonth,
        byRole,
    };
};
exports.getUserStatistics = getUserStatistics;
const getJobStatistics = async () => {
    if (!JobVacancyModel || !JobApplicationModel) {
        return {
            activeJobs: 0,
            totalApplications: 0,
            pendingReview: 0,
            avgApplicationsPerJob: 0,
        };
    }
    const activeJobs = await JobVacancyModel.countDocuments({ status: 'ACTIVE' });
    const totalApplications = await JobApplicationModel.countDocuments();
    const pendingReview = await JobApplicationModel.countDocuments({ status: 'PENDING' });
    const avgApplicationsPerJob = activeJobs > 0 ? totalApplications / activeJobs : 0;
    return {
        activeJobs,
        totalApplications,
        pendingReview,
        avgApplicationsPerJob: Number(avgApplicationsPerJob.toFixed(1)),
    };
};
exports.getJobStatistics = getJobStatistics;
const getBlogStatistics = async () => {
    var _a;
    if (!BlogModel) {
        return {
            totalBlogs: 0,
            published: 0,
            drafts: 0,
            totalViews: 0,
            avgViewsPerPost: 0,
        };
    }
    const totalBlogs = await BlogModel.countDocuments();
    const published = await BlogModel.countDocuments({ status: 'PUBLISHED' });
    const drafts = await BlogModel.countDocuments({ status: 'DRAFT' });
    const viewsAggregation = await BlogModel.aggregate([
        {
            $group: {
                _id: null,
                totalViews: { $sum: '$views' },
            },
        },
    ]);
    const totalViews = ((_a = viewsAggregation[0]) === null || _a === void 0 ? void 0 : _a.totalViews) || 0;
    const avgViewsPerPost = totalBlogs > 0 ? totalViews / totalBlogs : 0;
    return {
        totalBlogs,
        published,
        drafts,
        totalViews,
        avgViewsPerPost: Math.round(avgViewsPerPost),
    };
};
exports.getBlogStatistics = getBlogStatistics;
