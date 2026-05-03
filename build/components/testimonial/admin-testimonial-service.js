"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetAllTestimonials = exports.adminDeleteTestimonial = exports.adminUpdateTestimonial = exports.adminGetTestimonialById = exports.adminCreateTestimonial = void 0;
const testimonial_model_1 = __importDefault(require("./testimonial-model"));
const helpers_1 = require("../../utils/helpers");
async function adminCreateTestimonial(data) {
    try {
        if (data.published && !data.publishedAt) {
            data.publishedAt = new Date();
        }
        const testimonial = await testimonial_model_1.default.create(data);
        return testimonial.toObject();
    }
    catch (error) {
        console.error(`Failed to create testimonial: ${error.message}`, error);
        throw new Error(`Failed to create testimonial: ${error.message}`);
    }
}
exports.adminCreateTestimonial = adminCreateTestimonial;
async function adminGetTestimonialById(testimonialId) {
    try {
        const testimonial = await testimonial_model_1.default.findById(testimonialId);
        return testimonial ? testimonial.toObject() : null;
    }
    catch (error) {
        throw new Error(`Failed to get testimonial: ${error.message}`);
    }
}
exports.adminGetTestimonialById = adminGetTestimonialById;
async function adminUpdateTestimonial(testimonialId, updateData) {
    try {
        if (updateData.published && !updateData.publishedAt) {
            updateData.publishedAt = new Date();
        }
        const testimonial = await testimonial_model_1.default.findByIdAndUpdate(testimonialId, updateData, { new: true });
        return testimonial ? testimonial.toObject() : null;
    }
    catch (error) {
        throw new Error(`Failed to update testimonial: ${error.message}`);
    }
}
exports.adminUpdateTestimonial = adminUpdateTestimonial;
async function adminDeleteTestimonial(testimonialId) {
    try {
        await testimonial_model_1.default.delete({ _id: testimonialId });
    }
    catch (error) {
        throw new Error(`Failed to delete testimonial: ${error.message}`);
    }
}
exports.adminDeleteTestimonial = adminDeleteTestimonial;
const adminGetAllTestimonials = async (options) => {
    try {
        const { limit = 10, page = 1, search, filter, sort, startDate, endDate } = options;
        const query = {};
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [{ name: searchRegex }, { content: searchRegex }, { company: searchRegex }];
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }
        switch (filter === null || filter === void 0 ? void 0 : filter.statusFilter) {
            case 'published':
                query.published = true;
                break;
            case 'draft':
                query.published = false;
                break;
            case 'all':
            default:
                query.published = { $in: [true, false] };
                break;
        }
        const testimonials = await testimonial_model_1.default.paginate(query, {
            page,
            limit,
            sort: sort ? (0, helpers_1.convertSortOrder)(sort) : { createdAt: -1 },
        });
        return testimonials;
    }
    catch (error) {
        throw new Error(`Error retrieving testimonials: ${error.message}`);
    }
};
exports.adminGetAllTestimonials = adminGetAllTestimonials;
