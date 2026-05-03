"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBlogs = exports.getBlogById = void 0;
const blog_model_1 = __importDefault(require("./blog-model"));
const helpers_1 = require("../../utils/helpers");
const mongoose_1 = require("mongoose");
async function getBlogById(blogId) {
    try {
        const query = mongoose_1.Types.ObjectId.isValid(blogId)
            ? { _id: blogId }
            : { slug: blogId };
        query.published = true;
        const blog = await blog_model_1.default.findOne(query).populate('author', '_id profilePic name email').lean();
        return blog;
    }
    catch (error) {
        throw error;
    }
}
exports.getBlogById = getBlogById;
const getAllBlogs = async (options) => {
    try {
        const { limit = 10, page = 1, search, sort, startDate, endDate } = options;
        const query = {
            published: true
        };
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [{ title: searchRegex }, { content: searchRegex }, { author: searchRegex }];
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
        const blogs = await blog_model_1.default.paginate(query, {
            page,
            limit,
            sort: sort ? (0, helpers_1.convertSortOrder)(sort) : { createdAt: -1 },
            populate: [
                {
                    path: 'category',
                    select: "_id name slug"
                }
            ]
        });
        return blogs;
    }
    catch (error) {
        throw new Error(`Error retrieving blogs: ${error.message}`);
    }
};
exports.getAllBlogs = getAllBlogs;
