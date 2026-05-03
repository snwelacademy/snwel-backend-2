"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientUserController = void 0;
const clientUserService_1 = require("../services/clientUserService");
const catchAsync_1 = require("../../../utils/helpers/catchAsync");
const appResponse_1 = require("../../../utils/helpers/appResponse");
class ClientUserController {
}
exports.ClientUserController = ClientUserController;
_a = ClientUserController;
ClientUserController.getProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    if (!userId) {
        throw new Error('User ID is required');
    }
    const profile = await clientUserService_1.ClientUserService.getProfile(userId);
    if (!profile) {
        return (0, appResponse_1.errorResponseFromError)(new Error('Profile not found'), res);
    }
    return (0, appResponse_1.successResponse)(profile, res);
});
ClientUserController.updateProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    const updateData = req.body;
    if (!userId) {
        throw new Error('User ID is required');
    }
    const profile = await clientUserService_1.ClientUserService.updateProfile(userId, updateData);
    if (!profile) {
        return (0, appResponse_1.errorResponseFromError)(new Error('Profile not found'), res);
    }
    return (0, appResponse_1.successResponse)(profile, res, { message: 'Profile updated successfully' });
});
ClientUserController.changePassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    const { oldPassword, newPassword } = req.body;
    if (!userId) {
        throw new Error('User ID is required');
    }
    await clientUserService_1.ClientUserService.changePassword(userId, oldPassword, newPassword);
    return (0, appResponse_1.successResponse)(null, res, { message: 'Password changed successfully' });
});
ClientUserController.deleteAccount = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    const { password } = req.body;
    if (!userId) {
        throw new Error('User ID is required');
    }
    await clientUserService_1.ClientUserService.deleteAccount(userId, password);
    return (0, appResponse_1.successResponse)(null, res, { message: 'Account deleted successfully' });
});
