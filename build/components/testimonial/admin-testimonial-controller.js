"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTestimonialsController = exports.deleteTestimonialController = exports.updateTestimonialController = exports.getTestimonialByIdController = exports.createTestimonialController = void 0;
const admin_testimonial_service_1 = require("./admin-testimonial-service");
const appResponse_1 = require("../../utils/helpers/appResponse");
const catchAsync_1 = require("../../utils/helpers/catchAsync");
async function createTestimonialController(req, res) {
    try {
        const testimonialData = req.body;
        const newTestimonial = await (0, admin_testimonial_service_1.adminCreateTestimonial)(testimonialData);
        (0, appResponse_1.successResponse)(newTestimonial, res, { message: 'Testimonial created successfully!' });
    }
    catch (error) {
        (0, appResponse_1.errorResponseFromError)(error, res);
    }
}
exports.createTestimonialController = createTestimonialController;
async function getTestimonialByIdController(req, res) {
    try {
        const testimonialId = req.params.id;
        const testimonial = await (0, admin_testimonial_service_1.adminGetTestimonialById)(testimonialId);
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
async function updateTestimonialController(req, res) {
    try {
        const testimonialId = req.params.id;
        const updateData = req.body;
        const updatedTestimonial = await (0, admin_testimonial_service_1.adminUpdateTestimonial)(testimonialId, updateData);
        if (!updatedTestimonial) {
            res.status(404).json({ message: 'Testimonial not found' });
            return;
        }
        (0, appResponse_1.successResponse)(updatedTestimonial, res, { message: 'Testimonial updated successfully!' });
    }
    catch (error) {
        (0, appResponse_1.errorResponseFromError)(error, res);
    }
}
exports.updateTestimonialController = updateTestimonialController;
async function deleteTestimonialController(req, res) {
    try {
        const testimonialId = req.params.id;
        await (0, admin_testimonial_service_1.adminDeleteTestimonial)(testimonialId);
        (0, appResponse_1.successResponse)({ message: 'Testimonial deleted successfully' }, res);
    }
    catch (error) {
        (0, appResponse_1.errorResponseFromError)(error, res);
    }
}
exports.deleteTestimonialController = deleteTestimonialController;
exports.getAllTestimonialsController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const options = req.query;
    const testimonials = await (0, admin_testimonial_service_1.adminGetAllTestimonials)(options);
    return (0, appResponse_1.successResponse)(testimonials, res, { message: 'Testimonials fetched successfully!' });
});
