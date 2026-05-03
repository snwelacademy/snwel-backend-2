"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobVacancy = exports.deleteJobVacancyById = exports.updateJobVacancyById = exports.getJobVacancyById = exports.getAllJobVacancies = exports.createJobVacancy = void 0;
const JobVacancy_1 = __importDefault(require("../models/JobVacancy"));
const helpers_1 = require("../utils/helpers");
const mongoose_1 = __importDefault(require("mongoose"));
const createJobVacancy = async (jobData) => {
    try {
        const newJobVacancy = new JobVacancy_1.default(jobData);
        return await newJobVacancy.save();
    }
    catch (error) {
        throw new Error(`Error: creating job vacancy: ${error.message}`);
    }
};
exports.createJobVacancy = createJobVacancy;
const getAllJobVacancies = async (options) => {
    try {
        const { limit = 10, page = 1, search, filter } = options;
        const query = {};
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [{ title: searchRegex }, { companyName: searchRegex }];
        }
        if (filter && filter['location']) {
            const searchRegex = new RegExp(filter['location'], 'i');
            query.$or = [{ "location.city": searchRegex }, { "location.country": searchRegex }, { "location.state": searchRegex }];
        }
        if (filter && filter['type']) {
            query.employmentType = filter['type'];
        }
        const skip = (page - 1) * limit;
        const jobVacancies = await JobVacancy_1.default.find(query)
            .populate('categories', 'name')
            .skip(skip)
            .limit(limit)
            .exec();
        const count = await JobVacancy_1.default.countDocuments(query);
        const paginationData = (0, helpers_1.getPaginationParams)(limit, page);
        return (0, helpers_1.convertToPagination)(jobVacancies, count, paginationData.limit, paginationData.offset);
    }
    catch (error) {
        throw new Error(`Error: retrieving job vacancies: ${error.message}`);
    }
};
exports.getAllJobVacancies = getAllJobVacancies;
const getJobVacancyById = async (jobId) => {
    try {
        return await JobVacancy_1.default.findById(jobId).populate('categories', 'name');
        ;
    }
    catch (error) {
        throw new Error(`Error: retrieving job vacancy: ${error.message}`);
    }
};
exports.getJobVacancyById = getJobVacancyById;
const updateJobVacancyById = async (jobId, updateData) => {
    try {
        return await JobVacancy_1.default.findByIdAndUpdate(jobId, updateData, { new: true }).populate('categories', 'name');
        ;
    }
    catch (error) {
        throw new Error(`Error: updating job vacancy: ${error.message}`);
    }
};
exports.updateJobVacancyById = updateJobVacancyById;
const getJobVacancy = async (identifier) => {
    try {
        if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
            return await JobVacancy_1.default.findById(identifier).populate('categories', 'name');
            ;
        }
        else {
            return await JobVacancy_1.default.findOne({ slug: identifier }).populate('categories', 'name');
            ;
        }
    }
    catch (error) {
        throw new Error(`Error retrieving job vacancy: ${error.message}`);
    }
};
exports.getJobVacancy = getJobVacancy;
const deleteJobVacancyById = async (jobId) => {
    try {
        await JobVacancy_1.default.findByIdAndDelete(jobId);
    }
    catch (error) {
        throw new Error(`Error: deleting job vacancy: ${error.message}`);
    }
};
exports.deleteJobVacancyById = deleteJobVacancyById;
