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
const slugify_1 = __importDefault(require("slugify"));
const common_1 = require("../config/common");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
mongoose_paginate_v2_1.default.paginate.options = common_1.paginateOptions;
const locationSchema = new mongoose_1.Schema({
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    zipcode: { type: String, required: true },
});
const jobVacancySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true },
    companyName: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    location: { type: locationSchema },
    salaryRange: { type: String },
    employmentType: { type: String, required: true, enum: ['full-time', 'part-time', 'contract', 'temporary'] },
    applicationDeadline: { type: Date, required: true },
    categories: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'JobCategory' }],
    postedDate: { type: Date, default: Date.now },
    contactInfo: { type: String },
    experienceLevel: { type: String, required: true, enum: ['entry-level', 'mid-level', 'senior-level'] },
    companyLogo: { type: String },
    additionalInfo: { type: String },
    status: { type: String, default: 'open', enum: ['open', 'closed', 'filled'] },
    remoteWorkOption: { type: Boolean, default: false },
    benefits: { type: String },
    applicationLink: { type: String },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false }
});
jobVacancySchema.pre('save', async function (next) {
    const job = this;
    let baseSlug = (0, slugify_1.default)(job.title, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await mongoose_1.default.models.JobVacancy.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter++}`;
    }
    job.slug = uniqueSlug;
    next();
});
jobVacancySchema.plugin(mongoose_paginate_v2_1.default);
jobVacancySchema.index({ slug: 1 }, { unique: true });
jobVacancySchema.index({ title: 'text', companyName: 'text' });
jobVacancySchema.index({ status: 1 });
jobVacancySchema.index({ isActive: 1, postedDate: -1 });
jobVacancySchema.index({ 'location.city': 1 });
jobVacancySchema.index({ 'location.state': 1 });
jobVacancySchema.index({ 'location.country': 1 });
jobVacancySchema.index({ categories: 1 });
jobVacancySchema.index({ applicationDeadline: 1 });
jobVacancySchema.index({ isFeatured: 1, postedDate: -1 });
const JobVacancyModel = mongoose_1.default.model('JobVacancy', jobVacancySchema);
exports.default = JobVacancyModel;
