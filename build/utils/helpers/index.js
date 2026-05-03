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
exports.createSlug = exports.convertSortOrder = exports.queryHandler = exports.extractListOptions = exports.generateRandomPassword = exports.getFilterQuery = exports.generateJwtToken = exports.generateOTPObject = exports.generateOTP = exports.decryptToken = exports.generateToken = exports.convertToPagination = exports.getPaginationParams = exports.withPagination = exports.parseErrorMessage = exports.validatedPassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dayjs_1 = __importDefault(require("dayjs"));
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../../config/constants");
const slugify_1 = __importDefault(require("slugify"));
async function hashPassword(password) {
    const hash = await bcrypt_1.default.hash(password, 10);
    return hash;
}
exports.hashPassword = hashPassword;
async function validatedPassword(plainPassword, hash) {
    return bcrypt_1.default.compare(plainPassword, hash);
}
exports.validatedPassword = validatedPassword;
function parseErrorMessage(error) {
    const errorMessage = error.message;
    const regex = /Error\: (\d+)\:(.*)/;
    const match = errorMessage.match(regex);
    if (match && match.length === 3) {
        const statusCode = parseInt(match[1]);
        const errorMessage = match[2];
        return { status: statusCode, message: errorMessage };
    }
    else {
        return { status: 500, message: error.message };
    }
}
exports.parseErrorMessage = parseErrorMessage;
function withPagination(qb, orderByColumn, page = 1, pageSize = 10) {
    return qb
        .orderBy(orderByColumn)
        .limit(pageSize)
        .offset((page - 1) * pageSize);
}
exports.withPagination = withPagination;
const getPaginationParams = (limit = 20, page = 1) => {
    limit = Number(limit);
    page = Number(page);
    const offset = (page - 1) * limit;
    return { limit, offset, page };
};
exports.getPaginationParams = getPaginationParams;
const convertToPagination = (data, total, limit = 20, page = 1) => {
    const offset = Math.max((page - 1) * limit, 0);
    const nextPage = page < Math.ceil(total / limit) ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;
    const hasNext = nextPage !== null;
    const currentPage = page;
    console.log(total);
    return {
        docs: data,
        limit: limit,
        offset: offset,
        total: total,
        nextPage: nextPage,
        prevPage: prevPage,
        hasNext: hasNext,
        currentPage: currentPage
    };
};
exports.convertToPagination = convertToPagination;
function generateToken(action) {
    const token = (0, uuid_1.v4)();
    return token + '|' + action;
}
exports.generateToken = generateToken;
function decryptToken(token) {
    const parts = token.split('|');
    if (parts.length === 2) {
        return parts[1];
    }
    return null;
}
exports.decryptToken = decryptToken;
function generateOTP(length = 6) {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}
exports.generateOTP = generateOTP;
function generateOTPObject({ length = 6 }) {
    const expiry = (0, dayjs_1.default)(Date.now()).add(5, 'minute').toDate();
    return {
        otp: generateOTP(length),
        expirationTime: expiry,
        verified: false,
    };
}
exports.generateOTPObject = generateOTPObject;
function generateJwtToken(payload) {
    return jsonwebtoken_1.default.sign(payload, constants_1.Constants.TOKEN_SECRET, { expiresIn: '1y' });
}
exports.generateJwtToken = generateJwtToken;
const getFilterQuery = (options) => {
    const { filter } = options;
    const query = {};
    if (filter && filter.search) {
        const searchRegex = new RegExp(filter.search, 'i');
        query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }
    return query;
};
exports.getFilterQuery = getFilterQuery;
function generateRandomPassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
    let password = "";
    for (let i = 0; i < (length || 10); i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}
exports.generateRandomPassword = generateRandomPassword;
const extractListOptions = (req) => {
    const _a = req.query, { limit, page, search, filter } = _a, rest = __rest(_a, ["limit", "page", "search", "filter"]);
    console.log({ REQQUERY: req.query });
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const parsedPage = page ? parseInt(page, 10) : 1;
    return {
        limit: parsedLimit,
        page: parsedPage,
        search: search,
        filter: filter || Object.assign({}, rest)
    };
};
exports.extractListOptions = extractListOptions;
function buildQuery(filter, searchFields) {
    const query = {};
    if ((filter === null || filter === void 0 ? void 0 : filter.search) && (searchFields === null || searchFields === void 0 ? void 0 : searchFields.length)) {
        const searchRegex = new RegExp(filter.search, 'i');
        query.$or = searchFields.map(field => ({ [field]: searchRegex }));
    }
    if (filter) {
        for (const [key, value] of Object.entries(filter)) {
            if (key !== 'search') {
                query[key] = value;
            }
        }
    }
    console.log(query);
    return query;
}
async function queryHandler(model, options) {
    const { limit = 10, page = 1, filter, sort, searchFields, search } = options;
    const { limit: parsedLimit, offset } = (0, exports.getPaginationParams)(limit, page);
    const query = buildQuery(Object.assign(Object.assign({}, filter), { search }), searchFields);
    const documents = model
        .find(query)
        .sort(sort)
        .skip(offset)
        .limit(parsedLimit);
    return {
        documents,
        limit: parsedLimit,
        offset,
        page: Number(page)
    };
}
exports.queryHandler = queryHandler;
function convertSortOrder(obj) {
    const newObj = {};
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            newObj[key] = convertSortOrder(obj[key]);
        }
        else if (obj[key] === 'asc') {
            newObj[key] = 1;
        }
        else if (obj[key] === 'desc') {
            newObj[key] = -1;
        }
        else {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}
exports.convertSortOrder = convertSortOrder;
const createSlug = (text) => {
    return (0, slugify_1.default)(text);
};
exports.createSlug = createSlug;
