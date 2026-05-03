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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const common_1 = require("../config/common");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
mongoose_paginate_v2_1.default.paginate.options = common_1.paginateOptions;
const EnrollmentPersonSchema = new mongoose_1.Schema({
    name: { type: String },
    email: { type: String, required: true },
    phone: { type: String, default: null },
    location: { type: mongoose_1.Schema.Types.Mixed, default: null }
}, { _id: false });
const CourseEnrollmentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false },
    courseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
    status: { type: String, enum: ['ACTIVE', 'PENDING', 'DECLINED'], default: 'PENDING' },
    paymentStatus: { type: String, enum: ['PAID', 'PENDING', 'FAILED'], default: 'PENDING' },
    paymentMethod: { type: String, enum: ['CASH', 'EXTERNAL', 'INAPP'] },
    expiredAt: { type: Date },
    otp: {
        otp: String,
        expirationTime: Date,
        verified: { type: Boolean, default: false },
    },
    applicant: { type: EnrollmentPersonSchema, required: false },
    extra: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    qualification: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Master', required: true },
    mode: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Master', required: true },
    occupation: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Master', required: true },
    widget: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Widget', default: null }
}, { timestamps: true });
CourseEnrollmentSchema.index({ status: 1, createdAt: -1 });
CourseEnrollmentSchema.index({ status: 1, updatedAt: -1 });
CourseEnrollmentSchema.index({ courseId: 1, createdAt: -1 });
CourseEnrollmentSchema.index({ userId: 1, createdAt: -1 });
CourseEnrollmentSchema.index({ paymentStatus: 1, createdAt: -1 });
CourseEnrollmentSchema.index({ paymentStatus: 1, updatedAt: -1 });
CourseEnrollmentSchema.index({ createdAt: -1 });
CourseEnrollmentSchema.index({ courseId: 1, 'applicant.email': 1, 'applicant.phone': 1 });
CourseEnrollmentSchema.plugin(mongoose_paginate_v2_1.default);
const CourseEnrollmentModel = mongoose_1.default.model('CourseEnrollment', CourseEnrollmentSchema);
exports.default = CourseEnrollmentModel;
