"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../../config/common");
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_delete_1 = __importDefault(require("mongoose-delete"));
mongoose_paginate_v2_1.default.paginate.options = common_1.paginateOptions;
const blogSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    slug: { type: String },
    content: { type: String, required: true },
    coverImage: { type: String },
    excerpt: { type: String },
    author: { type: mongoose_1.Schema.ObjectId, required: true, ref: "User" },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    category: { type: mongoose_1.Schema.ObjectId, default: null, ref: 'BlogCategory' }
}, { timestamps: true });
blogSchema.index({ published: 1, createdAt: -1 });
blogSchema.index({ isFeatured: 1, published: 1 });
blogSchema.index({ tags: 1, published: 1 });
blogSchema.index({ category: 1, published: 1 });
blogSchema.index({ slug: 1 });
blogSchema.plugin(mongoose_paginate_v2_1.default);
blogSchema.plugin(mongoose_delete_1.default, { deletedAt: true, overrideMethods: 'all' });
const Blog = (0, mongoose_1.model)('Blog', blogSchema);
exports.default = Blog;
