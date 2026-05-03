"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const passport_config_1 = __importDefault(require("../config/passport-config"));
const common_1 = require("../config/common");
const appResponse_1 = require("../utils/helpers/appResponse");
const validateSchema_1 = require("../middleware/validateSchema");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const AuthRouter = express_1.default.Router();
AuthRouter.post('/register', authController_1.register);
AuthRouter.post('/login', (0, validateSchema_1.validateSchema)(zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string().min(3) })), async (req, res, next) => {
    passport_config_1.default.authenticate('login', async (err, user, _info) => {
        try {
            if (err) {
                return next(err);
            }
            if (!user) {
                return (0, appResponse_1.errorResponse)(null, res, { status: 401, message: "Unauthenticated!" });
            }
            req.login(user, { session: false }, async (error) => {
                if (error)
                    return next(error);
                const token = jsonwebtoken_1.default.sign({ user }, common_1.CommonConfig.JWT_SECRET);
                console.log({ user });
                return res.json({ token, email: user.email, name: user.name, roles: user.roles, picture: user.profilePic, id: user === null || user === void 0 ? void 0 : user._id });
            });
        }
        catch (error) {
            return next(error);
        }
    })(req, res, next);
});
exports.default = AuthRouter;
AuthRouter.get('/me', auth_middleware_1.authenticateJWT, (req, res) => {
    const u = req.user;
    const roles = ((u === null || u === void 0 ? void 0 : u.roles) || []).map((r) => ({
        _id: r === null || r === void 0 ? void 0 : r._id,
        name: r === null || r === void 0 ? void 0 : r.name
    }));
    const permissionCodes = Array.from(new Set(((u === null || u === void 0 ? void 0 : u.roles) || []).flatMap((r) => ((r === null || r === void 0 ? void 0 : r.permissions) || []).map((p) => p === null || p === void 0 ? void 0 : p.code)).filter(Boolean)));
    return res.json({
        id: u === null || u === void 0 ? void 0 : u._id,
        email: u === null || u === void 0 ? void 0 : u.email,
        name: u === null || u === void 0 ? void 0 : u.name,
        roles,
        permissions: permissionCodes,
        picture: u === null || u === void 0 ? void 0 : u.profilePic
    });
});
