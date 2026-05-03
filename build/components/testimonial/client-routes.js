"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientTestimonialRouter = void 0;
const express_1 = require("express");
const client_testimonial_controller_1 = require("./client-testimonial-controller");
const router = (0, express_1.Router)();
exports.ClientTestimonialRouter = router;
router.get('/guest/testimonials', client_testimonial_controller_1.getPublishedTestimonialsController);
router.get('/guest/testimonials/:id', client_testimonial_controller_1.getTestimonialByIdController);
