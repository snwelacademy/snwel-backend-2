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
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const common_1 = require("../../../config/common");
mongoose_paginate_v2_1.default.paginate.options = common_1.paginateOptions;
const CourseCategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
    parentCategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'CourseCategory'
    },
    order: { type: Number, default: 0 }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
CourseCategorySchema.index({ name: 'text' });
CourseCategorySchema.index({ slug: 1 });
CourseCategorySchema.index({ parentCategory: 1 });
CourseCategorySchema.index({ order: 1 });
CourseCategorySchema.plugin(mongoose_paginate_v2_1.default);
exports.CourseCategoryModel = mongoose_1.default.model('CourseCategory', CourseCategorySchema);
