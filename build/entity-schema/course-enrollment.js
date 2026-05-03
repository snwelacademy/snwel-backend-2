"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnrollmentAnonymously = exports.updateCourseEnrollment = exports.createCourseEnrollment = void 0;
const zod_1 = require("zod");
const enrollmentApplicantSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    location: zod_1.z.any().optional(),
});
exports.createCourseEnrollment = zod_1.z.object({
    userId: zod_1.z.string().optional(),
    courseId: zod_1.z.string(),
    status: zod_1.z.enum(['ACTIVE', 'PENDING', 'DECLINED']).default('PENDING').optional(),
    paymentStatus: zod_1.z.enum(['PAID', 'PENDING', 'FAILED']).default('PENDING').optional(),
    paymentMethod: zod_1.z.enum(['CASH', 'EXTERNAL', 'INAPP']).optional(),
    expiredAt: zod_1.z.string().optional(),
    extra: zod_1.z.object({
        agree: zod_1.z.boolean(),
    }),
    qualification: zod_1.z.string(),
    mode: zod_1.z.string(),
    occupation: zod_1.z.string(),
    widget: zod_1.z.string().optional(),
    applicant: enrollmentApplicantSchema.optional(),
});
exports.updateCourseEnrollment = zod_1.z.object({
    _id: zod_1.z.string()
}).merge(exports.createCourseEnrollment);
exports.createEnrollmentAnonymously = zod_1.z.object({
    name: zod_1.z.string().min(2, { message: "Username must be at least 2 characters." }),
    email: zod_1.z.string().email(),
    courseId: zod_1.z.string(),
    phone: zod_1.z.string(),
    location: zod_1.z.object({
        addr: zod_1.z.string().optional(),
        city: zod_1.z.string(),
        state: zod_1.z.string(),
        country: zod_1.z.string()
    }),
    extra: zod_1.z.object({
        agree: zod_1.z.boolean(),
    }),
    qualification: zod_1.z.string(),
    mode: zod_1.z.string(),
    occupation: zod_1.z.string(),
    widget: zod_1.z.string().optional()
});
