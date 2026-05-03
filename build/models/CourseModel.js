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
exports.CourseModel = exports.COURSE_STATUS = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const common_1 = require("../config/common");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
mongoose_paginate_v2_1.default.paginate.options = common_1.paginateOptions;
var COURSE_STATUS;
(function (COURSE_STATUS) {
    COURSE_STATUS["SAVED"] = "SAVED";
    COURSE_STATUS["PUBLISHED"] = "PUBLISHED";
})(COURSE_STATUS || (exports.COURSE_STATUS = COURSE_STATUS = {}));
const CourseSchema = new mongoose_1.Schema({
    id: String,
    image: String,
    title: String,
    slug: { type: String, unique: true },
    shortDescription: String,
    text: String,
    courseDuration: String,
    categories: [{ type: mongoose_1.Types.ObjectId, ref: 'CourseCategory' }],
    instructors: [{ type: mongoose_1.Types.ObjectId, ref: 'User' }],
    content: { type: mongoose_1.Schema.Types.Mixed },
    difficulty: String,
    language: [String],
    assessment: String,
    certificate: Boolean,
    lessons: Number,
    rating: { type: Number, default: 0 },
    enrolled: { type: Number, default: 0 },
    isPopular: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    discount: Number,
    isPremium: { type: Boolean, default: false },
    masterCategory: String,
    appearence: {
        themeColor: String,
        forgroundColor: String,
    },
    images: {
        promotionalCardImage: String,
        iconImage: String,
    },
    curriculum: [{
            title: String,
            duration: String,
            unit: String,
            classCount: String,
            curriculumType: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Master'
            }
        }],
    status: { type: String, default: COURSE_STATUS.SAVED },
    qualifications: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Master', default: [] }],
    trainingModes: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Master', default: [] }],
    widget: { type: mongoose_1.default.Schema.Types.String }
}, { timestamps: true });
CourseSchema.pre('save', async function (next) {
    try {
        const slug = (0, slugify_1.default)(this.title, { lower: true });
        const existingCourse = await exports.CourseModel.findOne({ slug });
        if (existingCourse) {
            let counter = 1;
            while (true) {
                const newSlug = `${slug}-${counter}`;
                const categoryWithSlug = await exports.CourseModel.findOne({ slug: newSlug });
                if (!categoryWithSlug) {
                    this.slug = newSlug;
                    break;
                }
                counter++;
            }
        }
        else {
            this.slug = slug;
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
CourseSchema.plugin(mongoose_paginate_v2_1.default);
CourseSchema.index({ slug: 1 }, { unique: true });
CourseSchema.index({ title: 'text' });
CourseSchema.index({ status: 1 });
CourseSchema.index({ status: 1, createdAt: -1 });
CourseSchema.index({ categories: 1, status: 1 });
CourseSchema.index({ isPopular: 1, status: 1 });
CourseSchema.index({ isPremium: 1, status: 1 });
CourseSchema.index({ rating: -1 });
CourseSchema.index({ createdAt: -1 });
CourseSchema.index({ 'qualifications': 1 });
CourseSchema.index({ 'trainingModes': 1 });
exports.CourseModel = mongoose_1.default.model('Course', CourseSchema);
