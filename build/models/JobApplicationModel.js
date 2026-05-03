"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const common_1 = require("../config/common");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
mongoose_paginate_v2_1.default.paginate.options = common_1.paginateOptions;
const jobApplicationSchema = new mongoose_1.Schema({
    jobId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'JobVacancy' },
    applicantName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String },
    status: { type: String, enum: ['applied', 'interview', 'offered', 'rejected'], default: 'applied' },
    appliedDate: { type: Date, default: Date.now },
    notes: { type: String },
}, { timestamps: true });
jobApplicationSchema.plugin(mongoose_paginate_v2_1.default);
jobApplicationSchema.index({ jobId: 1, appliedDate: -1 });
jobApplicationSchema.index({ status: 1, appliedDate: -1 });
jobApplicationSchema.index({ email: 1 });
jobApplicationSchema.index({ appliedDate: -1 });
jobApplicationSchema.index({ createdAt: -1 });
const JobApplication = (0, mongoose_1.model)('JobApplication', jobApplicationSchema);
exports.default = JobApplication;
