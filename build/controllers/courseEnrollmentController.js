"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOtpController = exports.verifyOtpController = exports.createByAnonymous = exports.deleteController = exports.updateController = exports.getByIdController = exports.createController = exports.getAllController = void 0;
const appResponse_1 = require("../utils/helpers/appResponse");
const catchAsync_1 = require("../utils/helpers/catchAsync");
const courseQueryService_1 = require("../service/courseQueryService");
const getAllController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const courses = await (0, courseQueryService_1.getAll)(Object.assign({}, req.query));
    return (0, appResponse_1.successResponse)(courses, res, { message: "Course Enrollments Fetched successfully!" });
});
exports.getAllController = getAllController;
const createController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const courseData = req.body;
    const newCourse = await (0, courseQueryService_1.create)(courseData);
    (0, appResponse_1.successResponse)(newCourse, res);
});
exports.createController = createController;
const createByAnonymous = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const courseData = req.body;
    const newEnroll = await (0, courseQueryService_1.create)({
        courseId: courseData.courseId,
        extra: courseData.extra,
        qualification: courseData.qualification,
        mode: courseData.mode,
        occupation: courseData.occupation,
        widget: courseData.widget,
        applicant: {
            name: courseData.name,
            email: courseData.email,
            phone: courseData.phone,
            location: courseData.location,
        }
    });
    (0, appResponse_1.successResponse)(newEnroll, res);
});
exports.createByAnonymous = createByAnonymous;
const getByIdController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return appResponse_1.courseEnrollmentResponse.notFound(null, res);
    }
    const course = await (0, courseQueryService_1.getById)(id);
    (0, appResponse_1.successResponse)(course, res);
});
exports.getByIdController = getByIdController;
const updateController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return appResponse_1.courseEnrollmentResponse.notFound(null, res);
    }
    const course = await (0, courseQueryService_1.updateById)(id, req.body);
    (0, appResponse_1.successResponse)(course, res, { message: "Course Enrollment Updated successfully!" });
});
exports.updateController = updateController;
const deleteController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return appResponse_1.courseErrorResponse.notFound(null, res);
    }
    await (0, courseQueryService_1.deleteById)(id);
    (0, appResponse_1.successResponse)(null, res, { message: "Course Enrollment deleted successfully!" });
});
exports.deleteController = deleteController;
const verifyOtpController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { token, otp } = req.body;
    if (!token || !otp) {
        throw new Error("Error: 400: Token and OTP are required");
    }
    const result = await (0, courseQueryService_1.verifyOtpAndUpdate)(token, otp);
    (0, appResponse_1.successResponse)(result, res);
});
exports.verifyOtpController = verifyOtpController;
const resendOtpController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { token, verificationId } = req.body;
    if (!token && !verificationId) {
        return (0, appResponse_1.errorResponse)({}, res, { status: 400, message: 'token or verificationId is required' });
    }
    const result = await (0, courseQueryService_1.resendOtp)({ token, verificationId });
    if (result && result.token) {
        return (0, appResponse_1.successResponse)(result, res, { message: 'OTP resent successfully' });
    }
    if (result === null || result === void 0 ? void 0 : result.invalidToken) {
        return (0, appResponse_1.errorResponse)({}, res, { message: 'Invalid token', status: 400 });
    }
    return (0, appResponse_1.successResponse)(result, res);
});
exports.resendOtpController = resendOtpController;
