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
const testimonialSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    position: { type: String, trim: true },
    company: { type: String, trim: true },
    content: { type: String, required: true },
    avatar: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date }
}, { timestamps: true });
testimonialSchema.index({ published: 1, createdAt: -1 });
testimonialSchema.plugin(mongoose_paginate_v2_1.default);
testimonialSchema.plugin(mongoose_delete_1.default, { deletedAt: true, overrideMethods: 'all' });
const Testimonial = (0, mongoose_1.model)('Testimonial', testimonialSchema);
exports.default = Testimonial;
