"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOtp = exports.verifyOtpAndUpdate = exports.getAllByCourseId = exports.getAllByUserId = exports.checkApplied = exports.deleteById = exports.updateById = exports.getById = exports.getAll = exports.create = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helpers_1 = require("../utils/helpers");
const mongodb_1 = require("mongodb");
const CourseEnrollment_1 = __importDefault(require("../models/CourseEnrollment"));
const constants_1 = require("../config/constants");
const logger_1 = require("../utils/logger");
const User_1 = require("../models/User");
const notificationService_1 = require("./notificationService");
const otpService_1 = require("./otpService");
const buildApplicantFromUser = (user) => {
    if (!user || !user.email)
        return undefined;
    return {
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location
    };
};
const isSameApplicant = (existing, incoming) => {
    if (!existing || !incoming)
        return false;
    if (!existing.email || !incoming.email)
        return false;
    if (existing.email !== incoming.email)
        return false;
    const existingPhone = (existing.phone || '').trim();
    const incomingPhone = (incoming.phone || '').trim();
    if (!existingPhone && !incomingPhone)
        return true;
    return existingPhone === incomingPhone;
};
const resolveApplicant = async (queryData) => {
    var _a;
    let applicant = queryData.applicant;
    if (!applicant && queryData.userId) {
        const user = await User_1.UserModel.findById(queryData.userId);
        applicant = buildApplicantFromUser(user);
    }
    if (!applicant || !applicant.email) {
        throw new Error('Error: 400: Applicant email is required for enrollment');
    }
    applicant.phone = ((_a = applicant.phone) === null || _a === void 0 ? void 0 : _a.trim()) || undefined;
    return applicant;
};
const create = async (queryData) => {
    var _a;
    try {
        const applicant = await resolveApplicant(queryData);
        const candidates = await CourseEnrollment_1.default.find({
            courseId: queryData.courseId,
            'applicant.email': applicant.email,
        });
        const exists = candidates.find((enrollment) => isSameApplicant(enrollment.applicant, applicant));
        if (exists && ((_a = exists.otp) === null || _a === void 0 ? void 0 : _a.verified) && isSameApplicant(exists.applicant, applicant)) {
            throw new Error('Error: 400: Course Enrollment already found.');
        }
        const otpObject = (0, helpers_1.generateOTPObject)({});
        const sessionExpiresAt = new Date(Date.now() + constants_1.Constants.OTP.SESSION_TTL_MINUTES * 60 * 1000);
        if (exists) {
            await exists.updateOne({
                otp: otpObject,
                applicant,
                extra: Object.assign(Object.assign({}, (exists.extra || {})), { otpSession: {
                        resendCount: 0,
                        lastSentAt: new Date(),
                        sessionExpiresAt,
                    } })
            });
            await (0, otpService_1.sendOtp)(otpObject.otp, applicant === null || applicant === void 0 ? void 0 : applicant.phone, applicant === null || applicant === void 0 ? void 0 : applicant.email);
            return {
                isVerified: false,
                token: (0, helpers_1.generateJwtToken)({
                    courseId: queryData.courseId,
                    userId: queryData.userId,
                    enrollmentId: exists._id
                })
            };
        }
        else {
            const _b = queryData, { userId } = _b, rest = __rest(_b, ["userId"]);
            let newCourseQuery = new CourseEnrollment_1.default(Object.assign(Object.assign({}, rest), { applicant, otp: otpObject, extra: {
                    otpSession: {
                        resendCount: 0,
                        lastSentAt: new Date(),
                        sessionExpiresAt,
                    }
                } }));
            await newCourseQuery.save();
            await (0, otpService_1.sendOtp)(otpObject.otp, applicant === null || applicant === void 0 ? void 0 : applicant.phone, applicant === null || applicant === void 0 ? void 0 : applicant.email);
            return {
                isVerified: false,
                token: (0, helpers_1.generateJwtToken)({
                    courseId: queryData.courseId,
                    userId,
                    enrollmentId: newCourseQuery._id
                })
            };
        }
    }
    catch (error) {
        throw new Error(`Error: creating course query: ${error.message}`);
    }
};
exports.create = create;
const createByClient = async (queryData) => {
    try {
        const applicant = await resolveApplicant(queryData);
        const candidates = await CourseEnrollment_1.default.find({
            courseId: queryData.courseId,
            'applicant.email': applicant.email,
        });
        const exists = candidates.find((enrollment) => isSameApplicant(enrollment.applicant, applicant));
        if (exists)
            throw new Error('Error: 400: Course Enrollment already found.');
        const _a = queryData, { userId } = _a, rest = __rest(_a, ["userId"]);
        const newCourseQuery = new CourseEnrollment_1.default(Object.assign(Object.assign({}, rest), { applicant }));
        return await newCourseQuery.save();
    }
    catch (error) {
        throw new Error(`Error: creating course query: ${error.message}`);
    }
};
const checkApplied = async (userId, courseId) => {
    try {
        return await CourseEnrollment_1.default.findOne({ userId: new mongodb_1.ObjectId(userId), courseId: new mongodb_1.ObjectId(courseId) }).populate("userId", ["email", "name", "profilePic"]).populate("courseId", "title slug");
    }
    catch (error) {
        throw new Error(`Error: validating course query: ${error.message}`);
    }
};
exports.checkApplied = checkApplied;
const getAllByUserId = async (userId) => {
    try {
        return await CourseEnrollment_1.default.find({ userId }).populate("userId", ["email", "name", "profilePic"]).populate("courseId", "title slug");
    }
    catch (error) {
        throw new Error(`Error: feching course query by userId: ${error.message}`);
    }
};
exports.getAllByUserId = getAllByUserId;
const getAllByCourseId = async (userId) => {
    try {
        return await CourseEnrollment_1.default.find({ userId }).populate("userId", ["email", "name", "profilePic"]).populate("courseId", "title slug");
    }
    catch (error) {
        throw new Error(`Error: feching course query by courseId: ${error.message}`);
    }
};
exports.getAllByCourseId = getAllByCourseId;
const getAll = async (options) => {
    try {
        const { limit = 10, page = 1, search, filter, sort, startDate, endDate } = options;
        const query = {};
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [{ "userId.name": searchRegex }, { "courseId.title": searchRegex }];
        }
        if (filter) {
            if (filter.status) {
                query.status = filter.status;
            }
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }
        const courseEnrollments = await CourseEnrollment_1.default.paginate(query, {
            populate: [
                { path: "userId", select: ["email", "name", "profilePic"] },
                { path: "courseId", select: ["title", "slug"] },
                { path: "qualification" },
                { path: "mode" },
                { path: "occupation" },
                { path: "widget" }
            ],
            page,
            limit,
            sort: sort ? (0, helpers_1.convertSortOrder)(sort) : { createdAt: -1 }
        });
        return courseEnrollments;
    }
    catch (error) {
        throw new Error(`Error retrieving course enrollments: ${error.message}`);
    }
};
exports.getAll = getAll;
const getById = async (id) => {
    try {
        return await CourseEnrollment_1.default.findById(id)
            .populate("userId", "email name profilePic")
            .populate(["courseId", 'qualification', 'mode', 'occupation', 'widget']);
    }
    catch (error) {
        throw new Error(`Error: retrieving course query: ${error.message}`);
    }
};
exports.getById = getById;
const updateById = async (id, updateData) => {
    try {
        await CourseEnrollment_1.default.findByIdAndUpdate(id, updateData, { new: true }).exec();
        return CourseEnrollment_1.default.findOne({ _id: new mongodb_1.ObjectId(id) }).populate("userId", "email name profilePic").populate("courseId", "title slug");
    }
    catch (error) {
        throw new Error(`Error: updating course query: ${error.message}`);
    }
};
exports.updateById = updateById;
const deleteById = async (id) => {
    try {
        console.log("Deleting course query with ID:", id);
        await CourseEnrollment_1.default.findByIdAndDelete(id).exec();
    }
    catch (error) {
        throw new Error(`Error: deleting course query: ${error.message}`);
    }
};
exports.deleteById = deleteById;
async function verifyOtpAndUpdate(token, otp) {
    var _a;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, constants_1.Constants.TOKEN_SECRET);
        const { enrollmentId, courseId, userId } = decoded;
        const enrollment = await CourseEnrollment_1.default.findById(enrollmentId).populate(["courseId", "userId"]);
        if (!enrollment || !enrollment.otp) {
            return {
                isVerified: false,
                enrollmentId: null,
                invalidToken: true,
            };
        }
        if (enrollment.otp.verified) {
            return {
                isVerified: true,
                enrollmentId: enrollment._id
            };
        }
        const now = new Date();
        if (now > enrollment.otp.expirationTime) {
            const session = ((_a = enrollment.extra) === null || _a === void 0 ? void 0 : _a.otpSession) || {};
            const sessionExpiresAt = session.sessionExpiresAt ? new Date(session.sessionExpiresAt) : undefined;
            const lastSentAt = session.lastSentAt ? new Date(session.lastSentAt) : undefined;
            const resendCount = typeof session.resendCount === 'number' ? session.resendCount : 0;
            const withinSession = sessionExpiresAt ? now < sessionExpiresAt : true;
            const cooldown = constants_1.Constants.OTP.RESEND_COOLDOWN_SEC;
            const sinceLast = lastSentAt ? Math.floor((now.getTime() - lastSentAt.getTime()) / 1000) : cooldown;
            const retryAfter = Math.max(0, cooldown - sinceLast);
            const resendAllowed = withinSession && resendCount < constants_1.Constants.OTP.MAX_RESENDS;
            return {
                isVerified: false,
                enrollmentId: null,
                invalidOtp: true,
                otpExpired: true,
                verificationId: enrollment._id.toString(),
                resend_allowed: resendAllowed,
                retry_after: retryAfter,
                session_expires_at: sessionExpiresAt ? sessionExpiresAt.toISOString() : undefined,
            };
        }
        if (enrollment.otp.otp !== otp && Number(otp) !== constants_1.Constants.OTP.MASTER_OTP) {
            return {
                isVerified: false,
                enrollmentId: null,
                invalidOtp: true,
                otpExpired: false
            };
        }
        enrollment.otp.verified = true;
        await enrollment.save();
        const user = enrollment.userId;
        try {
            await (0, notificationService_1.sendCourseEnquiryNotification)(enrollment.courseId, { email: user === null || user === void 0 ? void 0 : user.email, phone: user === null || user === void 0 ? void 0 : user.phone, userName: user === null || user === void 0 ? void 0 : user.name });
        }
        catch (error) {
            logger_1.logger.error('Error sending course enquiry notification', error);
        }
        return {
            isVerified: true,
            enrollmentId: enrollment._id
        };
    }
    catch (error) {
        console.error(error);
        logger_1.logger.error("Error: verifyOtpAndUpdate: ", error);
        throw new Error("Error: 500: OTP Verification failed");
    }
}
exports.verifyOtpAndUpdate = verifyOtpAndUpdate;
async function resendOtp(params) {
    var _a, _b, _c;
    try {
        const now = new Date();
        let enrollmentId = undefined;
        if (params === null || params === void 0 ? void 0 : params.verificationId) {
            enrollmentId = params.verificationId;
        }
        else if (params === null || params === void 0 ? void 0 : params.token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(params.token, constants_1.Constants.TOKEN_SECRET);
                enrollmentId = decoded.enrollmentId;
            }
            catch (err) {
                return {
                    invalidToken: true
                };
            }
        }
        if (!enrollmentId) {
            return {
                invalidToken: true
            };
        }
        const enrollment = await CourseEnrollment_1.default.findById(enrollmentId);
        if (!enrollment) {
            return {
                isVerified: false,
                enrollmentId: null,
                invalidToken: true,
            };
        }
        const session = ((_a = enrollment.extra) === null || _a === void 0 ? void 0 : _a.otpSession) || {};
        const sessionExpiresAt = session.sessionExpiresAt ? new Date(session.sessionExpiresAt) : new Date(Date.now() + constants_1.Constants.OTP.SESSION_TTL_MINUTES * 60 * 1000);
        const lastSentAt = session.lastSentAt ? new Date(session.lastSentAt) : undefined;
        const resendCount = typeof session.resendCount === 'number' ? session.resendCount : 0;
        const withinSession = now < sessionExpiresAt;
        const cooldown = constants_1.Constants.OTP.RESEND_COOLDOWN_SEC;
        const sinceLast = lastSentAt ? Math.floor((now.getTime() - lastSentAt.getTime()) / 1000) : cooldown;
        const retryAfter = Math.max(0, cooldown - sinceLast);
        const canResend = withinSession && resendCount < constants_1.Constants.OTP.MAX_RESENDS && retryAfter === 0;
        if (!withinSession) {
            return {
                resend_allowed: false,
                reason: 'SESSION_EXPIRED',
                retry_after: 0,
                session_expires_at: sessionExpiresAt.toISOString(),
            };
        }
        if (resendCount >= constants_1.Constants.OTP.MAX_RESENDS) {
            return {
                resend_allowed: false,
                reason: 'RESEND_LIMIT_REACHED',
                retry_after: retryAfter,
                session_expires_at: sessionExpiresAt.toISOString(),
            };
        }
        if (retryAfter > 0) {
            return {
                resend_allowed: false,
                reason: 'COOLDOWN',
                retry_after: retryAfter,
                session_expires_at: sessionExpiresAt.toISOString(),
            };
        }
        const newOtp = (0, helpers_1.generateOTPObject)({});
        enrollment.otp = newOtp;
        enrollment.extra = Object.assign(Object.assign({}, (enrollment.extra || {})), { otpSession: {
                resendCount: resendCount + 1,
                lastSentAt: now,
                sessionExpiresAt,
            } });
        await enrollment.save();
        const user = await User_1.UserModel.findById(enrollment.userId);
        await (0, otpService_1.sendOtp)(newOtp.otp, user === null || user === void 0 ? void 0 : user.phone, user === null || user === void 0 ? void 0 : user.email);
        const newToken = (0, helpers_1.generateJwtToken)({
            enrollmentId: enrollment._id.toString(),
            courseId: enrollment.courseId,
            userId: enrollment.userId
        });
        return {
            token: newToken,
            otp_expires_at: ((_c = (_b = newOtp.expirationTime) === null || _b === void 0 ? void 0 : _b.toISOString) === null || _c === void 0 ? void 0 : _c.call(_b)) || undefined,
            session_expires_at: sessionExpiresAt.toISOString(),
            resend_allowed: true,
            retry_after: constants_1.Constants.OTP.RESEND_COOLDOWN_SEC,
        };
    }
    catch (error) {
        console.error(error);
        return { success: false, message: 'An error occurred' };
    }
}
exports.resendOtp = resendOtp;
