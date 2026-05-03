"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const localStrategy = require('passport-local').Strategy;
const User_1 = require("../models/User");
const common_1 = require("./common");
const userService_1 = require("../service/userService");
const jwtOptions = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: common_1.CommonConfig.JWT_SECRET,
    session: false
};
passport_1.default.use('login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const result = await (0, userService_1.verifyLogin)({ email, password });
        if (!(result === null || result === void 0 ? void 0 : result.isValid) || !result.user) {
            return done(null, false);
        }
        return done(null, result.user, { message: 'Logged in Successfully' });
    }
    catch (error) {
        return done(error);
    }
}));
passport_1.default.use(new passport_jwt_1.Strategy(jwtOptions, async (jwtPayload, done) => {
    try {
        const user = await User_1.UserModel.findById(jwtPayload.user._id)
            .populate({
            path: 'roles',
            select: 'name permissions',
            populate: { path: 'permissions', select: 'code name' }
        });
        if (user) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    }
    catch (error) {
        console.log("Error", error);
        return done(error, false);
    }
}));
exports.default = passport_1.default;
