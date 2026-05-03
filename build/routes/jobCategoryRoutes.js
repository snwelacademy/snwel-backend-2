"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobCategoryRouter = void 0;
const express_1 = require("express");
const jobCategoryController_1 = require("../controllers/jobCategoryController");
const validateSchema_1 = require("../middleware/validateSchema");
const job_category_1 = require("../entity-schema/job-category");
const passport_1 = __importDefault(require("passport"));
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
exports.JobCategoryRouter = router;
router.get('/', jobCategoryController_1.getAllJobCategoriesController);
router.get('/:id', jobCategoryController_1.getJobCategoryByIdController);
router.post('/', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('JOB_CATEGORY_CREATE'), (0, validateSchema_1.validateSchema)(job_category_1.createJobCategorySchema), jobCategoryController_1.createJobCategoryController);
router.put('/:id', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('JOB_CATEGORY_UPDATE'), (0, validateSchema_1.validateSchema)(job_category_1.updateJobCategorySchema), jobCategoryController_1.updateJobCategoryByIdController);
router.delete('/:id', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('JOB_CATEGORY_DELETE'), jobCategoryController_1.deleteJobCategoryByIdController);
