"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMasterItem = exports.deleteMasterItemByCode = exports.updateMasterItemByCode = exports.getMasterItemByCode = exports.getAllMasterItems = exports.createMasterItem = void 0;
const MasterModel_1 = __importDefault(require("../models/MasterModel"));
const helpers_1 = require("../utils/helpers");
const mongodb_1 = require("mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
const createMasterItem = async (data) => {
    try {
        const newMasterItem = new MasterModel_1.default(data);
        return await newMasterItem.save();
    }
    catch (error) {
        throw new Error(`Error: creating master item: ${error.message}`);
    }
};
exports.createMasterItem = createMasterItem;
const getAllMasterItems = async (options) => {
    try {
        const { limit = 10, page = 1, search, filter } = options;
        let query = {};
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [{ name: searchRegex }, { code: searchRegex }];
        }
        if (filter) {
            const { ids } = filter, rest = __rest(filter, ["ids"]);
            if (Array.isArray(ids) && ids.length > 0) {
                query['_id'] = { $in: ids.map((id) => new mongodb_1.ObjectId(id)) };
            }
            query = Object.assign(Object.assign({}, query), rest);
        }
        const skip = (page - 1) * limit;
        console.log({ query });
        const masterItems = await MasterModel_1.default.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1, sequence: -1 });
        const count = await MasterModel_1.default.countDocuments(query);
        const paginationData = (0, helpers_1.getPaginationParams)(limit, page);
        return (0, helpers_1.convertToPagination)(masterItems, count, paginationData.limit, paginationData.offset);
    }
    catch (error) {
        throw new Error(`Error: retrieving master items: ${error.message}`);
    }
};
exports.getAllMasterItems = getAllMasterItems;
const getMasterItemByCode = async (code) => {
    try {
        return await MasterModel_1.default.findOne({ code });
    }
    catch (error) {
        throw new Error(`Error: retrieving master item: ${error.message}`);
    }
};
exports.getMasterItemByCode = getMasterItemByCode;
const updateMasterItemByCode = async (code, updateData) => {
    try {
        return await MasterModel_1.default.findOneAndUpdate({ _id: new mongodb_1.ObjectId(code) }, updateData, { new: true });
    }
    catch (error) {
        throw new Error(`Error: updating master item: ${error.message}`);
    }
};
exports.updateMasterItemByCode = updateMasterItemByCode;
const getMasterItem = async (identifier) => {
    try {
        if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
            return await MasterModel_1.default.findById(identifier);
        }
        else {
            return await MasterModel_1.default.findOne({ code: identifier });
        }
    }
    catch (error) {
        throw new Error(`Error: retrieving master item: ${error.message}`);
    }
};
exports.getMasterItem = getMasterItem;
const deleteMasterItemByCode = async (identifier) => {
    try {
        let query = {};
        if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
            query["_id"] = new mongodb_1.ObjectId(identifier);
        }
        else {
            query["code"] = identifier;
        }
        console.log(query);
        await MasterModel_1.default.findOneAndDelete(query);
    }
    catch (error) {
        throw new Error(`Error: deleting master item: ${error.message}`);
    }
};
exports.deleteMasterItemByCode = deleteMasterItemByCode;
