"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.updateUser = exports.listUsers = exports.getUserById = exports.getUserByEmail = exports.verifyLogin = exports.registerUser = void 0;
const logger_1 = require("../utils/logger");
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const helpers_1 = require("../utils/helpers");
const mongodb_1 = require("mongodb");
const Role_1 = require("../modules/UserManagement/models/Role");
const constants_1 = require("../config/constants");
async function registerUser(userData) {
    const { name, email, password, phone, roles, location } = userData;
    try {
        const existingUser = await User_1.UserModel.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }
        let roleIds = [];
        if (roles && roles.length > 0) {
            roleIds = await Role_1.RoleModel.find({
                name: { $in: roles }
            }).distinct('_id');
        }
        else {
            const defaultRole = await Role_1.RoleModel.findOne({
                name: constants_1.Constants.ROLES.USER
            });
            if (defaultRole) {
                roleIds = [defaultRole._id];
            }
            else {
                const createdDefaultRole = await Role_1.RoleModel.findOneAndUpdate({ name: constants_1.Constants.ROLES.USER }, { name: constants_1.Constants.ROLES.USER, description: 'Default application user', permissions: [], isSystem: true, isActive: true }, { upsert: true, new: true });
                if (createdDefaultRole) {
                    roleIds = [createdDefaultRole._id];
                }
            }
        }
        if (roleIds.length === 0) {
            const fallbackRole = await Role_1.RoleModel.findOne({ name: { $in: [constants_1.Constants.ROLES.USER, 'USER', 'user'] } });
            if (fallbackRole) {
                roleIds = [fallbackRole._id];
            }
        }
        if (roleIds.length === 0) {
            throw new Error('No valid roles found');
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const createdUser = await User_1.UserModel.create({
            name,
            email,
            password: hashedPassword,
            phone,
            roles: roleIds,
            location,
            courses: [],
            webinars: [],
            appliedJobs: [],
        });
        return await User_1.UserModel.findById(createdUser._id)
            .populate('roles', 'name permissions');
    }
    catch (error) {
        logger_1.logger.error('Error in registerUser:', error);
        throw error;
    }
}
exports.registerUser = registerUser;
async function verifyLogin(loginData) {
    const { email, password } = loginData;
    const user = await User_1.UserModel.findOne({ email })
        .populate({
        path: 'roles',
        select: 'name permissions',
        populate: {
            path: 'permissions',
            select: 'code'
        }
    });
    console.log("verifyLogin 222", user === null || user === void 0 ? void 0 : user.roles[0].permissions);
    if (!user) {
        return {
            isValid: false,
            user: null
        };
    }
    const isValidPassword = await bcrypt_1.default.compare(password, user.password);
    if (!isValidPassword) {
        return {
            isValid: false,
            user: null
        };
    }
    return {
        isValid: true,
        user
    };
}
exports.verifyLogin = verifyLogin;
async function getUserByEmail(email) {
    const user = await User_1.UserModel.findOne({ email }).populate('roles', 'name permissions');
    return user;
}
exports.getUserByEmail = getUserByEmail;
async function getUserById(id) {
    const user = await User_1.UserModel.findOne({ _id: new mongodb_1.ObjectId(id) }).populate('roles', 'name permissions');
    return user;
}
exports.getUserById = getUserById;
async function listUsers(options) {
    const { limit = 10, page = 1, filter } = options;
    const query = {};
    const paginationData = (0, helpers_1.getPaginationParams)(limit, page);
    if (filter && filter.search) {
        const searchRegex = new RegExp(filter.search, 'i');
        query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }
    if (filter && filter.roles) {
        query.roles = { $in: filter.roles.map(id => new mongodb_1.ObjectId(id)) };
    }
    const skip = (page - 1) * limit;
    const users = await User_1.UserModel.find(query)
        .populate('roles', 'name permissions')
        .skip(skip)
        .limit(limit);
    const count = await User_1.UserModel.countDocuments(query);
    return (0, helpers_1.convertToPagination)(users, count, paginationData.limit, paginationData.offset);
}
exports.listUsers = listUsers;
async function updateUser(userData) {
    const { userId, updates } = userData;
    try {
        const updatedUser = await User_1.UserModel.findByIdAndUpdate(userId, updates, { new: true });
        return updatedUser;
    }
    catch (error) {
        console.error('Error updating user:', error);
        return null;
    }
}
exports.updateUser = updateUser;
async function me(userId) {
    const user = await User_1.UserModel.findOne({ _id: userId })
        .select(['name', 'email', 'phone', 'roles', 'profilePic', 'location'])
        .populate('roles', 'name permissions');
    return user;
}
exports.me = me;
