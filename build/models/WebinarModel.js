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
exports.WebinarModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const common_1 = require("../config/common");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
mongoose_paginate_v2_1.default.paginate.options = common_1.paginateOptions;
const WebinarSchema = new mongoose_1.Schema({
    id: String,
    title: String,
    shortDescription: String,
    content: String,
    startDate: { type: mongoose_1.Schema.Types.Date, default: new Date() },
    slug: String,
    thumbnail: String,
    coverImage: { type: String },
    isActive: { type: Boolean, default: true },
    hosts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: [] }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    curriculum: [{ title: String, duration: String }],
    videoUrl: { type: String, default: null }
}, { timestamps: true });
WebinarSchema.index({ slug: 1 }, { unique: true });
WebinarSchema.index({ isActive: 1, startDate: 1 });
WebinarSchema.index({ startDate: -1 });
WebinarSchema.index({ createdAt: -1 });
WebinarSchema.index({ hosts: 1 });
WebinarSchema.plugin(mongoose_paginate_v2_1.default);
exports.WebinarModel = mongoose_1.default.model('Webinar', WebinarSchema);
