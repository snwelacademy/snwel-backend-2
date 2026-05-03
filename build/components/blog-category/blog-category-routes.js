"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogCategoryRouter = void 0;
const express_1 = require("express");
const blog_category_controller_1 = require("./blog-category-controller");
const passport_config_1 = __importDefault(require("../../config/passport-config"));
const permissionMiddleware_1 = require("../../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
exports.BlogCategoryRouter = router;
router.get('/categories', blog_category_controller_1.getAllBlogCategoriesController);
router.get('/categories/:id', blog_category_controller_1.getBlogCategoryByIdController);
router.post('/categories', passport_config_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('BLOG_CATEGORY_CREATE'), blog_category_controller_1.createBlogCategoryController);
router.put('/categories/:id', passport_config_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('BLOG_CATEGORY_UPDATE'), blog_category_controller_1.updateBlogCategoryByIdController);
router.delete('/categories/:id', passport_config_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('BLOG_CATEGORY_DELETE'), blog_category_controller_1.deleteBlogCategoryByIdController);
router.delete('/categories/hard-delete', passport_config_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('BLOG_CATEGORY_DELETE'), blog_category_controller_1.hardDeleteAllSoftDeletedBlogCategoriesController);
