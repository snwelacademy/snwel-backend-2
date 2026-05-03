"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeUserManagement = exports.RoleService = exports.ClientUserService = exports.AdminUserService = exports.RoleModel = exports.PermissionModel = exports.ClientUserRouter = exports.AdminUserRouter = void 0;
const adminUserRoutes_1 = require("./routes/adminUserRoutes");
Object.defineProperty(exports, "AdminUserRouter", { enumerable: true, get: function () { return adminUserRoutes_1.AdminUserRouter; } });
const clientUserRoutes_1 = require("./routes/clientUserRoutes");
Object.defineProperty(exports, "ClientUserRouter", { enumerable: true, get: function () { return clientUserRoutes_1.ClientUserRouter; } });
const Permission_1 = require("./models/Permission");
Object.defineProperty(exports, "PermissionModel", { enumerable: true, get: function () { return Permission_1.PermissionModel; } });
const Role_1 = require("./models/Role");
Object.defineProperty(exports, "RoleModel", { enumerable: true, get: function () { return Role_1.RoleModel; } });
var adminUserService_1 = require("./services/adminUserService");
Object.defineProperty(exports, "AdminUserService", { enumerable: true, get: function () { return adminUserService_1.AdminUserService; } });
var clientUserService_1 = require("./services/clientUserService");
Object.defineProperty(exports, "ClientUserService", { enumerable: true, get: function () { return clientUserService_1.ClientUserService; } });
var roleService_1 = require("./services/roleService");
Object.defineProperty(exports, "RoleService", { enumerable: true, get: function () { return roleService_1.RoleService; } });
const initializeUserManagement = async () => {
    try {
        const defaultPermissions = [
            { name: 'Create User', description: 'Can create new users', code: 'USER_CREATE', module: 'USER_MANAGEMENT' },
            { name: 'View Users', description: 'Can view user list', code: 'USER_VIEW', module: 'USER_MANAGEMENT' },
            { name: 'Update User', description: 'Can update user details', code: 'USER_UPDATE', module: 'USER_MANAGEMENT' },
            { name: 'Delete User', description: 'Can delete users', code: 'USER_DELETE', module: 'USER_MANAGEMENT' },
            { name: 'Assign Roles', description: 'Can assign roles to users', code: 'ROLE_ASSIGN', module: 'USER_MANAGEMENT' },
            { name: 'Create Role', description: 'Can create new roles', code: 'ROLE_CREATE', module: 'USER_MANAGEMENT' },
            { name: 'View Roles', description: 'Can view role list', code: 'ROLE_VIEW', module: 'USER_MANAGEMENT' },
            { name: 'Update Role', description: 'Can update role details', code: 'ROLE_UPDATE', module: 'USER_MANAGEMENT' },
            { name: 'Delete Role', description: 'Can delete roles', code: 'ROLE_DELETE', module: 'USER_MANAGEMENT' },
            { name: 'Create Course', description: 'Can create courses', code: 'COURSE_CREATE', module: 'COURSE_MANAGEMENT' },
            { name: 'View Courses', description: 'Can view courses', code: 'COURSE_VIEW', module: 'COURSE_MANAGEMENT' },
            { name: 'Update Course', description: 'Can update courses', code: 'COURSE_UPDATE', module: 'COURSE_MANAGEMENT' },
            { name: 'Delete Course', description: 'Can delete courses', code: 'COURSE_DELETE', module: 'COURSE_MANAGEMENT' },
            { name: 'Publish Course', description: 'Can publish courses', code: 'COURSE_PUBLISH', module: 'COURSE_MANAGEMENT' },
            { name: 'Manage Categories', description: 'Can manage course categories', code: 'CATEGORY_MANAGE', module: 'COURSE_MANAGEMENT' },
            { name: 'View Enrollments', description: 'Can view enrollments', code: 'ENROLLMENT_VIEW', module: 'COURSE_MANAGEMENT' },
            { name: 'Manage Enrollments', description: 'Can manage enrollments', code: 'ENROLLMENT_MANAGE', module: 'COURSE_MANAGEMENT' },
            { name: 'View Settings', description: 'Can view settings', code: 'SETTINGS_VIEW', module: 'SETTINGS' },
            { name: 'Update Settings', description: 'Can update settings', code: 'SETTINGS_UPDATE', module: 'SETTINGS' },
            { name: 'Upload File', description: 'Can upload files', code: 'FILE_UPLOAD', module: 'FILE' },
            { name: 'View File', description: 'Can view files', code: 'FILE_VIEW', module: 'FILE' },
            { name: 'Delete File', description: 'Can delete files', code: 'FILE_DELETE', module: 'FILE' },
            { name: 'Create Webinar', description: 'Can create webinars', code: 'WEBINAR_CREATE', module: 'WEBINAR' },
            { name: 'View Webinars', description: 'Can view webinars', code: 'WEBINAR_VIEW', module: 'WEBINAR' },
            { name: 'Update Webinar', description: 'Can update webinars', code: 'WEBINAR_UPDATE', module: 'WEBINAR' },
            { name: 'Delete Webinar', description: 'Can delete webinars', code: 'WEBINAR_DELETE', module: 'WEBINAR' },
            { name: 'Publish Webinar', description: 'Can publish webinars', code: 'WEBINAR_PUBLISH', module: 'WEBINAR' },
            { name: 'View Enquiries', description: 'Can view enquiries', code: 'ENQUIRY_VIEW', module: 'ENQUIRY' },
            { name: 'Update Enquiries', description: 'Can update enquiries', code: 'ENQUIRY_UPDATE', module: 'ENQUIRY' },
            { name: 'Delete Enquiries', description: 'Can delete enquiries', code: 'ENQUIRY_DELETE', module: 'ENQUIRY' },
            { name: 'Export Enquiries', description: 'Can export enquiries', code: 'ENQUIRY_EXPORT', module: 'ENQUIRY' },
            { name: 'Create Job', description: 'Can create job vacancies', code: 'JOB_CREATE', module: 'JOB' },
            { name: 'View Jobs', description: 'Can view job vacancies', code: 'JOB_VIEW', module: 'JOB' },
            { name: 'Update Job', description: 'Can update job vacancies', code: 'JOB_UPDATE', module: 'JOB' },
            { name: 'Delete Job', description: 'Can delete job vacancies', code: 'JOB_DELETE', module: 'JOB' },
            { name: 'Publish Job', description: 'Can publish job vacancies', code: 'JOB_PUBLISH', module: 'JOB' },
            { name: 'Create Job Category', description: 'Can create job categories', code: 'JOB_CATEGORY_CREATE', module: 'JOB_CATEGORY' },
            { name: 'View Job Categories', description: 'Can view job categories', code: 'JOB_CATEGORY_VIEW', module: 'JOB_CATEGORY' },
            { name: 'Update Job Category', description: 'Can update job categories', code: 'JOB_CATEGORY_UPDATE', module: 'JOB_CATEGORY' },
            { name: 'Delete Job Category', description: 'Can delete job categories', code: 'JOB_CATEGORY_DELETE', module: 'JOB_CATEGORY' },
            { name: 'Create Master', description: 'Can create master data', code: 'MASTER_CREATE', module: 'MASTER' },
            { name: 'View Masters', description: 'Can view master data', code: 'MASTER_VIEW', module: 'MASTER' },
            { name: 'Update Master', description: 'Can update master data', code: 'MASTER_UPDATE', module: 'MASTER' },
            { name: 'Delete Master', description: 'Can delete master data', code: 'MASTER_DELETE', module: 'MASTER' },
            { name: 'View Payments', description: 'Can view payments', code: 'PAYMENT_VIEW', module: 'PAYMENT' },
            { name: 'Refund Payments', description: 'Can refund payments', code: 'PAYMENT_REFUND', module: 'PAYMENT' },
            { name: 'Export Payments', description: 'Can export payments', code: 'PAYMENT_EXPORT', module: 'PAYMENT' },
            { name: 'View Job Applications', description: 'Can view job applications', code: 'JOB_APP_VIEW', module: 'JOB_APPLICATION' },
            { name: 'Update Job Applications', description: 'Can update job applications', code: 'JOB_APP_UPDATE', module: 'JOB_APPLICATION' },
            { name: 'Delete Job Applications', description: 'Can delete job applications', code: 'JOB_APP_DELETE', module: 'JOB_APPLICATION' },
            { name: 'Export Job Applications', description: 'Can export job applications', code: 'JOB_APP_EXPORT', module: 'JOB_APPLICATION' },
            { name: 'Send OTP', description: 'Can send OTP', code: 'OTP_SEND', module: 'OTP' },
            { name: 'View OTP', description: 'Can view OTP logs', code: 'OTP_VIEW', module: 'OTP' },
            { name: 'Create Gallery Asset', description: 'Can create gallery assets', code: 'GALLERY_CREATE', module: 'GALLERY' },
            { name: 'View Gallery', description: 'Can view gallery', code: 'GALLERY_VIEW', module: 'GALLERY' },
            { name: 'Update Gallery', description: 'Can update gallery', code: 'GALLERY_UPDATE', module: 'GALLERY' },
            { name: 'Delete Gallery', description: 'Can delete gallery', code: 'GALLERY_DELETE', module: 'GALLERY' },
            { name: 'View Integrations', description: 'Can view integrations', code: 'INTEGRATION_VIEW', module: 'INTEGRATION' },
            { name: 'Update Integrations', description: 'Can update integrations', code: 'INTEGRATION_UPDATE', module: 'INTEGRATION' },
            { name: 'View Snwel Enquiries', description: 'Can view Snwel enquiries', code: 'SNWEL_ENQUIRY_VIEW', module: 'SNWEL_ENQUIRY' },
            { name: 'Update Snwel Enquiries', description: 'Can update Snwel enquiries', code: 'SNWEL_ENQUIRY_UPDATE', module: 'SNWEL_ENQUIRY' },
            { name: 'Delete Snwel Enquiries', description: 'Can delete Snwel enquiries', code: 'SNWEL_ENQUIRY_DELETE', module: 'SNWEL_ENQUIRY' },
            { name: 'Export Snwel Enquiries', description: 'Can export Snwel enquiries', code: 'SNWEL_ENQUIRY_EXPORT', module: 'SNWEL_ENQUIRY' },
            { name: 'Create Blog', description: 'Can create blog posts', code: 'BLOG_CREATE', module: 'BLOG' },
            { name: 'View Blogs', description: 'Can view blog posts', code: 'BLOG_VIEW', module: 'BLOG' },
            { name: 'Update Blog', description: 'Can update blog posts', code: 'BLOG_UPDATE', module: 'BLOG' },
            { name: 'Delete Blog', description: 'Can delete blog posts', code: 'BLOG_DELETE', module: 'BLOG' },
            { name: 'Publish Blog', description: 'Can publish blog posts', code: 'BLOG_PUBLISH', module: 'BLOG' },
            { name: 'Create Blog Category', description: 'Can create blog categories', code: 'BLOG_CATEGORY_CREATE', module: 'BLOG_CATEGORY' },
            { name: 'View Blog Categories', description: 'Can view blog categories', code: 'BLOG_CATEGORY_VIEW', module: 'BLOG_CATEGORY' },
            { name: 'Update Blog Category', description: 'Can update blog categories', code: 'BLOG_CATEGORY_UPDATE', module: 'BLOG_CATEGORY' },
            { name: 'Delete Blog Category', description: 'Can delete blog categories', code: 'BLOG_CATEGORY_DELETE', module: 'BLOG_CATEGORY' },
            { name: 'Create Testimonial', description: 'Can create testimonials', code: 'TESTIMONIAL_CREATE', module: 'TESTIMONIAL' },
            { name: 'View Testimonials', description: 'Can view testimonials', code: 'TESTIMONIAL_VIEW', module: 'TESTIMONIAL' },
            { name: 'Update Testimonial', description: 'Can update testimonials', code: 'TESTIMONIAL_UPDATE', module: 'TESTIMONIAL' },
            { name: 'Delete Testimonial', description: 'Can delete testimonials', code: 'TESTIMONIAL_DELETE', module: 'TESTIMONIAL' },
            { name: 'Create Widget', description: 'Can create widgets', code: 'WIDGET_CREATE', module: 'WIDGET' },
            { name: 'View Widgets', description: 'Can view widgets', code: 'WIDGET_VIEW', module: 'WIDGET' },
            { name: 'Update Widget', description: 'Can update widgets', code: 'WIDGET_UPDATE', module: 'WIDGET' },
            { name: 'Delete Widget', description: 'Can delete widgets', code: 'WIDGET_DELETE', module: 'WIDGET' },
            { name: 'Create Page', description: 'Can create pages', code: 'PAGE_CREATE', module: 'PAGE' },
            { name: 'View Pages', description: 'Can view pages', code: 'PAGE_VIEW', module: 'PAGE' },
            { name: 'Update Page', description: 'Can update pages', code: 'PAGE_UPDATE', module: 'PAGE' },
            { name: 'Delete Page', description: 'Can delete pages', code: 'PAGE_DELETE', module: 'PAGE' },
            { name: 'View Analytics', description: 'Can view analytics', code: 'ANALYTICS_VIEW', module: 'ANALYTICS' },
        ];
        for (const perm of defaultPermissions) {
            await Permission_1.PermissionModel.findOneAndUpdate({ code: perm.code }, perm, { upsert: true });
        }
        const allPermissions = await Permission_1.PermissionModel.find();
        await Role_1.RoleModel.findOneAndUpdate({ name: 'SUPER_ADMIN' }, {
            name: 'SUPER_ADMIN',
            description: 'Super Administrator with all permissions',
            permissions: allPermissions.map(p => p._id),
            isSystem: true,
            isActive: true
        }, { upsert: true });
        await Role_1.RoleModel.findOneAndUpdate({ name: 'User' }, {
            name: 'User',
            description: 'Default application user',
            permissions: [],
            isSystem: true,
            isActive: true
        }, { upsert: true });
        await Role_1.RoleModel.findOneAndUpdate({ name: 'Admin' }, {
            name: 'Admin',
            description: 'Administrator role',
            permissions: [],
            isSystem: true,
            isActive: true
        }, { upsert: true });
        console.log('User Management module initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize User Management module:', error);
        throw error;
    }
};
exports.initializeUserManagement = initializeUserManagement;
