"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = void 0;
const User_1 = require("../models/User");
const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    code: 'UNAUTHORIZED',
                    message: 'User not authenticated'
                });
            }
            const reqUser = req.user;
            const rolesFromReq = Array.isArray(reqUser === null || reqUser === void 0 ? void 0 : reqUser.roles) ? reqUser.roles : [];
            const permissionsFromReq = rolesFromReq.flatMap((r) => (r === null || r === void 0 ? void 0 : r.permissions) || []);
            const hasPermissionsInReq = permissionsFromReq.length > 0 && typeof permissionsFromReq[0] === 'object';
            let hasPermission = false;
            if (hasPermissionsInReq) {
                hasPermission = rolesFromReq.some((role) => (role.permissions || []).some((p) => (p === null || p === void 0 ? void 0 : p.code) === requiredPermission));
            }
            else {
                const user = await User_1.UserModel.findById(reqUser._id).populate({
                    path: 'roles',
                    populate: {
                        path: 'permissions'
                    }
                });
                if (!user) {
                    return res.status(403).json({
                        success: false,
                        code: 'USER_NOT_FOUND',
                        message: 'User not found'
                    });
                }
                hasPermission = user.roles.some(role => role.permissions.some((permission) => permission.code === requiredPermission));
            }
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    code: 'PERMISSION_DENIED',
                    message: 'You do not have permission to perform this action',
                    requiredPermission: requiredPermission
                });
            }
            next();
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                code: 'PERMISSION_CHECK_ERROR',
                message: 'Error checking permissions',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
};
exports.checkPermission = checkPermission;
