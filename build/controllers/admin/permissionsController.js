"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAllPermissionsFlat = exports.listAllPermissions = void 0;
const catchAsync_1 = require("../../utils/helpers/catchAsync");
const appResponse_1 = require("../../utils/helpers/appResponse");
const UserManagement_1 = require("../../modules/UserManagement");
exports.listAllPermissions = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const permissions = await UserManagement_1.PermissionModel.find().sort({ module: 1, code: 1 }).lean();
    const categoryMap = {
        USER_MANAGEMENT: 'User & Access',
        COURSE_MANAGEMENT: 'Content Management',
        SETTINGS: 'System & Settings',
        FILE: 'Content Management',
        WEBINAR: 'Content Management',
        ENQUIRY: 'Enrollments & Enquiries',
        JOB: 'Jobs & Recruitment',
        JOB_CATEGORY: 'Jobs & Recruitment',
        MASTER: 'System & Settings',
        PAYMENT: 'Enrollments & Enquiries',
        JOB_APPLICATION: 'Jobs & Recruitment',
        OTP: 'System & Settings',
        GALLERY: 'Content Management',
        INTEGRATION: 'System & Settings',
        SNWEL_ENQUIRY: 'Enrollments & Enquiries',
        BLOG: 'Content Management',
        BLOG_CATEGORY: 'Content Management',
        WIDGET: 'System & Settings',
        ANALYTICS: 'System & Settings',
    };
    const formattedPermissions = permissions.map((perm) => ({
        code: perm.code,
        name: perm.name,
        category: categoryMap[perm.module] || 'Other',
        description: perm.description || `Ability to ${perm.name.toLowerCase()}`,
    }));
    const categories = Array.from(new Set(formattedPermissions.map((p) => p.category)));
    (0, appResponse_1.successResponse)({
        permissions: formattedPermissions,
        categories,
    }, res, { message: 'Permissions fetched successfully' });
});
exports.listAllPermissionsFlat = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const permissions = await UserManagement_1.PermissionModel.find()
        .select('code name description module -_id')
        .sort({ module: 1, code: 1 })
        .lean();
    res.status(200).json({
        success: true,
        data: permissions,
    });
});
