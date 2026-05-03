"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityFeed = exports.getRecentEnrollments = exports.getTopPerformingCourses = exports.getRevenueTrend = exports.getDashboardStats = void 0;
const CourseModel_1 = require("../../models/CourseModel");
const CourseEnrollment_1 = __importDefault(require("../../models/CourseEnrollment"));
const SnwelEnquiry_1 = __importDefault(require("../../models/SnwelEnquiry"));
const date_fns_1 = require("date-fns");
const getDashboardStats = async () => {
    var _a, _b, _c;
    const now = new Date();
    const startOfCurrentMonth = (0, date_fns_1.startOfMonth)(now);
    const startOfLastMonth = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, 1));
    const endOfLastMonth = (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(now, 1));
    const totalRevenue = await CourseEnrollment_1.default.aggregate([
        { $match: { status: { $in: ['completed', 'active'] } } },
        { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' } },
        { $unwind: '$course' },
        { $group: { _id: null, total: { $sum: '$course.pricing.amount' } } },
    ]);
    const lastMonthRevenue = await CourseEnrollment_1.default.aggregate([
        {
            $match: {
                status: { $in: ['completed', 'active'] },
                createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            },
        },
        { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' } },
        { $unwind: '$course' },
        { $group: { _id: null, total: { $sum: '$course.pricing.amount' } } },
    ]);
    const thisMonthRevenue = await CourseEnrollment_1.default.aggregate([
        {
            $match: {
                status: { $in: ['completed', 'active'] },
                createdAt: { $gte: startOfCurrentMonth },
            },
        },
        { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' } },
        { $unwind: '$course' },
        { $group: { _id: null, total: { $sum: '$course.pricing.amount' } } },
    ]);
    const revenueTotal = ((_a = totalRevenue[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    const lastMonthTotal = ((_b = lastMonthRevenue[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
    const thisMonthTotal = ((_c = thisMonthRevenue[0]) === null || _c === void 0 ? void 0 : _c.total) || 0;
    const revenueChange = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    const totalCourses = await CourseModel_1.CourseModel.countDocuments();
    const publishedCourses = await CourseModel_1.CourseModel.countDocuments({ status: 'PUBLISHED' });
    const draftCourses = await CourseModel_1.CourseModel.countDocuments({ status: 'SAVED' });
    const totalEnrollments = await CourseEnrollment_1.default.countDocuments();
    const enrollmentsThisMonth = await CourseEnrollment_1.default.countDocuments({
        createdAt: { $gte: startOfCurrentMonth },
    });
    const enrollmentsLastMonth = await CourseEnrollment_1.default.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });
    const enrollmentChange = enrollmentsLastMonth > 0
        ? ((enrollmentsThisMonth - enrollmentsLastMonth) / enrollmentsLastMonth) * 100
        : 0;
    const totalEnquiries = await SnwelEnquiry_1.default.countDocuments();
    const pendingEnquiries = await SnwelEnquiry_1.default.countDocuments({ status: 'PENDING' });
    const resolvedEnquiries = await SnwelEnquiry_1.default.countDocuments({ status: 'RESOLVED' });
    return {
        revenue: {
            total: revenueTotal,
            change: Number(revenueChange.toFixed(2)),
            trend: revenueChange >= 0 ? 'up' : 'down',
        },
        courses: {
            total: totalCourses,
            published: publishedCourses,
            drafts: draftCourses,
        },
        enrollments: {
            total: totalEnrollments,
            thisMonth: enrollmentsThisMonth,
            change: Number(enrollmentChange.toFixed(2)),
        },
        enquiries: {
            total: totalEnquiries,
            pending: pendingEnquiries,
            resolved: resolvedEnquiries,
        },
    };
};
exports.getDashboardStats = getDashboardStats;
const getRevenueTrend = async (options) => {
    const { period = '6months', startDate, endDate } = options;
    let start;
    let end = new Date();
    if (startDate && endDate) {
        start = (0, date_fns_1.parseISO)(startDate);
        end = (0, date_fns_1.parseISO)(endDate);
    }
    else {
        const monthsBack = period === '12months' ? 12 : 6;
        start = (0, date_fns_1.subMonths)(end, monthsBack);
    }
    const enrollments = await CourseEnrollment_1.default.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
                status: { $in: ['completed', 'active'] },
            },
        },
        {
            $lookup: {
                from: 'courses',
                localField: 'courseId',
                foreignField: '_id',
                as: 'course',
            },
        },
        { $unwind: '$course' },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                revenue: { $sum: '$course.pricing.amount' },
                enrollments: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = enrollments.map((item) => ({
        month: monthNames[item._id.month - 1],
        revenue: item.revenue || 0,
        enrollments: item.enrollments || 0,
    }));
    const total = data.reduce((sum, item) => sum + item.revenue, 0);
    const average = data.length > 0 ? total / data.length : 0;
    return {
        data,
        total,
        average: Math.round(average),
    };
};
exports.getRevenueTrend = getRevenueTrend;
const getTopPerformingCourses = async (options) => {
    const { limit, period } = options;
    let startDate;
    const now = new Date();
    switch (period) {
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'quarter':
            startDate = (0, date_fns_1.subMonths)(now, 3);
            break;
        case 'year':
            startDate = (0, date_fns_1.subMonths)(now, 12);
            break;
        case 'month':
        default:
            startDate = (0, date_fns_1.startOfMonth)(now);
            break;
    }
    const topCourses = await CourseEnrollment_1.default.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: { $in: ['completed', 'active'] },
            },
        },
        {
            $group: {
                _id: '$courseId',
                enrollments: { $sum: 1 },
            },
        },
        { $sort: { enrollments: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'courses',
                localField: '_id',
                foreignField: '_id',
                as: 'course',
            },
        },
        { $unwind: '$course' },
    ]);
    return topCourses.map((item) => {
        var _a;
        return ({
            courseId: item._id,
            title: item.course.title || 'Untitled',
            enrollments: item.enrollments,
            revenue: item.enrollments * (((_a = item.course.pricing) === null || _a === void 0 ? void 0 : _a.amount) || 0),
            trend: 'up',
            percentageChange: 0,
        });
    });
};
exports.getTopPerformingCourses = getTopPerformingCourses;
const getRecentEnrollments = async (limit) => {
    const enrollments = await CourseEnrollment_1.default.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'name email profilePic')
        .populate('courseId', 'title')
        .lean();
    return enrollments.map((enrollment) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return ({
            enrollmentId: enrollment._id,
            user: {
                name: ((_a = enrollment.userId) === null || _a === void 0 ? void 0 : _a.name) || 'Anonymous',
                email: ((_b = enrollment.userId) === null || _b === void 0 ? void 0 : _b.email) || 'N/A',
                avatar: ((_c = enrollment.userId) === null || _c === void 0 ? void 0 : _c.profilePic) || null,
            },
            course: {
                title: ((_d = enrollment.courseId) === null || _d === void 0 ? void 0 : _d.title) || 'Unknown Course',
                id: (_e = enrollment.courseId) === null || _e === void 0 ? void 0 : _e._id,
            },
            amount: ((_g = (_f = enrollment.courseId) === null || _f === void 0 ? void 0 : _f.pricing) === null || _g === void 0 ? void 0 : _g.amount) || 0,
            currency: ((_j = (_h = enrollment.courseId) === null || _h === void 0 ? void 0 : _h.pricing) === null || _j === void 0 ? void 0 : _j.currency) || 'USD',
            timestamp: enrollment.createdAt,
        });
    });
};
exports.getRecentEnrollments = getRecentEnrollments;
const getActivityFeed = async (options) => {
    const { limit, types } = options;
    const activities = [];
    if (!types || types.includes('course')) {
        const recentCourses = await CourseModel_1.CourseModel.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('createdBy', 'name')
            .lean();
        activities.push(...recentCourses.map((course) => {
            var _a, _b;
            return ({
                id: `course_${course._id}`,
                type: 'course',
                action: 'created',
                user: {
                    name: ((_a = course.createdBy) === null || _a === void 0 ? void 0 : _a.name) || 'System',
                    id: (_b = course.createdBy) === null || _b === void 0 ? void 0 : _b._id,
                },
                target: {
                    title: course.title,
                    id: course._id,
                },
                timestamp: course.createdAt,
            });
        }));
    }
    if (!types || types.includes('revenue')) {
        const recentEnrollments = await CourseEnrollment_1.default.find()
            .sort({ createdAt: -1 })
            .limit(Math.ceil(limit / 2))
            .populate('userId', 'name')
            .populate('courseId', 'title')
            .lean();
        activities.push(...recentEnrollments.map((enrollment) => {
            var _a, _b, _c, _d;
            return ({
                id: `enrollment_${enrollment._id}`,
                type: 'revenue',
                action: 'enrolled',
                user: {
                    name: ((_a = enrollment.userId) === null || _a === void 0 ? void 0 : _a.name) || 'User',
                    id: (_b = enrollment.userId) === null || _b === void 0 ? void 0 : _b._id,
                },
                target: {
                    title: ((_c = enrollment.courseId) === null || _c === void 0 ? void 0 : _c.title) || 'Course',
                    id: (_d = enrollment.courseId) === null || _d === void 0 ? void 0 : _d._id,
                },
                timestamp: enrollment.createdAt,
            });
        }));
    }
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activities.slice(0, limit);
};
exports.getActivityFeed = getActivityFeed;
