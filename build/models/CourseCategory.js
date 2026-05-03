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
exports.CourseCategoryModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const CourseCategorySchema = new mongoose_1.Schema({
    title: String,
    description: String,
    shortDescription: String,
    isPremium: Boolean,
    parentCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CourseCategory' },
    slug: { type: String, unique: true },
    isActive: { type: Boolean, default: true },
    image: { type: String }
});
CourseCategorySchema.pre('save', async function (next) {
    const category = this;
    try {
        const slug = (0, slugify_1.default)(category.title, { lower: true });
        const existingCategory = await exports.CourseCategoryModel.findOne({ slug });
        if (existingCategory) {
            let counter = 1;
            while (true) {
                const newSlug = `${slug}-${counter}`;
                const categoryWithSlug = await exports.CourseCategoryModel.findOne({ slug: newSlug });
                if (!categoryWithSlug) {
                    category.slug = newSlug;
                    break;
                }
                counter++;
            }
        }
        else {
            category.slug = slug;
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
CourseCategorySchema.index({ slug: 1 }, { unique: true });
CourseCategorySchema.index({ isActive: 1 });
CourseCategorySchema.index({ parentCategory: 1 });
CourseCategorySchema.index({ isPremium: 1 });
exports.CourseCategoryModel = mongoose_1.default.model('CourseCategory', CourseCategorySchema);
