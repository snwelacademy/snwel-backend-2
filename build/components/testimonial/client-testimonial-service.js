"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublishedTestimonials = exports.getTestimonialById = void 0;
const testimonial_model_1 = __importDefault(require("./testimonial-model"));
const helpers_1 = require("../../utils/helpers");
async function getTestimonialById(testimonialId) {
    try {
        const testimonial = await testimonial_model_1.default.findOne({
            _id: testimonialId,
            published: true
        }).lean();
        return testimonial;
    }
    catch (error) {
        throw error;
    }
}
exports.getTestimonialById = getTestimonialById;
const getPublishedTestimonials = async (options) => {
    try {
        const { limit = 10, page = 1, search, sort, startDate, endDate } = options;
        const query = {
            published: true
        };
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
exports.getPublishedTestimonials = getPublishedTestimonials;
