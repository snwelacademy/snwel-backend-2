"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublishedTestimonialsController = exports.getTestimonialByIdController = void 0;
const client_testimonial_service_1 = require("./client-testimonial-service");
const appResponse_1 = require("../../utils/helpers/appResponse");
const catchAsync_1 = require("../../utils/helpers/catchAsync");
async function getTestimonialByIdController(req, res) {
    try {
        const testimonialId = req.params.id;
        const testimonial = await (0, client_testimonial_service_1.getTestimonialById)(testimonialId);
        if (!testimonial) {
            res.status(404).json({ message: 'Testimonial not found' });
            return;
        }
        (0, appResponse_1.successResponse)(testimonial, res);
    }
    catch (error) {
        (0, appResponse_1.errorResponseFromError)(error, res);
    }
}
exports.getTestimonialByIdController = getTestimonialByIdController;
exports.getPublishedTestimonialsController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const options = req.query;
    const testimonials = await (0, client_testimonial_service_1.getPublishedTestimonials)(options);
    return (0, appResponse_1.successResponse)(testimonials, res, { message: 'Testimonials fetched successfully!' });
});
