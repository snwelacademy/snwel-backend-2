"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRouter = void 0;
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const courseController_1 = require("../controllers/courseController");
const router = express_1.default.Router();
exports.CourseRouter = router;
router.get('/', courseController_1.getAllCoursesController);
router.post('/', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('COURSE_CREATE'), courseController_1.createCourseController);
router.get('/byId/:courseId', courseController_1.getCourseByIdController);
router.put('/partial-update/:courseId', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('COURSE_UPDATE'), courseController_1.partialUpdateCourseController);
router.put('/:courseId', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('COURSE_UPDATE'), courseController_1.updateCourseController);
router.delete('/:courseId', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('COURSE_DELETE'), courseController_1.deleteCourseController);
router.get('/:slug', courseController_1.getCourseBySlugController);
