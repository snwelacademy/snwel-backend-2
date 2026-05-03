"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseCategoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const courseCategoryController_1 = require("../controllers/courseCategoryController");
const passport_1 = __importDefault(require("passport"));
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = express_1.default.Router();
exports.CourseCategoryRouter = router;
router.get('/', courseCategoryController_1.getAllCategories);
router.get('/:id', courseCategoryController_1.getCategoryById);
router.post('/', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('CATEGORY_MANAGE'), courseCategoryController_1.createCategory);
router.put('/:id', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('CATEGORY_MANAGE'), courseCategoryController_1.updateCategoryById);
router.delete('/:id', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('CATEGORY_MANAGE'), courseCategoryController_1.deleteCategoryById);
router.patch('/attach', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('CATEGORY_MANAGE'), courseCategoryController_1.attachParent);
