"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialRouter = void 0;
const express_1 = require("express");
const admin_testimonial_controller_1 = require("./admin-testimonial-controller");
const passport_config_1 = __importDefault(require("../../config/passport-config"));
const permissionMiddleware_1 = require("../../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
exports.TestimonialRouter = router;
router.post('/testimonials', passport_config_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('TESTIMONIAL_CREATE'), admin_testimonial_controller_1.createTestimonialController);
router.get('/testimonials', passport_config_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('TESTIMONIAL_VIEW'), admin_testimonial_controller_1.getAllTestimonialsController);
router.get('/testimonials/:id', passport_config_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('TESTIMONIAL_VIEW'), admin_testimonial_controller_1.getTestimonialByIdController);
router.put('/testimonials/:id', passport_config_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('TESTIMONIAL_UPDATE'), admin_testimonial_controller_1.updateTestimonialController);
router.delete('/testimonials/:id', passport_config_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('TESTIMONIAL_DELETE'), admin_testimonial_controller_1.deleteTestimonialController);
